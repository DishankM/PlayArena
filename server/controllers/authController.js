import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'
import Product from '../models/Product.js'
import AuditLog from '../models/AuditLog.js'
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

const wishlistFields = 'name price originalPrice slug images category ratings stock nxlEarnRate'

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

    const refreshToken = generateRefreshToken(user._id)
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    user.refreshTokens = [
      {
        token: refreshToken,
        expiresAt: refreshExpiry,
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip,
      },
    ]
    user.lastLoginAt = new Date()
    user.lastLoginIP = req.ip
    user.loginCount = 1
    await user.save()
    await user.populate('wishlist', wishlistFields)

    setRefreshCookie(res, refreshToken)
    sendWelcomeEmail(user.email, user.name)
    await AuditLog.create({
      action: 'REGISTER',
      performedBy: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    })

    res.status(201).json({ success: true, data: { user: publicUser(user), accessToken: generateAccessToken(user._id, user.role) } })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    const now = new Date()

    if (!user) {
      await AuditLog.create({
        action: 'LOGIN_FAILED',
        details: { email, ip: req.ip, userAgent: req.headers['user-agent'] },
        status: 'failure',
      })
      throw createError(401, 'Invalid email or password')
    }

    if (user.lockUntil && user.lockUntil > now) {
      const minutesLeft = Math.ceil((user.lockUntil - now) / (1000 * 60))
      throw createError(423, `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`)
    }

    const matched = await bcrypt.compare(password, user.password)
    if (!matched) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1
      const shouldLock = user.failedLoginAttempts >= 5
      if (shouldLock) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000)
        await user.save()
        await AuditLog.create({
          action: 'ACCOUNT_LOCKED',
          performedBy: user._id,
          details: { ip: req.ip, attempts: user.failedLoginAttempts },
          status: 'failure',
        })
        throw createError(423, 'Account locked for 30 minutes after 5 failed attempts.')
      }
      await user.save()
      await AuditLog.create({
        action: 'LOGIN_FAILED',
        performedBy: user._id,
        details: { ip: req.ip, attempts: user.failedLoginAttempts },
        status: 'failure',
      })
      throw createError(401, 'Invalid email or password')
    }

    if (!user.isActive) throw createError(403, 'Account suspended. Contact support.')

    user.failedLoginAttempts = 0
    user.lockUntil = undefined
    user.lastLoginAt = new Date()
    user.lastLoginIP = req.ip
    user.loginCount = (user.loginCount || 0) + 1

    if (!user.refreshTokens) user.refreshTokens = []
    if (user.refreshTokens.length >= 5) user.refreshTokens.shift()

    const refreshToken = generateRefreshToken(user._id)
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip,
    })

    await user.save()
    await user.populate('wishlist', wishlistFields)
    setRefreshCookie(res, refreshToken)
    await AuditLog.create({
      action: 'LOGIN',
      performedBy: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    })

    res.status(200).json({ success: true, data: { user: publicUser(user), accessToken: generateAccessToken(user._id, user.role) } })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (token) {
      const user = await User.findOne({ 'refreshTokens.token': token })
      if (user) {
        user.refreshTokens = user.refreshTokens.map((rt) =>
          rt.token === token ? { ...rt.toObject(), isRevoked: true } : rt
        )
        await user.save()
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    if (req.user) {
      await AuditLog.create({
        action: 'LOGOUT',
        performedBy: req.user._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success',
      })
    }

    res.status(200).json({ success: true, data: {}, message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) throw createError(401, 'No refresh token')

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    } catch {
      res.clearCookie('refreshToken')
      throw createError(401, 'Invalid or expired session. Please login again.')
    }

    if (decoded.type !== 'refresh') {
      res.clearCookie('refreshToken')
      throw createError(401, 'Invalid token type')
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      res.clearCookie('refreshToken')
      throw createError(401, 'User not found')
    }

    const storedToken = user.refreshTokens.find((rt) => rt.token === token && !rt.isRevoked)
    if (!storedToken) {
      user.refreshTokens.forEach((rt) => {
        rt.isRevoked = true
      })
      await user.save()
      res.clearCookie('refreshToken')
      await AuditLog.create({
        action: 'SUSPICIOUS_TOKEN_REUSE',
        performedBy: user._id,
        details: { ip: req.ip, userAgent: req.headers['user-agent'] },
        status: 'failure',
      })
      throw createError(401, 'Session expired. Please login again.')
    }

    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
      storedToken.isRevoked = true
      await user.save()
      res.clearCookie('refreshToken')
      throw createError(401, 'Session expired. Please login again.')
    }

    storedToken.isRevoked = true
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(1)
    }

    const newRefreshToken = generateRefreshToken(user._id)
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip,
    })
    await user.save()

    setRefreshCookie(res, newRefreshToken)
    const newAccessToken = generateAccessToken(user._id, user.role)

    res.status(200).json({ success: true, data: { accessToken: newAccessToken } })
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
      .populate('wishlist', wishlistFields)
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
    const user = await User.findByIdAndUpdate(req.user._id, allowed, { returnDocument: 'after', runValidators: true })
      .select('-password')
      .populate('wishlist', wishlistFields)
      .lean()
    res.status(200).json({ success: true, data: { user }, message: 'Profile updated' })
  } catch (error) {
    next(error)
  }
}

export const toggleWishlist = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const { productId } = req.params
    const product = await Product.findOne({ _id: productId, isActive: true }).select('_id')
    if (!product) throw createError(404, 'Product not found')

    const user = await User.findById(req.user._id)
    const exists = user.wishlist.some((id) => id.toString() === productId)

    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId)
    } else {
      user.wishlist.push(product._id)
    }

    await user.save()
    await user.populate('wishlist', wishlistFields)

    res.status(200).json({
      success: true,
      data: { user: publicUser(user), wishlisted: !exists },
      message: exists ? 'Removed from wishlist' : 'Added to wishlist',
    })
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
