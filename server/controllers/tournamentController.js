// server/controllers/tournamentController.js
import crypto from 'crypto'
import { validationResult } from 'express-validator'
import Registration from '../models/Registration.js'
import Team from '../models/Team.js'
import Tournament from '../models/Tournament.js'
import { createError } from '../middleware/errorMiddleware.js'
import { creditFixedNXL } from '../services/nxlService.js'
import { generateQRDataURL, generateQRToken } from '../services/qrService.js'
import { sendQRPassEmail } from '../services/emailService.js'

const throwIfInvalid = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw createError(422, 'Validation failed', errors.array().map((error) => error.msg))
}

const verifyRazorpay = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) throw createError(400, 'Payment verification failed')
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
  if (expected !== razorpay_signature) throw createError(400, 'Payment verification failed')
}

export const getAllTournaments = async (req, res, next) => {
  try {
    const { sport, type, format, status, search } = req.query
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48)
    const filter = {}
    if (sport) filter.sport = sport
    if (type) filter.type = type
    if (format) filter.format = format
    if (status) filter.status = status
    if (search) filter.name = new RegExp(search, 'i')

    const [totalCount, tournaments] = await Promise.all([
      Tournament.countDocuments(filter),
      Tournament.find(filter).sort({ startDate: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    ])

    res.status(200).json({ success: true, data: { tournaments, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) } })
  } catch (error) {
    next(error)
  }
}

export const getUpcomingTournaments = async (_req, res, next) => {
  try {
    const tournaments = await Tournament.find({ status: { $in: ['upcoming', 'open'] }, startDate: { $gt: new Date() } })
      .sort({ startDate: 1 })
      .limit(6)
      .lean()
    res.status(200).json({ success: true, data: { tournaments } })
  } catch (error) {
    next(error)
  }
}

export const getTournamentById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('createdBy', 'name').lean()
    if (!tournament) throw createError(404, 'Tournament not found')
    res.status(200).json({ success: true, data: { tournament } })
  } catch (error) {
    next(error)
  }
}

export const createTournament = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const startDate = new Date(req.body.startDate)
    const threeDays = 3 * 24 * 60 * 60 * 1000
    const tournament = await Tournament.create({
      ...req.body,
      startDate,
      status: startDate.getTime() - Date.now() > threeDays ? 'open' : 'upcoming',
      createdBy: req.user._id,
    })
    res.status(201).json({ success: true, data: { tournament } })
  } catch (error) {
    next(error)
  }
}

export const updateTournament = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!tournament) throw createError(404, 'Tournament not found')
    if (req.body.status === 'completed') {
      await Registration.updateMany({ tournament: tournament._id, attended: false }, { attended: true, attendedAt: new Date() })
    }
    res.status(200).json({ success: true, data: { tournament } })
  } catch (error) {
    next(error)
  }
}

export const deleteTournament = async (req, res, next) => {
  try {
    const paidCount = await Registration.countDocuments({ tournament: req.params.id, paymentStatus: 'paid' })
    if (paidCount) throw createError(400, 'Cannot delete tournament with paid registrations. Cancel it instead.')
    const registrationCount = await Registration.countDocuments({ tournament: req.params.id })
    if (registrationCount) {
      await Tournament.findByIdAndUpdate(req.params.id, { status: 'cancelled' })
    } else {
      await Tournament.findByIdAndDelete(req.params.id)
    }
    res.status(200).json({ success: true, data: {}, message: 'Tournament removed' })
  } catch (error) {
    next(error)
  }
}

export const registerForTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) throw createError(404, 'Tournament not found')
    if (tournament.status !== 'open') throw createError(400, 'Registrations are not open for this tournament')
    if (tournament.filledSlots >= tournament.maxSlots) throw createError(400, 'Tournament is full')

    const duplicate = await Registration.exists({ user: req.user._id, tournament: tournament._id })
    if (duplicate) throw createError(409, 'You are already registered for this tournament')

    let team
    if (['team', 'doubles'].includes(tournament.format)) {
      const members = req.body.teamData?.members || []
      if (!req.body.teamData?.teamName) throw createError(422, 'Team name is required')
      if (tournament.format === 'doubles' && members.length !== 2) throw createError(422, 'Doubles requires exactly 2 members')
      if (tournament.format === 'team' && (members.length < 2 || members.length > 7)) throw createError(422, 'Team requires 2-7 members')
      team = await Team.create({
        name: req.body.teamData.teamName,
        tournament: tournament._id,
        captain: req.user._id,
        members,
      })
    }

    if (tournament.entryFee > 0 && req.body.paymentMethod === 'razorpay') verifyRazorpay(req.body)
    if (tournament.entryFee > 0 && req.body.paymentMethod === 'stripe' && !req.body.paymentId) throw createError(400, 'Payment not completed')

    const qrToken = await generateQRToken()
    const registration = await Registration.create({
      user: req.user._id,
      tournament: tournament._id,
      team: team?._id,
      type: tournament.format === 'solo' ? 'solo' : 'team',
      paymentId: req.body.paymentId || req.body.razorpay_payment_id,
      paymentStatus: 'paid',
      qrToken,
    })

    await Promise.all([
      Tournament.updateOne({ _id: tournament._id }, { $inc: { filledSlots: 1 } }),
      tournament.nxlReward ? creditFixedNXL(req.user._id, tournament.nxlReward, `NXL earned - ${tournament.name} registration`, tournament._id) : Promise.resolve(),
      generateQRDataURL(qrToken),
    ])
    sendQRPassEmail(req.user.email, registration, tournament)

    res.status(201).json({ success: true, data: { registration, qrToken } })
  } catch (error) {
    next(error)
  }
}

export const getTournamentRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ tournament: req.params.id })
      .populate('user', 'name email phone')
      .populate('team', 'name members')
      .lean()
    res.status(200).json({ success: true, data: { registrations, count: registrations.length } })
  } catch (error) {
    next(error)
  }
}

export const updateTournamentStatus = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }).lean()
    if (!tournament) throw createError(404, 'Tournament not found')
    res.status(200).json({ success: true, data: { tournament } })
  } catch (error) {
    next(error)
  }
}

export const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('tournament', 'name sport type startDate venue status')
      .sort({ createdAt: -1 })
      .lean()
    res.status(200).json({ success: true, data: { registrations } })
  } catch (error) {
    next(error)
  }
}
