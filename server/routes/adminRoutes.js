// server/routes/adminRoutes.js
import express from 'express'
import { body, param } from 'express-validator'
import {
  adjustWallet,
  createCoupon,
  deactivateCoupon,
  getAllCoupons,
  getAllOrders,
  getAllProductsAdmin,
  getAllTournamentsAdmin,
  getAllUsers,
  getAllWalletTransactions,
  getAnalytics,
  getDashboardStats,
  getUserById,
  getWalletOverview,
  toggleUserStatus,
  updateCoupon,
  updateOrderStatus,
  updateRegistrationAttended,
} from '../controllers/adminController.js'
import { isAdmin, protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(protect, isAdmin)

router.get('/dashboard', getDashboardStats)
router.get('/analytics', getAnalytics)
router.get('/users', getAllUsers)
router.get('/users/:id', [param('id').isMongoId()], getUserById)
router.patch('/users/:id/toggle-status', [param('id').isMongoId()], toggleUserStatus)
router.get('/orders', getAllOrders)
router.patch(
  '/orders/:id/status',
  [param('id').isMongoId(), body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])],
  updateOrderStatus
)
router.get('/products', getAllProductsAdmin)
router.post(
  '/coupons',
  [
    body('code').trim().notEmpty().isAlphanumeric(),
    body('discountType').isIn(['percent', 'flat']),
    body('discountValue').isNumeric().custom((value, { req }) => {
      if (req.body.discountType === 'percent' && Number(value) > 90) throw new Error('Percent discount cannot exceed 90')
      if (req.body.discountType === 'flat' && Number(value) > 10000) throw new Error('Flat discount cannot exceed 10000')
      return true
    }),
    body('minOrderAmount').optional().isNumeric(),
    body('maxUses').isInt({ min: 1 }),
    body('expiresAt').isISO8601().custom((value) => {
      if (new Date(value) <= new Date()) throw new Error('Expiry must be in the future')
      return true
    }),
  ],
  createCoupon
)
router.get('/coupons', getAllCoupons)
router.patch('/coupons/:id', [param('id').isMongoId()], updateCoupon)
router.delete('/coupons/:id', [param('id').isMongoId()], deactivateCoupon)
router.get('/tournaments', getAllTournamentsAdmin)
router.get('/wallet/overview', getWalletOverview)
router.get('/wallet/transactions', getAllWalletTransactions)
router.post(
  '/wallet/adjust',
  [
    body('userId').isMongoId(),
    body('type').isIn(['credit', 'deduct']),
    body('nxlAmount').isNumeric().custom((v) => Number(v) > 0),
    body('reason').trim().notEmpty(),
  ],
  adjustWallet
)
router.patch(
  '/registrations/:id/attended',
  [param('id').isMongoId(), body('attended').optional().isBoolean()],
  updateRegistrationAttended
)

export default router
