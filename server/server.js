import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const placeholderRouter = (name) => {
  const router = express.Router()
  router.get('/', (_req, res) => {
    res.json({ message: `${name} routes — coming soon` })
  })
  return router
}

app.use('/api/auth', placeholderRouter('Auth'))
app.use('/api/products', placeholderRouter('Products'))
app.use('/api/orders', placeholderRouter('Orders'))
app.use('/api/tournaments', placeholderRouter('Tournaments'))
app.use('/api/wallet', placeholderRouter('Wallet'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'PlayArena API' })
})

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
