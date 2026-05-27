// server/controllers/paymentController.js
import { body, param, validationResult } from 'express-validator'
import Order from '../models/Order.js'
import Registration from '../models/Registration.js'
import Tournament from '../models/Tournament.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'
import PaymentEvent from '../models/PaymentEvent.js'
import { createError } from '../middleware/errorMiddleware.js'
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  initiateRazorpayRefund,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from '../services/razorpayService.js'
import { createPaymentIntent, createStripeRefund, retrievePaymentIntent, verifyStripeWebhook } from '../services/stripeService.js'
import { creditFixedNXL, creditNXL, deductNXL } from '../services/nxlService.js'
import { sendOrderConfirmEmail } from '../services/emailService.js'
import { sendQRPassEmail } from '../services/emailService.js'
import { generateInvoicePDF } from '../services/invoiceService.js'
import { generateQRDataURL, generateQRToken } from '../services/qrService.js'
import { generateReceipt, validatePaymentAmount } from '../utils/paymentHelpers.js'

const throwIfInvalid = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw createError(422, 'Validation failed', errors.array().map((error) => error.msg))
}

const logEvent = async ({ provider, eventType, order, orderRef, paymentRef, status = 'received', payload, message }) => {
  try {
    await PaymentEvent.create({ provider, eventType, order, orderRef, paymentRef, status, payload, message })
  } catch (_error) {}
}

const runPostPaymentEffects = async (orderDoc) => {
  await Promise.all(
    (orderDoc.items || []).map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -Number(item.quantity || 0), sold: Number(item.quantity || 0) } }
      )
    )
  )
  if (orderDoc.couponCode) {
    await Coupon.updateOne(
      { code: orderDoc.couponCode },
      { $inc: { usedCount: 1 }, $addToSet: { usedBy: orderDoc.user } }
    )
  }
}

const markPaidAndFinalize = async ({ order, paymentId, paymentMethod, skipNxlCredit = false }) => {
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $ne: 'paid' } },
    {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      paymentId,
      paymentMethod,
      paidAt: new Date(),
    },
    { new: true }
  )
  if (!updated) return { alreadyPaid: true, order: await Order.findById(order._id) }

  await runPostPaymentEffects(updated)
  if (!skipNxlCredit) {
    await creditNXL(updated.user, updated.total, `NXL earned on order #${updated._id}`, updated._id)
  }

  if (!updated.invoiceUrl) {
    try {
      const invoiceUrl = await generateInvoicePDF(updated._id)
      updated.invoiceUrl = invoiceUrl
      await updated.save()
    } catch (_error) {}
  }

  const user = await User.findById(updated.user).select('email')
  if (user?.email) sendOrderConfirmEmail(user.email, updated)
  return { alreadyPaid: false, order: updated }
}

const markRegistrationPaidAndFinalize = async ({ registration, paymentId, paymentMethod, skipNxlCredit = false }) => {
  const updated = await Registration.findOneAndUpdate(
    { _id: registration._id, paymentStatus: { $ne: 'paid' } },
    { paymentStatus: 'paid', paymentId, paymentMethod, paidAt: new Date() },
    { new: true }
  )
  if (!updated) return { alreadyPaid: true, registration: await Registration.findById(registration._id) }

  const tournament = await Tournament.findById(updated.tournament)
  if (!updated.qrToken) {
    updated.qrToken = await generateQRToken()
    await updated.save()
  }

  await Promise.all([
    Tournament.updateOne({ _id: updated.tournament }, { $inc: { filledSlots: 1 } }),
    tournament?.nxlReward && !skipNxlCredit
      ? creditFixedNXL(updated.user, tournament.nxlReward, `NXL earned - ${tournament.name} registration`, tournament._id)
      : Promise.resolve(),
    generateQRDataURL(updated.qrToken),
  ])

  const user = await User.findById(updated.user).select('email')
  if (user?.email && tournament) sendQRPassEmail(user.email, updated, tournament)
  return { alreadyPaid: false, registration: updated, qrToken: updated.qrToken }
}

