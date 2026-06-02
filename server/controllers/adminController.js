import { validationResult } from 'express-validator'
import Coupon from '../models/Coupon.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Registration from '../models/Registration.js'
import Tournament from '../models/Tournament.js'
import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'
import { createError } from '../middleware/errorMiddleware.js'
import {
  nxlSummaryPipeline,
  ordersByStatusPipeline,
  registrationsBySportPipeline,
  revenueByCategoryPipeline,
  revenueByDayPipeline,
  topProductsPipeline,
  userGrowthPipeline,
} from '../utils/aggregations.js'
import { creditFixedNXL, deductNXL } from '../services/nxlService.js'

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
    const [
      userCount,
      productCount,
      orderCount,
      tournamentCount,
      revenueResult,
      nxlIssuedResult,
      last7Days,
      last30Days,
      topProducts,
      categoryRevenue,
      nxlSummary,
      sportStats,
      recentOrders,
      recentRegistrations,
      pendingOrders,
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Tournament.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      WalletTransaction.aggregate([
        { $match: { type: 'credit' } },
        { $group: { _id: null, total: { $sum: '$nxlAmount' } } },
      ]),
      Order.aggregate(revenueByDayPipeline(7)),
      Order.aggregate(revenueByDayPipeline(30)),
      Order.aggregate(topProductsPipeline(5)),
      Order.aggregate(revenueByCategoryPipeline()),
      WalletTransaction.aggregate(nxlSummaryPipeline()),
      Registration.aggregate(registrationsBySportPipeline()),
      Order.find({ paymentStatus: 'paid' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean(),
      Registration.find({ paymentStatus: 'paid' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .populate('tournament', 'name sport')
        .lean(),
      Order.countDocuments({ orderStatus: 'confirmed' }),
    ])

    res.status(200).json({
      success: true,
      data: {
        stats: {
          users: userCount,
          products: productCount,
          orders: orderCount,
          tournaments: tournamentCount,
          totalRevenue: revenueResult[0]?.total || 0,
          totalNxlIssued: nxlIssuedResult[0]?.total || 0,
          pendingOrders,
        },
        charts: {
          last7Days,
          last30Days,
          topProducts,
          categoryRevenue,
          nxlSummary,
          sportStats,
        },
        recent: {
          orders: recentOrders,
          registrations: recentRegistrations,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAnalytics = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30
    const [
      last7Days,
      last30Days,
      categoryRevenue,
      topProducts,
      nxlSummary,
      sportStats,
      ordersByStatus,
      userGrowth,
      revenueResult,
      nxlIssuedResult,
      nxlRedeemedResult,
      avgOrderValue,
    ] = await Promise.all([
      Order.aggregate(revenueByDayPipeline(7)),
      Order.aggregate(revenueByDayPipeline(days)),
      Order.aggregate(revenueByCategoryPipeline()),
      Order.aggregate(topProductsPipeline(10)),
      WalletTransaction.aggregate(nxlSummaryPipeline()),
      Registration.aggregate(registrationsBySportPipeline()),
      Order.aggregate(ordersByStatusPipeline()),
      User.aggregate(userGrowthPipeline(days)),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      WalletTransaction.aggregate([
        { $match: { type: 'credit' } },
        { $group: { _id: null, total: { $sum: '$nxlAmount' } } },
      ]),
      WalletTransaction.aggregate([
        { $match: { type: 'debit' } },
        { $group: { _id: null, total: { $sum: '$nxlAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, avg: { $avg: '$total' } } },
      ]),
    ])

    const totalRevenue = revenueResult[0]?.total || 0
    const paidOrders = revenueResult[0]?.count || 0
    const totalNxlIssued = nxlIssuedResult[0]?.total || 0
    const totalNxlRedeemed = nxlRedeemedResult[0]?.total || 0
    const userCount = await User.countDocuments({ role: 'user', isActive: true })

    res.status(200).json({
      success: true,
      data: {
        charts: {
          last7Days,
          revenueOverTime: last30Days,
          categoryRevenue,
          topProducts,
          nxlSummary,
          sportStats,
          ordersByStatus,
          userGrowth,
        },
        summary: {
          totalRevenue,
          paidOrders,
          avgOrderValue: Math.round(avgOrderValue[0]?.avg || 0),
          totalNxlIssued,
          totalNxlRedeemed,
          nxlInCirculation: totalNxlIssued - totalNxlRedeemed,
          avgNxlPerUser: userCount ? Math.round(totalNxlIssued / userCount) : 0,
          topProduct: topProducts[0]?.name || '—',
          topSport: sportStats[0]?.sport || '—',
        },
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
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
      ]
    }
    if (req.query.role) filter.role = req.query.role
    if (req.query.status === 'active') filter.isActive = true
    if (req.query.status === 'blocked' || req.query.status === 'inactive') filter.isActive = false

    const [totalCount, users, orderCounts] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
      ]),
    ])

    const orderMap = Object.fromEntries(orderCounts.map((row) => [String(row._id), row.count]))
    const usersWithOrders = users.map((user) => ({
      ...user,
      orderCount: orderMap[String(user._id)] || 0,
    }))

    res.status(200).json({
      success: true,
      data: {
        users: usersWithOrders,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const [user, orderCount, registrationCount, recentOrders, recentTransactions, totalSpent] =
      await Promise.all([
        User.findById(req.params.id).select('-password').lean(),
        Order.countDocuments({ user: req.params.id }),
        Registration.countDocuments({ user: req.params.id }),
        Order.find({ user: req.params.id })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),
        WalletTransaction.find({ user: req.params.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Order.aggregate([
          { $match: { user: req.params.id, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
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
        totalSpent: totalSpent[0]?.total || 0,
        recentOrders,
        recentTransactions,
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
    res.status(200).json({
      success: true,
      data: { isActive: user.isActive },
      message: user.isActive ? 'User unblocked' : 'User blocked',
    })
  } catch (error) {
    next(error)
  }
}

export const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query)
    const filter = {}
    if (req.query.status && req.query.status !== 'all') filter.orderStatus = req.query.status
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {
        ...(req.query.dateFrom && { $gte: new Date(req.query.dateFrom) }),
        ...(req.query.dateTo && { $lte: new Date(`${req.query.dateTo}T23:59:59`) }),
      }
    }
    if (req.query.search) {
      const search = req.query.search.trim()
      const users = await User.find({
        $or: [{ email: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }],
      })
        .select('_id')
        .lean()
      const userIds = users.map((u) => u._id)
      filter.$or = [
        ...(search.match(/^[a-f\d]{24}$/i) ? [{ _id: search }] : []),
        { user: { $in: userIds } },
      ]
    }

    const [totalCount, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])
    res.status(200).json({
      success: true,
      data: { orders, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.status },
      { returnDocument: 'after', runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('items.product', 'name category')
      .lean()
    if (!order) throw createError(404, 'Order not found')
    res.status(200).json({ success: true, data: { order } })
  } catch (error) {
    next(error)
  }
}

export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query, 20)
    const filter = {}
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
      ]
    }
    if (req.query.category && req.query.category !== 'all') filter.category = req.query.category

    const [totalCount, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ])
    res.status(200).json({
      success: true,
      data: { products, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) },
    })
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
    const allowed = (({ isActive, expiresAt, maxUses, discountValue, perUserLimit, minOrderAmount }) => ({
      isActive,
      expiresAt,
      maxUses,
      discountValue,
      perUserLimit,
      minOrderAmount,
    }))(req.body)
    Object.keys(allowed).forEach((key) => allowed[key] === undefined && delete allowed[key])
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, allowed, {
      returnDocument: 'after',
      runValidators: true,
    }).lean()
    if (!coupon) throw createError(404, 'Coupon not found')
    res.status(200).json({ success: true, data: { coupon } })
  } catch (error) {
    next(error)
  }
}

export const deactivateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { returnDocument: 'after' }).lean()
    if (!coupon) throw createError(404, 'Coupon not found')
    res.status(200).json({ success: true, data: {}, message: 'Coupon deactivated' })
  } catch (error) {
    next(error)
  }
}

export const getAllTournamentsAdmin = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status
    const tournaments = await Tournament.find(filter).sort({ startDate: -1 }).lean()
    res.status(200).json({ success: true, data: { tournaments, totalCount: tournaments.length } })
  } catch (error) {
    next(error)
  }
}

