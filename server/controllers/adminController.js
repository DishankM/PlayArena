// server/controllers/adminController.js
import { validationResult } from 'express-validator'
import Coupon from '../models/Coupon.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Registration from '../models/Registration.js'
import Tournament from '../models/Tournament.js'
import User from '../models/User.js'
import { createError } from '../middleware/errorMiddleware.js'

const throwIfInvalid = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw createError(422, 'Validation failed', errors.array().map((error) => error.msg))
}

const pagination = (query, defaultLimit = 20) => {
  const page = Math.max(Number(query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(query.limit) || defaultLimit, 1), 100)
  return { page, limit, skip: (page - 1) * limit }
}

export const getDashboardStats = async (_req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const [
      users,
      products,
      orders,
      tournaments,
      revenueResult,
      last7Days,
      recentOrders,
      recentRegistrations,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Tournament.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'paid' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { _id: 1 } },
      ]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5).lean(),
      Registration.find().populate('user', 'name email').populate('tournament', 'name').sort({ createdAt: -1 }).limit(5).lean(),
    ])

    res.status(200).json({
      success: true,
      data: {
        stats: { users, products, orders, tournaments, revenue: revenueResult[0]?.total || 0 },
        recentOrders,
        recentRegistrations,
        last7Days,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query)
    const filter = {}
    if (req.query.search) filter.$or = [{ name: new RegExp(req.query.search, 'i') }, { email: new RegExp(req.query.search, 'i') }]
    if (req.query.role) filter.role = req.query.role
    if (req.query.status === 'active') filter.isActive = true
    if (req.query.status === 'inactive') filter.isActive = false

    const [totalCount, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ])
    res.status(200).json({ success: true, data: { users, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) } })
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const [user, orderCount, registrationCount] = await Promise.all([
      User.findById(req.params.id).select('-password').lean(),
      Order.countDocuments({ user: req.params.id }),
      Registration.countDocuments({ user: req.params.id }),
    ])
    if (!user) throw createError(404, 'User not found')
    res.status(200).json({
      success: true,
      data: {
        user,
        orderCount,
        registrationCount,
        walletBalance: user.walletBalance || 0,
        nxlCredits: user.nxlCredits || 0,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) throw createError(404, 'User not found')
    user.isActive = !user.isActive
    await user.save()
    res.status(200).json({ success: true, data: { isActive: user.isActive }, message: user.isActive ? 'User unblocked' : 'User blocked' })
  } catch (error) {
    next(error)
  }
}

export const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query)
    const filter = {}
    if (req.query.status) filter.orderStatus = req.query.status
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus
    if (req.query.dateFrom || req.query.dateTo) filter.createdAt = { ...(req.query.dateFrom && { $gte: new Date(req.query.dateFrom) }), ...(req.query.dateTo && { $lte: new Date(req.query.dateTo) }) }

    const [totalCount, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ])
    res.status(200).json({ success: true, data: { orders, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) } })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.status }, { new: true, runValidators: true }).lean()
    if (!order) throw createError(404, 'Order not found')
    res.status(200).json({ success: true, data: { order } })
  } catch (error) {
    next(error)
  }
}

export const getAllProductsAdmin = async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    res.status(200).json({ success: true, data: { products, totalCount: products.length } })
  } catch (error) {
    next(error)
  }
}

export const createCoupon = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const code = req.body.code.toUpperCase()
    if (await Coupon.exists({ code })) throw createError(409, 'Coupon already exists')
    const coupon = await Coupon.create({ ...req.body, code })
    res.status(201).json({ success: true, data: { coupon } })
  } catch (error) {
    next(error)
  }
}

export const getAllCoupons = async (_req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    res.status(200).json({ success: true, data: { coupons } })
  } catch (error) {
    next(error)
  }
}

export const updateCoupon = async (req, res, next) => {
  try {
    const allowed = (({ isActive, expiresAt, maxUses, discountValue }) => ({ isActive, expiresAt, maxUses, discountValue }))(req.body)
    Object.keys(allowed).forEach((key) => allowed[key] === undefined && delete allowed[key])
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true }).lean()
    if (!coupon) throw createError(404, 'Coupon not found')
    res.status(200).json({ success: true, data: { coupon } })
  } catch (error) {
    next(error)
  }
}

export const deactivateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean()
    if (!coupon) throw createError(404, 'Coupon not found')
    res.status(200).json({ success: true, data: {}, message: 'Coupon deactivated' })
  } catch (error) {
    next(error)
  }
}

export const getAllTournamentsAdmin = async (_req, res, next) => {
  try {
    const tournaments = await Tournament.find().sort({ startDate: -1 }).lean()
    res.status(200).json({ success: true, data: { tournaments, totalCount: tournaments.length } })
  } catch (error) {
    next(error)
  }
}
