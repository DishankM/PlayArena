// server/controllers/authController.js
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'
import { createError } from '../middleware/errorMiddleware.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js'
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js'

const throwIfInvalid = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw createError(422, 'Validation failed', errors.array().map((error) => error.msg))
}

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

const publicUser = (user) => {
  const plain = typeof user.toObject === 'function' ? user.toObject() : user
  delete plain.password
  delete plain.passwordResetToken
  delete plain.passwordResetExpires
  return plain
}

export const register = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { name, email, password, phone } = req.body
    const exists = await User.exists({ email })
    if (exists) throw createError(409, 'Email already registered')

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      phone: phone || '',
    })

    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)
    setRefreshCookie(res, refreshToken)
    sendWelcomeEmail(user.email, user.name)

    res.status(201).json({ success: true, data: { user: publicUser(user), accessToken } })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user) throw createError(401, 'Invalid email or password')

    const matched = await bcrypt.compare(password, user.password)
    if (!matched) throw createError(401, 'Invalid email or password')
    if (!user.isActive) throw createError(403, 'Account suspended. Contact support.')

    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)
    setRefreshCookie(res, refreshToken)

    res.status(200).json({ success: true, data: { user: publicUser(user), accessToken } })
  } catch (error) {
    next(error)
  }
}

export const logout = async (_req, res, next) => {
  try {
    res.clearCookie('refreshToken')
    res.status(200).json({ success: true, data: {}, message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) throw createError(401, 'No refresh token')

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id).select('-password').lean()
    if (!user || user.isActive === false) throw createError(401, 'User not found or inactive.')

    res.status(200).json({
      success: true,
      data: { accessToken: generateAccessToken(user._id, user.role) },
    })
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex')
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
      user.passwordResetExpires = Date.now() + 3600000
      await user.save()
      sendPasswordResetEmail(user.email, resetToken)
    }

    res.status(200).json({ success: true, data: {}, message: 'Password reset link sent to your email' })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })
    if (!user) throw createError(400, 'Reset link is invalid or has expired')

    user.password = await bcrypt.hash(req.body.password, 12)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.status(200).json({ success: true, data: {}, message: 'Password updated successfully. Please login.' })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('wishlist', 'name price slug images')
      .lean()
    res.status(200).json({ success: true, data: { user } })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const allowed = (({ name, phone, address }) => ({ name, phone, address }))(req.body)
    Object.keys(allowed).forEach((key) => allowed[key] === undefined && delete allowed[key])
    const user = await User.findByIdAndUpdate(req.user._id, allowed, { new: true, runValidators: true })
      .select('-password')
      .lean()
    res.status(200).json({ success: true, data: { user }, message: 'Profile updated' })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const user = await User.findById(req.user._id).select('+password')
    const matched = await bcrypt.compare(req.body.currentPassword, user.password)
    if (!matched) throw createError(400, 'Current password is incorrect')

    user.password = await bcrypt.hash(req.body.newPassword, 12)
    await user.save()

    res.status(200).json({ success: true, data: {}, message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}
