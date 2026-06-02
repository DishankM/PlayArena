import crypto from 'crypto'
import QRCode from 'qrcode'
import Registration from '../models/Registration.js'
import AuditLog from '../models/AuditLog.js'
import { creditFixedNXL } from './nxlService.js'

const QR_SECRET = process.env.QR_SECRET || 'playarena_qr_secret'

const normalizeQRToken = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const parsed = JSON.parse(raw)
    if (parsed?.token) return String(parsed.token).trim()
  } catch {
    // Plain token input is expected for manual entry.
  }

  return raw
}

const scanRegistration = (registration, nxlCredited = 0) => ({
  _id: registration._id,
  user: {
    _id: registration.user?._id,
    name: registration.user?.name,
    email: registration.user?.email,
    phone: registration.user?.phone,
  },
  tournament: {
    _id: registration.tournament?._id,
    name: registration.tournament?.name,
    sport: registration.tournament?.sport,
    venue: registration.tournament?.venue,
    startDate: registration.tournament?.startDate,
    endDate: registration.tournament?.endDate,
    nxlReward: registration.tournament?.nxlReward || 0,
  },
  type: registration.type,
  attended: registration.attended,
  attendedAt: registration.attendedAt,
  nxlCredited,
})

export const generateQRToken = (tournamentId, userId, registrationId) => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const tShort = tournamentId.toString().slice(-5).toUpperCase()
  const uShort = userId.toString().slice(-5).toUpperCase()
  const rShort = registrationId.toString().slice(-5).toUpperCase()

  const rawToken = `PA-${tShort}-${uShort}-${rShort}-${timestamp}`
  const hmac = crypto
    .createHmac('sha256', QR_SECRET)
    .update(rawToken)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase()

  return `${rawToken}-${hmac}`
}

export const verifyQRTokenIntegrity = (token) => {
  try {
    const parts = token.split('-')
    if (parts.length !== 6) return false
    if (parts[0] !== 'PA') return false

    const rawToken = parts.slice(0, 5).join('-')
    const receivedHmac = parts[5]

    const expectedHmac = crypto
      .createHmac('sha256', QR_SECRET)
      .update(rawToken)
      .digest('hex')
      .slice(0, 8)
      .toUpperCase()

    if (receivedHmac.length !== expectedHmac.length) return false
    return crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))
  } catch {
    return false
  }
}

export const generateQRDataURL = async (token, tournamentName, playerName) => {
  const qrData = JSON.stringify({
    token,
    platform: 'PlayArena',
    event: tournamentName,
    player: playerName,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  })

  return QRCode.toDataURL(qrData, {
    width: 350,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#1A1A2E', light: '#FFFFFF' },
  })
}

export const generateQRSVG = async (token) => {
  return QRCode.toString(token, { type: 'svg' })
}

export const validateQRToken = async (rawToken, adminId, tournamentId = null) => {
  const token = normalizeQRToken(rawToken)
  const isIntact = verifyQRTokenIntegrity(token)
  if (!isIntact) {
    await logQREvent(token, 'invalid_tampered', adminId)
    return {
      valid: false,
      status: 'tampered',
      message: 'Invalid QR code. Token integrity check failed.',
    }
  }

  const registration = await Registration.findOne({ qrToken: token })
    .populate('user', 'name email phone nxlCredits')
    .populate('tournament', 'name sport venue startDate endDate nxlReward')

  if (!registration) {
    await logQREvent(token, 'invalid_not_found', adminId)
    return {
      valid: false,
      status: 'not_found',
      message: 'QR code not found. Not registered on this platform.',
    }
  }

  if (tournamentId && String(registration.tournament._id) !== String(tournamentId)) {
    await logQREvent(token, 'wrong_event', adminId, registration._id)
    return {
      valid: false,
      status: 'wrong_event',
      message: 'This QR is for a different tournament.',
    }
  }

  if (registration.paymentStatus !== 'paid') {
    await logQREvent(token, 'invalid_unpaid', adminId, registration._id)
    return {
      valid: false,
      status: 'unpaid',
      message: 'Registration payment pending. Entry not allowed.',
    }
  }

  if (registration.attended) {
    await logQREvent(token, 'duplicate_scan', adminId, registration._id)
    return {
      valid: false,
      status: 'already_used',
      message: 'Already checked in at ' + new Date(registration.attendedAt).toLocaleTimeString('en-IN'),
      registration: scanRegistration(registration),
    }
  }

  const tournament = registration.tournament
  const now = new Date()
  const eventStart = new Date(tournament.startDate)
  const eventEnd = tournament.endDate ? new Date(tournament.endDate) : new Date(eventStart.getTime() + 24 * 60 * 60 * 1000)
  const checkInOpen = new Date(eventStart.getTime() - 2 * 60 * 60 * 1000)

  if (now < checkInOpen) {
    const opensIn = Math.round((checkInOpen - now) / (1000 * 60))
    return {
      valid: false,
      status: 'too_early',
      message: `Check-in opens in ${opensIn} minutes.`,
    }
  }

  if (now > eventEnd) {
    return {
      valid: false,
      status: 'expired',
      message: 'Event has ended. QR pass is no longer valid.',
    }
  }

  const updated = await Registration.findOneAndUpdate(
    { _id: registration._id, attended: false },
    { attended: true, attendedAt: new Date(), checkedInBy: adminId },
    { returnDocument: 'after' }
  )
    .populate('user', 'name email phone nxlCredits')
    .populate('tournament', 'name sport venue startDate endDate nxlReward')

  if (!updated) {
    return {
      valid: false,
      status: 'already_used',
      message: 'Already checked in (concurrent scan detected).',
    }
  }

  let nxlCredited = 0
  if (tournament.nxlReward > 0) {
    try {
      await creditFixedNXL(registration.user._id, tournament.nxlReward, `NXL earned — ${tournament.name} participation`, registration._id)
      nxlCredited = tournament.nxlReward
    } catch (nxlErr) {
      console.error('NXL credit failed for check-in:', nxlErr)
    }
  }

  await logQREvent(token, 'success', adminId, registration._id)

  return {
    valid: true,
    status: 'success',
    message: 'Entry confirmed!',
    nxlCredited,
    registration: scanRegistration(updated, nxlCredited),
  }
}

const logQREvent = async (token, status, adminId, registrationId = null) => {
  try {
    await AuditLog.create({
      action: 'QR_SCAN',
      performedBy: adminId,
      targetId: registrationId,
      targetModel: 'Registration',
      details: { token: token.slice(-8), status },
      ipAddress: 'scanner',
      status: status === 'success' ? 'success' : 'failure',
    })
  } catch {
    // Never let audit log failure break the main flow
  }
}
