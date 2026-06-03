import { validationResult } from 'express-validator'
import Registration from '../models/Registration.js'
import Team from '../models/Team.js'
import Tournament from '../models/Tournament.js'
import { createError } from '../middleware/errorMiddleware.js'
import { creditFixedNXL, deductNXL } from '../services/nxlService.js'
import { generateQRDataURL, generateQRToken } from '../services/qrService.js'
import { sendQRPassEmail } from '../services/emailService.js'

const throwIfInvalid = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw createError(422, 'Validation failed', errors.array().map((error) => error.msg))
}

const parseRules = (rules) => {
  if (Array.isArray(rules)) return rules.filter(Boolean)
  if (!rules) return []
  try {
    const parsed = JSON.parse(rules)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [String(rules)]
  } catch {
    return [String(rules)]
  }
}

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const queryValue = (value) => (typeof value === 'string' ? value.trim() : '')

const tournamentPayload = (req) => {
  const payload = {
    ...req.body,
    rules: parseRules(req.body.rules),
    maxSlots: Number(req.body.maxSlots),
    entryFee: Number(req.body.entryFee),
    nxlReward: Number(req.body.nxlReward),
  }

  if (req.body.startDate) payload.startDate = new Date(req.body.startDate)
  if (req.body.endDate) payload.endDate = new Date(req.body.endDate)
  if (!req.body.endDate) delete payload.endDate
  if (req.file?.path) payload.poster = req.file.path

  return payload
}

