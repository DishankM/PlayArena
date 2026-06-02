import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

const limitMessage = (windowMs, max) => ({
  success: false,
  message: `Too many requests. Limit: ${max} requests per ${windowMs / 60000} minutes. Try again later.`,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(15 * 60 * 1000, 10),
  keyGenerator: (req) => {
    const email = req.body?.email || ''
    return `${ipKeyGenerator(req.ip)}_${email.toLowerCase()}`
  },
})

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(60 * 1000, 10),
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(15 * 60 * 1000, 300),
})

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(15 * 60 * 1000, 200),
})

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(60 * 60 * 1000, 50),
})

export const qrScanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(60 * 1000, 120),
})