export const paymentValidations = {
  createRazorpayOrder: [body('orderId').isMongoId()],
  verifyRazorpayPayment: [
    body('orderId').isMongoId(),
    body('razorpayOrderId').trim().notEmpty(),
    body('razorpayPaymentId').trim().notEmpty(),
    body('razorpaySignature').trim().notEmpty(),
  ],
  createStripeIntent: [body('orderId').isMongoId()],
  verifyStripePayment: [body('orderId').isMongoId(), body('paymentIntentId').trim().notEmpty()],
  processNxlPayment: [body('orderId').isMongoId(), body('nxlAmount').isInt({ min: 1 })],
  getInvoice: [param('orderId').isMongoId()],
  initiateRefund: [param('orderId').isMongoId(), body('reason').optional().trim().isLength({ min: 3 })],
  createTournamentRazorpayOrder: [body('registrationId').isMongoId()],
  verifyTournamentRazorpayPayment: [
    body('registrationId').isMongoId(),
    body('razorpayOrderId').trim().notEmpty(),
    body('razorpayPaymentId').trim().notEmpty(),
    body('razorpaySignature').trim().notEmpty(),
  ],
  createTournamentStripeIntent: [body('registrationId').isMongoId()],
  verifyTournamentStripePayment: [body('registrationId').isMongoId(), body('paymentIntentId').trim().notEmpty()],
}

