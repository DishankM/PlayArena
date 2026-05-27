// server/server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
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

dotenv.config()

const app = express()

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.post('/api/payment/razorpay/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body
  next()
}, handleRazorpayWebhook)
app.post('/api/payment/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body
  next()
}, handleStripeWebhook)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Apply rate limiting only in production to avoid 429s during local development
if (process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter)
  app.use('/api/auth', authLimiter, authRoutes)
} else {
  // In development register auth routes without rate limits
  app.use('/api/auth', authRoutes)
}

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', app: 'PlayArena API' } })
})

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    if (process.env.NODE_ENV === 'development') console.log(`Server running on port ${PORT}`)
  })
})
