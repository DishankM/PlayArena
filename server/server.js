// server/server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import productRoutes from './routes/productRoutes.js'
import tournamentRoutes from './routes/tournamentRoutes.js'
import walletRoutes from './routes/walletRoutes.js'
import { handleRazorpayWebhook, handleStripeWebhook } from './controllers/paymentController.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { sanitizeMongo, sanitizeXSS, preventHPP, deepSanitize } from './middleware/sanitizeMiddleware.js'
import { authLimiter, paymentLimiter, apiLimiter, adminLimiter } from './middleware/rateLimitMiddleware.js'
import logger from './services/loggerService.js'

dotenv.config()

const app = express()

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://checkout.razorpay.com', 'https://js.stripe.com', "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'blob:'],
        connectSrc: ["'self'", 'https://api.razorpay.com', 'https://api.stripe.com', 'https://lumberjack.razorpay.com'],
        frameSrc: ['https://api.razorpay.com', 'https://js.stripe.com', 'https://hooks.stripe.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
)

const allowedOrigins = [process.env.CLIENT_URL, 'https://playarena.vercel.app', 'https://www.playarena.com'].filter(Boolean)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`CORS: Origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
  })
)

app.post(
  '/api/payment/razorpay/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body
    next()
  },
  handleRazorpayWebhook
)
app.post(
  '/api/payment/stripe/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body
    next()
  },
  handleStripeWebhook
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(sanitizeMongo)
app.use(sanitizeXSS)
app.use(preventHPP)
app.use(deepSanitize)

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/payment', paymentLimiter, paymentRoutes)
app.use('/api/admin', adminLimiter, adminRoutes)
app.use('/api', apiLimiter)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/wallet', walletRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', app: 'PlayArena API' } })
})

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
})