export const getWalletOverview = async (_req, res, next) => {
  try {
    const [nxlSummary, totalUserNxl, transactionCount] = await Promise.all([
      WalletTransaction.aggregate(nxlSummaryPipeline()),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$nxlCredits' } } }]),
      WalletTransaction.countDocuments(),
    ])
    const issued = nxlSummary.find((row) => row.type === 'credit')?.total || 0
    const redeemed = nxlSummary.find((row) => row.type === 'debit')?.total || 0
    res.status(200).json({
      success: true,
      data: {
        totalNxlIssued: issued,
        totalNxlRedeemed: redeemed,
        outstandingNxl: issued - redeemed,
        totalUserNxl: totalUserNxl[0]?.total || 0,
        transactionCount,
        nxlSummary,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAllWalletTransactions = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query)
    const filter = {}
    if (['credit', 'debit'].includes(req.query.type)) filter.type = req.query.type
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {
        ...(req.query.dateFrom && { $gte: new Date(req.query.dateFrom) }),
        ...(req.query.dateTo && { $lte: new Date(`${req.query.dateTo}T23:59:59`) }),
      }
    }
    if (req.query.search) {
      const users = await User.find({
        $or: [
          { email: new RegExp(req.query.search, 'i') },
          { name: new RegExp(req.query.search, 'i') },
        ],
      })
        .select('_id')
        .lean()
      filter.user = { $in: users.map((u) => u._id) }
    }

    const [totalCount, transactions] = await Promise.all([
      WalletTransaction.countDocuments(filter),
      WalletTransaction.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])
    res.status(200).json({
      success: true,
      data: { transactions, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    next(error)
  }
}

export const adjustWallet = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { userId, type, nxlAmount, reason } = req.body
    if (!userId || !type || !nxlAmount || !reason?.trim()) {
      throw createError(422, 'userId, type, nxlAmount, and reason are required')
    }
    const amount = Number(nxlAmount)
    if (amount <= 0) throw createError(422, 'nxlAmount must be positive')

    const description = `Admin: ${reason.trim()}`
    const result =
      type === 'credit'
        ? await creditFixedNXL(userId, amount, description, 'admin-adjustment')
        : await deductNXL(userId, amount, description, 'admin-adjustment')

    res.status(200).json({
      success: true,
      message: `NXL ${type === 'credit' ? 'credited' : 'deducted'} successfully`,
      data: { newBalance: result.newBalance },
    })
  } catch (error) {
    next(error)
  }
}

export const updateRegistrationAttended = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
    if (!registration) throw createError(404, 'Registration not found')
    registration.attended = req.body.attended !== false
    registration.attendedAt = registration.attended ? new Date() : undefined
    await registration.save()
    res.status(200).json({ success: true, data: { registration } })
  } catch (error) {
    next(error)
  }
}
