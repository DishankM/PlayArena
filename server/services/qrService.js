// server/services/qrService.js
import QRCode from 'qrcode'
import Registration from '../models/Registration.js'
import Tournament from '../models/Tournament.js'
import { creditFixedNXL } from './nxlService.js'

export const generateQRToken = async () =>
  `QR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

export const generateQRDataURL = async (token) =>
  QRCode.toDataURL(token, {
    width: 300,
    margin: 2,
    color: { dark: '#1A1A2E', light: '#FFFFFF' },
  })

export const validateQRToken = async (token) => {
  const registration = await Registration.findOne({ qrToken: token })
    .populate('user', 'name email phone')
    .populate('tournament', 'name nxlReward')

  if (!registration) return { valid: false, message: 'Invalid QR code' }
  if (registration.attended) return { valid: false, message: 'QR already used. Entry recorded.' }

  registration.attended = true
  registration.attendedAt = new Date()
  await registration.save()

  const tournament = registration.tournament || (await Tournament.findById(registration.tournament).lean())
  if (tournament?.nxlReward) {
    await creditFixedNXL(
      registration.user._id || registration.user,
      tournament.nxlReward,
      'NXL earned - tournament participation',
      tournament._id || registration.tournament
    )
  }

  return { valid: true, registration, message: 'Entry confirmed!' }
}