export const createRazorpayOrderHandler = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const order = await Order.findById(req.body.orderId)
    if (!order) throw createError(404, 'Order not found')
    if (String(order.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (order.paymentStatus !== 'pending') throw createError(400, 'Order is not pending payment')

    const razorpayOrder = await createRazorpayOrder(order.total, 'INR', generateReceipt(req.user._id))
    order.razorpayOrderId = razorpayOrder.id
    await order.save()

    res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      message: 'Razorpay order created',
    })
  } catch (error) {
    next(error)
  }
}

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) {
      await logEvent({ provider: 'razorpay', eventType: 'verify', orderRef: orderId, paymentRef: razorpayPaymentId, status: 'failed', message: 'Invalid payment signature' })
      throw createError(400, 'Payment verification failed. Invalid signature.')
    }

    const order = await Order.findById(orderId)
    if (!order) throw createError(404, 'Order not found')
    if (String(order.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (order.razorpayOrderId !== razorpayOrderId) throw createError(400, 'Order ID mismatch')

    const payment = await fetchRazorpayPayment(razorpayPaymentId)
    if (payment.status !== 'captured') throw createError(400, 'Payment not captured')
    if (!validatePaymentAmount(Number(payment.amount || 0) / 100, order.total)) throw createError(400, 'Paid amount mismatch')

    const result = await markPaidAndFinalize({ order, paymentId: razorpayPaymentId, paymentMethod: 'razorpay' })
    await logEvent({ provider: 'razorpay', eventType: 'verify', order: order._id, orderRef: orderId, paymentRef: razorpayPaymentId, status: 'processed' })

    res.status(200).json({
      success: true,
      data: { orderId: order._id, invoiceUrl: result.order?.invoiceUrl || order.invoiceUrl },
      message: result.alreadyPaid ? 'Payment already recorded' : 'Payment verified successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const createTournamentRazorpayOrder = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const registration = await Registration.findById(req.body.registrationId).populate('tournament')
    if (!registration) throw createError(404, 'Registration not found')
    if (String(registration.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (registration.paymentStatus !== 'pending') throw createError(400, 'Registration is not pending payment')
    const amount = Number(registration.tournament?.entryFee || 0)
    if (amount <= 0) throw createError(400, 'No payable amount for this registration')

    const razorpayOrder = await createRazorpayOrder(amount, 'INR', generateReceipt(req.user._id))
    registration.razorpayOrderId = razorpayOrder.id
    await registration.save()
    res.status(200).json({
      success: true,
      data: { razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, keyId: process.env.RAZORPAY_KEY_ID },
      message: 'Tournament Razorpay order created',
    })
  } catch (error) {
    next(error)
  }
}

export const verifyTournamentRazorpayPayment = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { registrationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      throw createError(400, 'Payment verification failed. Invalid signature.')
    }
    const registration = await Registration.findById(registrationId).populate('tournament')
    if (!registration) throw createError(404, 'Registration not found')
    if (String(registration.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (registration.razorpayOrderId !== razorpayOrderId) throw createError(400, 'Order ID mismatch')
    const payment = await fetchRazorpayPayment(razorpayPaymentId)
    if (payment.status !== 'captured') throw createError(400, 'Payment not captured')
    if (!validatePaymentAmount(Number(payment.amount || 0) / 100, Number(registration.tournament?.entryFee || 0))) throw createError(400, 'Paid amount mismatch')

    const result = await markRegistrationPaidAndFinalize({ registration, paymentId: razorpayPaymentId, paymentMethod: 'razorpay' })
    res.status(200).json({
      success: true,
      data: { registrationId: registration._id, qrToken: result.registration?.qrToken },
      message: result.alreadyPaid ? 'Payment already recorded' : 'Tournament payment verified successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const rawBody = req.rawBody || req.body
    const valid = verifyWebhookSignature(rawBody, signature)
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid webhook signature' })

    const event = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : '{}')
    const eventType = event.event
    const paymentEntity = event.payload?.payment?.entity || {}
    const razorpayOrderId = paymentEntity.order_id
    const paymentId = paymentEntity.id
    const order = razorpayOrderId ? await Order.findOne({ razorpayOrderId }) : null
    const registration = !order && razorpayOrderId ? await Registration.findOne({ razorpayOrderId }).populate('tournament') : null

    await logEvent({
      provider: 'razorpay',
      eventType,
      order: order?._id,
      orderRef: String(order?._id || registration?._id || ''),
      paymentRef: paymentId,
      payload: event,
    })

    if (order) {
      if (eventType === 'payment.captured') {
        await markPaidAndFinalize({ order, paymentId, paymentMethod: 'razorpay' })
      } else if (eventType === 'payment.failed') {
        await Order.updateOne({ _id: order._id, paymentStatus: { $ne: 'paid' } }, { paymentStatus: 'failed' })
      } else if (eventType === 'refund.processed') {
        await Order.updateOne(
          { paymentId },
          { orderStatus: 'cancelled', refundStatus: 'processed', paymentStatus: 'failed' }
        )
      }
    } else if (registration) {
      if (eventType === 'payment.captured') {
        await markRegistrationPaidAndFinalize({ registration, paymentId, paymentMethod: 'razorpay' })
      } else if (eventType === 'payment.failed') {
        await Registration.updateOne({ _id: registration._id, paymentStatus: { $ne: 'paid' } }, { paymentStatus: 'pending' })
      }
    }
    res.status(200).json({ success: true, data: { received: true }, message: 'Webhook received' })
  } catch (error) {
    next(error)
  }
}

export const createStripePaymentIntent = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const order = await Order.findById(req.body.orderId)
    if (!order) throw createError(404, 'Order not found')
    if (String(order.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (order.paymentStatus !== 'pending') throw createError(400, 'Order is not pending payment')

    const intent = await createPaymentIntent(order.total, 'inr', {
      orderId: String(order._id),
      userId: String(req.user._id),
    })
    order.stripePaymentIntentId = intent.id
    await order.save()

    res.status(200).json({
      success: true,
      data: { clientSecret: intent.client_secret, amount: order.total, currency: 'inr' },
      message: 'Stripe intent created',
    })
  } catch (error) {
    next(error)
  }
}

export const verifyStripePayment = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { paymentIntentId, orderId } = req.body
    const intent = await retrievePaymentIntent(paymentIntentId)
    if (intent.status !== 'succeeded') throw createError(400, `Payment not completed. Status: ${intent.status}`)
    if (intent.metadata?.orderId !== orderId) throw createError(400, 'Order mismatch')

    const order = await Order.findById(orderId)
    if (!order) throw createError(404, 'Order not found')
    if (String(order.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (!validatePaymentAmount(Number(intent.amount_received || 0) / 100, order.total)) throw createError(400, 'Paid amount mismatch')

    const result = await markPaidAndFinalize({ order, paymentId: paymentIntentId, paymentMethod: 'stripe' })
    await logEvent({ provider: 'stripe', eventType: 'verify', order: order._id, orderRef: orderId, paymentRef: paymentIntentId, status: 'processed' })
    res.status(200).json({
      success: true,
      data: { orderId: order._id, invoiceUrl: result.order?.invoiceUrl || order.invoiceUrl },
      message: result.alreadyPaid ? 'Payment already recorded' : 'Payment verified successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const createTournamentStripeIntent = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const registration = await Registration.findById(req.body.registrationId).populate('tournament')
    if (!registration) throw createError(404, 'Registration not found')
    if (String(registration.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (registration.paymentStatus !== 'pending') throw createError(400, 'Registration is not pending payment')
    const amount = Number(registration.tournament?.entryFee || 0)
    if (amount <= 0) throw createError(400, 'No payable amount for this registration')
    const intent = await createPaymentIntent(amount, 'inr', { registrationId: String(registration._id), userId: String(req.user._id) })
    registration.stripePaymentIntentId = intent.id
    await registration.save()
    res.status(200).json({
      success: true,
      data: { clientSecret: intent.client_secret, amount, currency: 'inr' },
      message: 'Tournament Stripe intent created',
    })
  } catch (error) {
    next(error)
  }
}

export const verifyTournamentStripePayment = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { registrationId, paymentIntentId } = req.body
    const intent = await retrievePaymentIntent(paymentIntentId)
    if (intent.status !== 'succeeded') throw createError(400, `Payment not completed. Status: ${intent.status}`)
    if (intent.metadata?.registrationId !== registrationId) throw createError(400, 'Registration mismatch')

    const registration = await Registration.findById(registrationId).populate('tournament')
    if (!registration) throw createError(404, 'Registration not found')
    if (String(registration.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (!validatePaymentAmount(Number(intent.amount_received || 0) / 100, Number(registration.tournament?.entryFee || 0))) throw createError(400, 'Paid amount mismatch')

    const result = await markRegistrationPaidAndFinalize({ registration, paymentId: paymentIntentId, paymentMethod: 'stripe' })
    res.status(200).json({
      success: true,
      data: { registrationId: registration._id, qrToken: result.registration?.qrToken },
      message: result.alreadyPaid ? 'Payment already recorded' : 'Tournament payment verified successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature']
    let event
    try {
      event = verifyStripeWebhook(req.rawBody || req.body, signature)
    } catch (error) {
      return res.status(400).json({ success: false, message: `Webhook signature failed: ${error.message}` })
    }
    const eventType = event.type
    const intent = event.data?.object || {}
    const order = await Order.findOne({ stripePaymentIntentId: intent.id })
    const registration = !order ? await Registration.findOne({ stripePaymentIntentId: intent.id }).populate('tournament') : null
    await logEvent({
      provider: 'stripe',
      eventType,
      order: order?._id,
      orderRef: String(order?._id || registration?._id || ''),
      paymentRef: intent.id,
      payload: event,
    })

    if (order && eventType === 'payment_intent.succeeded') {
      await markPaidAndFinalize({ order, paymentId: intent.id, paymentMethod: 'stripe' })
    } else if (order && eventType === 'payment_intent.payment_failed') {
      await Order.updateOne({ _id: order._id, paymentStatus: { $ne: 'paid' } }, { paymentStatus: 'failed' })
    } else if (registration && eventType === 'payment_intent.succeeded') {
      await markRegistrationPaidAndFinalize({ registration, paymentId: intent.id, paymentMethod: 'stripe' })
    } else if (registration && eventType === 'payment_intent.payment_failed') {
      await Registration.updateOne({ _id: registration._id, paymentStatus: { $ne: 'paid' } }, { paymentStatus: 'pending' })
    }
    res.status(200).json({ success: true, data: { received: true }, message: 'Webhook received' })
  } catch (error) {
    next(error)
  }
}

export const processNxlPayment = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const order = await Order.findById(req.body.orderId)
    if (!order) throw createError(404, 'Order not found')
    if (String(order.user) !== String(req.user._id)) throw createError(403, 'Access denied')
    if (order.paymentStatus !== 'pending') throw createError(400, 'Order is not pending payment')

    const nxlAmount = Number(req.body.nxlAmount || 0)
    const user = await User.findById(req.user._id).select('nxlCredits')
    if (!user) throw createError(404, 'User not found')
    if (nxlAmount > order.total) throw createError(400, 'NXL amount cannot exceed order total')
    if (user.nxlCredits <= 0 || user.nxlCredits < nxlAmount) throw createError(400, `Insufficient NXL credits. Available: ${user.nxlCredits || 0}`)

    await deductNXL(req.user._id, nxlAmount, `NXL payment for order #${order._id}`, order._id)

    if (nxlAmount === order.total) {
      const result = await markPaidAndFinalize({ order, paymentId: `NXL-${Date.now()}`, paymentMethod: 'nxl', skipNxlCredit: true })
      await logEvent({ provider: 'nxl', eventType: 'payment.full', order: order._id, orderRef: String(order._id), paymentRef: `NXL-${order._id}`, status: 'processed' })
      return res.status(200).json({
        success: true,
        data: {
          orderId: order._id,
          nxlUsed: nxlAmount,
          remaining: 0,
          requiresGateway: false,
          invoiceUrl: result.order?.invoiceUrl,
        },
        message: 'Order paid with NXL credits',
      })
    }

    const remaining = Number(order.total) - nxlAmount
    order.nxlUsed = (order.nxlUsed || 0) + nxlAmount
    order.total = remaining
    order.partialNxlApplied = true
    await order.save()
    await logEvent({ provider: 'nxl', eventType: 'payment.partial', order: order._id, orderRef: String(order._id), paymentRef: `NXL-PARTIAL-${order._id}`, status: 'processed' })

    res.status(200).json({
      success: true,
      data: { orderId: order._id, nxlUsed: order.nxlUsed, remaining, requiresGateway: true },
      message: 'NXL credits applied. Complete payment via gateway.',
    })
  } catch (error) {
    next(error)
  }
}

export const getInvoice = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const order = await Order.findById(req.params.orderId)
    if (!order) throw createError(404, 'Order not found')
    if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') throw createError(403, 'Access denied')

    if (!order.invoiceUrl) {
      order.invoiceUrl = await generateInvoicePDF(order._id)
      await order.save()
    }

    res.status(200).json({ success: true, data: { invoiceUrl: order.invoiceUrl }, message: 'Invoice ready' })
  } catch (error) {
    next(error)
  }
}

export const initiateRefund = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const order = await Order.findById(req.params.orderId)
    if (!order) throw createError(404, 'Order not found')
    if (order.paymentStatus !== 'paid') throw createError(400, 'Only paid orders can be refunded')
    if (order.orderStatus === 'delivered') throw createError(400, 'Cannot refund a delivered order. Contact support.')

    if (order.paymentMethod === 'razorpay') await initiateRazorpayRefund(order.paymentId, order.total)
    if (order.paymentMethod === 'stripe') await createStripeRefund(order.paymentId, order.total)
    if (order.paymentMethod === 'nxl' && order.nxlUsed > 0) {
      await creditFixedNXL(order.user, order.nxlUsed, `Refund - order #${order._id}`, order._id)
    }

    order.orderStatus = 'cancelled'
    order.refundStatus = 'initiated'
    order.refundReason = req.body.reason || 'Refund requested by admin'
    await order.save()
    await logEvent({ provider: order.paymentMethod || 'nxl', eventType: 'refund.initiated', order: order._id, orderRef: String(order._id), paymentRef: order.paymentId, status: 'processed' })

    res.status(200).json({ success: true, data: { order }, message: 'Refund initiated' })
  } catch (error) {
    next(error)
  }
}