export const getAllTournaments = async (req, res, next) => {
  try {
    const { sport, type, format, status, search } = req.query
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48)
    const filter = {}
    const sportFilter = queryValue(sport)
    const typeFilter = queryValue(type).toLowerCase()
    const formatFilter = queryValue(format).toLowerCase()
    const statusFilter = queryValue(status).toLowerCase()
    const searchFilter = queryValue(search)

    if (sportFilter) filter.sport = new RegExp(`^${escapeRegExp(sportFilter)}$`, 'i')
    if (typeFilter) filter.type = typeFilter
    if (formatFilter) filter.format = formatFilter
    if (statusFilter) filter.status = statusFilter
    if (searchFilter) filter.name = new RegExp(escapeRegExp(searchFilter), 'i')

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
    const payload = tournamentPayload(req)
    const startDate = payload.startDate
    const threeDays = 3 * 24 * 60 * 60 * 1000
    const tournament = await Tournament.create({
      ...payload,
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
    const payload = tournamentPayload(req)
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, payload, { returnDocument: 'after', runValidators: true })
    if (!tournament) throw createError(404, 'Tournament not found')
    if (payload.status === 'completed') {
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

    const existingRegistration = await Registration.findOne({ user: req.user._id, tournament: tournament._id })
    if (existingRegistration) {
      if (existingRegistration.paymentStatus === 'paid') {
        existingRegistration.qrToken = existingRegistration.qrToken || generateQRToken(tournament._id, req.user._id, existingRegistration._id)
        await existingRegistration.save()

        const qrDataUrl = await generateQRDataURL(existingRegistration.qrToken, tournament.name, req.user.name)
        return res.status(200).json({
          success: true,
          data: {
            registration: existingRegistration,
            qrToken: existingRegistration.qrToken,
            qrDataUrl,
            requiresPayment: false,
            amountDue: 0,
          },
          message: 'You are already registered for this tournament',
        })
      }

      // Reuse a pending registration instead of creating a duplicate.
      if (req.body.paymentMethod && req.body.paymentMethod !== existingRegistration.paymentMethod) {
        existingRegistration.paymentMethod = req.body.paymentMethod
      }

      if (!tournament.entryFee || tournament.entryFee <= 0 || existingRegistration.paymentMethod === 'nxl') {
        if (existingRegistration.paymentMethod === 'nxl' && tournament.entryFee > 0) {
          const userNxl = Number(req.user.nxlCredits || 0)
          if (userNxl < tournament.entryFee) throw createError(400, `Insufficient NXL credits. Available: ${userNxl}`)
          await deductNXL(req.user._id, tournament.entryFee, `NXL payment for tournament ${tournament.name}`, tournament._id)
          existingRegistration.nxlUsed = tournament.entryFee
        }

        existingRegistration.paymentStatus = 'paid'
        existingRegistration.paymentMethod = existingRegistration.paymentMethod || 'nxl'
        existingRegistration.paymentId = existingRegistration.paymentId || `${existingRegistration.paymentMethod.toUpperCase()}-${Date.now()}`
        existingRegistration.paidAt = new Date()
        existingRegistration.qrToken = existingRegistration.qrToken || generateQRToken(tournament._id, req.user._id, existingRegistration._id)
        await existingRegistration.save()

        const qrDataUrl = await generateQRDataURL(existingRegistration.qrToken, tournament.name, req.user.name)
        await Promise.all([
          Tournament.updateOne({ _id: tournament._id }, { $inc: { filledSlots: 1 } }),
          tournament.nxlReward
            ? creditFixedNXL(req.user._id, tournament.nxlReward, `NXL earned - ${tournament.name} registration`, tournament._id)
            : Promise.resolve(),
        ])
        sendQRPassEmail(req.user.email, existingRegistration, tournament)

        return res.status(200).json({
          success: true,
          data: {
            registration: existingRegistration,
            qrToken: existingRegistration.qrToken,
            qrDataUrl,
            requiresPayment: false,
            amountDue: 0,
          },
          message: 'Registration completed',
        })
      }

      await existingRegistration.save()

      return res.status(200).json({
        success: true,
        data: {
          registration: existingRegistration,
          requiresPayment: true,
          amountDue: tournament.entryFee,
        },
        message: 'Pending registration found. Complete payment to finish registration.',
      })
    }

    let team
    if (['team', 'doubles'].includes(tournament.format)) {
      const members = req.body.teamData?.members || []
      if (!req.body.teamData?.teamName) throw createError(422, 'Team name is required')
      if (tournament.format === 'doubles' && members.length !== 1) throw createError(422, 'Doubles requires exactly 2 players including the captain')
      if (tournament.format === 'team' && (members.length < 1 || members.length > 6)) throw createError(422, 'Team requires 2-7 players including the captain')
      team = await Team.create({
        name: req.body.teamData.teamName,
        tournament: tournament._id,
        captain: req.user._id,
        members,
      })
    }

    let qrToken
    let paymentStatus = 'pending'
    let paymentId
    let paymentMethod = req.body.paymentMethod
    let paidAt
    let nxlUsed = 0
    if (!tournament.entryFee || tournament.entryFee <= 0) {
      paymentStatus = 'paid'
      paymentMethod = 'nxl'
      paymentId = `FREE-${Date.now()}`
      paidAt = new Date()
    } else if (paymentMethod === 'nxl') {
      const userNxl = Number(req.user.nxlCredits || 0)
      if (userNxl < tournament.entryFee) throw createError(400, `Insufficient NXL credits. Available: ${userNxl}`)
      await deductNXL(req.user._id, tournament.entryFee, `NXL payment for tournament ${tournament.name}`, tournament._id)
      nxlUsed = tournament.entryFee
      paymentStatus = 'paid'
      paymentId = `NXL-${Date.now()}`
      paidAt = new Date()
    }

    const registration = await Registration.create({
      user: req.user._id,
      tournament: tournament._id,
      team: team?._id,
      type: tournament.format === 'solo' ? 'solo' : 'team',
      paymentMethod,
      paymentId,
      paymentStatus,
      nxlUsed,
      paidAt,
    })

    if (paymentStatus === 'paid') {
      qrToken = generateQRToken(tournament._id, req.user._id, registration._id)
      registration.qrToken = qrToken
      await registration.save()
    }

    let qrDataUrl
    if (paymentStatus === 'paid' && registration.qrToken) {
      qrDataUrl = await generateQRDataURL(registration.qrToken, tournament.name, req.user.name)
      await Promise.all([
        Tournament.updateOne({ _id: tournament._id }, { $inc: { filledSlots: 1 } }),
        tournament.nxlReward
          ? creditFixedNXL(req.user._id, tournament.nxlReward, `NXL earned - ${tournament.name} registration`, tournament._id)
          : Promise.resolve(),
      ])
      sendQRPassEmail(req.user.email, registration, tournament)
    }

    res.status(201).json({
      success: true,
      data: {
        registration,
        qrToken: registration.qrToken,
        qrDataUrl,
        requiresPayment: paymentStatus !== 'paid',
        amountDue: paymentStatus !== 'paid' ? tournament.entryFee : 0,
      },
      message: paymentStatus === 'paid' ? 'Registration completed' : 'Registration created. Complete payment.',
    })
  } catch (error) {
    next(error)
  }
}

export const getMyTournamentRegistration = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id).lean()
    if (!tournament) throw createError(404, 'Tournament not found')

    const registration = await Registration.findOne({ user: req.user._id, tournament: req.params.id })
      .populate('team', 'name members')
      .lean()

    if (!registration) {
      return res.status(200).json({
        success: true,
        data: { registration: null },
      })
    }

    let qrDataUrl
    if (registration.paymentStatus === 'paid' && registration.qrToken) {
      qrDataUrl = await generateQRDataURL(registration.qrToken, tournament.name, req.user.name)
    }

    res.status(200).json({
      success: true,
      data: {
        registration,
        qrToken: registration.qrToken,
        qrDataUrl,
        requiresPayment: registration.paymentStatus !== 'paid',
        amountDue: registration.paymentStatus !== 'paid' ? tournament.entryFee : 0,
      },
    })
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
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after', runValidators: true }).lean()
    if (!tournament) throw createError(404, 'Tournament not found')
    res.status(200).json({ success: true, data: { tournament } })
  } catch (error) {
    next(error)
  }
}

export const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('tournament', 'name sport type format entryFee nxlReward startDate venue status')
      .sort({ createdAt: -1 })
      .lean()

    const registrationsWithQr = await Promise.all(
      registrations.map(async (registration) => {
        if (registration.paymentStatus !== 'paid' || !registration.qrToken || !registration.tournament) {
          return registration
        }

        const qrDataUrl = await generateQRDataURL(registration.qrToken, registration.tournament.name, req.user.name)
        return { ...registration, qrDataUrl }
      })
    )

    res.status(200).json({ success: true, data: { registrations: registrationsWithQr } })
  } catch (error) {
    next(error)
  }
}
