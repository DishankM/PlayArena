import express from 'express'
import { body, param } from 'express-validator'
import { cancelOrder, getOrderById, getUserOrders, placeOrder, validateCoupon } from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/validate-coupon', protect, [body('code').trim().notEmpty(), body('subtotal').isNumeric()], validateCoupon)
router.post('/', protect, [
  body('items').isArray({ min: 1 }),
  body('shippingAddress.street').notEmpty(),
  body('shippingAddress.city').notEmpty(),
  body('shippingAddress.state').notEmpty(),
  body('shippingAddress.pincode').notEmpty(),
  body('paymentMethod').isIn(['razorpay', 'stripe', 'wallet', 'nxl']),
], placeOrder)
router.get('/me', protect, getUserOrders)
router.get('/:id', protect, [param('id').isMongoId()], getOrderById)
router.patch('/:id/cancel', protect, [param('id').isMongoId()], cancelOrder)

export default router
