import express from 'express'
import { body } from 'express-validator'
import { getTransactionHistory, getWallet, validateQR } from '../controllers/walletController.js'
import { isAdmin, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getWallet)
router.get('/history', protect, getTransactionHistory)
router.post(
  '/validate-qr',
  protect,
  isAdmin,
  [
    body('qrToken').trim().notEmpty(),
    body('tournamentId').optional().isMongoId(),
  ],
  validateQR
)

export default router
