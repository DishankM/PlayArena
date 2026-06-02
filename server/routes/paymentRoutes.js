import express from 'express'
import { isAdmin, protect } from '../middleware/authMiddleware.js'
import {
  createTournamentRazorpayOrder,
  createTournamentStripeIntent,
  createRazorpayOrderHandler,
  createStripePaymentIntent,
  getInvoice,
  initiateRefund,
  paymentValidations,
  processNxlPayment,
  verifyTournamentRazorpayPayment,
  verifyTournamentStripePayment,
  verifyRazorpayPayment,
  verifyStripePayment,
} from '../controllers/paymentController.js'

const router = express.Router()

router.post('/razorpay/create-order', protect, paymentValidations.createRazorpayOrder, createRazorpayOrderHandler)
router.post('/razorpay/verify', protect, paymentValidations.verifyRazorpayPayment, verifyRazorpayPayment)
router.post('/stripe/create-intent', protect, paymentValidations.createStripeIntent, createStripePaymentIntent)
router.post('/stripe/verify', protect, paymentValidations.verifyStripePayment, verifyStripePayment)
router.post('/tournament/razorpay/create-order', protect, paymentValidations.createTournamentRazorpayOrder, createTournamentRazorpayOrder)
router.post('/tournament/razorpay/verify', protect, paymentValidations.verifyTournamentRazorpayPayment, verifyTournamentRazorpayPayment)
router.post('/tournament/stripe/create-intent', protect, paymentValidations.createTournamentStripeIntent, createTournamentStripeIntent)
router.post('/tournament/stripe/verify', protect, paymentValidations.verifyTournamentStripePayment, verifyTournamentStripePayment)
router.post('/nxl', protect, paymentValidations.processNxlPayment, processNxlPayment)
router.get('/invoice/:orderId', protect, paymentValidations.getInvoice, getInvoice)
router.post('/refund/:orderId', protect, isAdmin, paymentValidations.initiateRefund, initiateRefund)

export default router
