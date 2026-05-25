// server/controllers/orderController.js
import crypto from 'crypto'
import mongoose from 'mongoose'
import { validationResult } from 'express-validator'
import Coupon from '../models/Coupon.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { createError } from '../middleware/errorMiddleware.js'
import { creditFixedNXL, creditNXL, deductNXL } from '../services/nxlService.js'
import { sendOrderConfirmEmail } from '../services/emailService.js'

const throwIfInvalid = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw createError(422, 'Validation failed', errors.array().map((error) => error.msg))
}

const couponDiscount = (coupon, subtotal) =>
  coupon.discountType === 'percent'
    ? Math.round((subtotal * coupon.discountValue) / 100)
    : Math.min(coupon.discountValue, subtotal)

const getValidCoupon = async (code, subtotal, userId) => {
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() })
  if (!coupon) throw createError(404, 'Coupon not found')
  if (!coupon.isActive || coupon.expiresAt < new Date()) throw createError(400, 'Coupon is expired or inactive')
  if (coupon.usedCount >= coupon.maxUses) throw createError(400, 'Coupon usage limit reached')
  if (coupon.usedBy.some((usedUser) => String(usedUser) === String(userId))) throw createError(400, 'You have already used this coupon')
  if (subtotal < coupon.minOrderAmount) throw createError(400, `Minimum order amount Rs. ${coupon.minOrderAmount} required for this coupon`)
  return coupon
}

const verifyRazorpay = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) throw createError(400, 'Payment verification failed')
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
  if (expected !== razorpay_signature) throw createError(400, 'Payment verification failed')
}

export const validateCoupon = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const subtotal = Number(req.body.subtotal)
    const coupon = await getValidCoupon(req.body.code, subtotal, req.user._id)
    const discount = couponDiscount(coupon, subtotal)
    res.status(200).json({
      success: true,
      data: {
        valid: true,
        coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
        discount,
        finalAmount: subtotal - discount,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const placeOrder = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    throwIfInvalid(req)
    const { items, shippingAddress, paymentMethod, couponCode, nxlToUse = 0, paymentId } = req.body
    const productIds = items.map((item) => item.product || item.productId || item._id)
    const products = await Product.find({ _id: { $in: productIds } }).session(session)

    const orderItems = items.map((item) => {
      const product = products.find((found) => String(found._id) === String(item.product || item.productId || item._id))
      if (!product || product.isActive === false) throw createError(400, `Product ${item.name || item.product} is no longer available`)
      if (product.stock < Number(item.quantity)) throw createError(400, `Only ${product.stock} units of ${product.name} available`)
      return { product: product._id, quantity: Number(item.quantity), price: product.price, name: product.name }
    })

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let discount = 0
    let coupon
    if (couponCode) {
      coupon = await getValidCoupon(couponCode, subtotal, req.user._id)
      discount = couponDiscount(coupon, subtotal)
    }

    let total = Math.max(subtotal - discount, 0)
    if (Number(nxlToUse) > 0) {
      const user = await User.findById(req.user._id).select('nxlCredits').session(session)
      if (Number(nxlToUse) > user.nxlCredits) throw createError(400, 'Insufficient NXL credits')
      if (Number(nxlToUse) > total) throw createError(400, 'NXL credits cannot exceed order total')
      await deductNXL(req.user._id, Number(nxlToUse), 'NXL used on order checkout', 'pending-order')
      total -= Number(nxlToUse)
    }

    if (paymentMethod === 'razorpay' && total > 0) verifyRazorpay(req.body)
    if (paymentMethod === 'stripe' && total > 0 && !paymentId) throw createError(400, 'Payment not completed')

    const [order] = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          subtotal,
          discount,
          nxlUsed: Number(nxlToUse),
          total,
          paymentMethod,
          paymentId: paymentId || req.body.razorpay_payment_id,
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          couponCode: coupon?.code,
        },
      ],
      { session }
    )

    await Promise.all(orderItems.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity, sold: item.quantity } }, { session })))
    if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 }, $push: { usedBy: req.user._id } }, { session })

    await session.commitTransaction()
    const nxlEarned = await creditNXL(req.user._id, order.total, `NXL earned on order #${order._id}`, order._id)
    sendOrderConfirmEmail(req.user.email, order)

    res.status(201).json({ success: true, data: { order, nxlEarned } })
  } catch (error) {
    await session.abortTransaction()
    next(error)
  } finally {
    session.endSession()
  }
}

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product', 'name images slug').sort({ createdAt: -1 }).lean()
    res.status(200).json({ success: true, data: { orders } })
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images slug').lean()
    if (!order) throw createError(404, 'Order not found')
    if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') throw createError(403, 'Access denied')
    res.status(200).json({ success: true, data: { order } })
  } catch (error) {
    next(error)
  }
}

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) throw createError(404, 'Order not found')
    if (String(order.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (!['pending', 'confirmed'].includes(order.orderStatus)) throw createError(400, 'Order cannot be cancelled at this stage')

    order.orderStatus = 'cancelled'
    await Promise.all([
      order.save(),
      ...order.items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, sold: -item.quantity } })),
      order.nxlUsed ? creditFixedNXL(order.user, order.nxlUsed, `NXL refunded for cancelled order #${order._id}`, order._id) : Promise.resolve(),
    ])

    res.status(200).json({ success: true, data: { order }, message: 'Order cancelled' })
  } catch (error) {
    next(error)
  }
}
