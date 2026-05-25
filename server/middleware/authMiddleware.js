// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { createError } from './errorMiddleware.js'

const readBearerToken = (req) => {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  return header.split(' ')[1]
}

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET)

export const protect = async (req, _res, next) => {
  try {
    const token = readBearerToken(req)
    if (!token) throw createError(401, 'No token provided. Please login.')

    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.id).select('-password')
    if (!user || user.isActive === false) throw createError(401, 'User not found or inactive.')

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') return next(createError(401, 'Session expired. Please login again.'))
    if (error.name === 'JsonWebTokenError') return next(createError(401, 'Invalid token.'))
    next(error)
  }
}

export const isAdmin = (req, _res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') throw createError(403, 'Access denied. Admin only.')
    next()
  } catch (error) {
    next(error)
  }
}

export const optionalAuth = async (req, _res, next) => {
  try {
    const token = readBearerToken(req)
    if (!token) return next()

    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.id).select('-password')
    if (user && user.isActive !== false) req.user = user
    next()
  } catch (_error) {
    next()
  }
}
