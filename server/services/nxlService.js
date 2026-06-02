import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'
import { createError } from '../middleware/errorMiddleware.js'

export const calculateNXLEarned = (amount) => Math.floor(Number(amount || 0) / 100) * 5

export const creditFixedNXL = async (userId, nxlAmount, description, reference) => {
  const user = await User.findById(userId).select('nxlCredits')
  if (!user) throw createError(404, 'User not found')

  const nxlToAdd = Number(nxlAmount || 0)
  const newBalance = Number(user.nxlCredits || 0) + nxlToAdd

  await Promise.all([
    User.updateOne({ _id: userId }, { $inc: { nxlCredits: nxlToAdd } }),
    WalletTransaction.create({
      user: userId,
      type: 'credit',
      amount: 0,
      nxlAmount: nxlToAdd,
      description,
      reference: String(reference),
      nxlAfter: newBalance,
    }),
  ])

  return { nxlAdded: nxlToAdd, newBalance }
}

export const creditNXL = async (userId, amount, description, reference) =>
  creditFixedNXL(userId, calculateNXLEarned(amount), description, reference)

export const deductNXL = async (userId, nxlAmount, description, reference) => {
  const user = await User.findById(userId).select('nxlCredits')
  if (!user) throw createError(404, 'User not found')
  if (Number(user.nxlCredits || 0) < Number(nxlAmount)) throw createError(400, 'Insufficient NXL credits')

  const newBalance = Number(user.nxlCredits || 0) - Number(nxlAmount)
  await Promise.all([
    User.updateOne({ _id: userId }, { $inc: { nxlCredits: -Number(nxlAmount) } }),
    WalletTransaction.create({
      user: userId,
      type: 'debit',
      amount: 0,
      nxlAmount: Number(nxlAmount),
      description,
      reference: String(reference),
      nxlAfter: newBalance,
    }),
  ])

  return { nxlDeducted: Number(nxlAmount), newBalance }
}

export const getWalletSummary = async (userId) => {
  const [user, transactions] = await Promise.all([
    User.findById(userId).select('walletBalance nxlCredits').lean(),
    WalletTransaction.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
  ])
  if (!user) throw createError(404, 'User not found')

  return {
    walletBalance: user.walletBalance || 0,
    nxlCredits: user.nxlCredits || 0,
    transactions,
  }
}
