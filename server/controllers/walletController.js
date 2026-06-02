import { validationResult } from 'express-validator'
import WalletTransaction from '../models/WalletTransaction.js'
import { createError } from '../middleware/errorMiddleware.js'
import { getWalletSummary } from '../services/nxlService.js'
import { validateQRToken } from '../services/qrService.js'

const throwIfInvalid = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw createError(422, 'Validation failed', errors.array().map((error) => error.msg))
}

export const getWallet = async (req, res, next) => {
  try {
    const summary = await getWalletSummary(req.user._id)
    res.status(200).json({
      success: true,
      data: {
        walletBalance: summary.walletBalance,
        nxlCredits: summary.nxlCredits,
        recentTransactions: summary.transactions.slice(0, 5),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getTransactionHistory = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
    const filter = { user: req.user._id }
    if (['credit', 'debit'].includes(req.query.type)) filter.type = req.query.type

    const [totalCount, transactions] = await Promise.all([
      WalletTransaction.countDocuments(filter),
      WalletTransaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ])

    res.status(200).json({ success: true, data: { transactions, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) } })
  } catch (error) {
    next(error)
  }
}

export const validateQR = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const result = await validateQRToken(req.body.qrToken, req.user._id, req.body.tournamentId)
    res.status(200).json({ success: true, data: result, message: result.message })
  } catch (error) {
    next(error)
  }
}
