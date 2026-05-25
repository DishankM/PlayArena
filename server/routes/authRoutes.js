// server/routes/authRoutes.js
import express from 'express'
import { body } from 'express-validator'
import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  updateProfile,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
const passwordRule = (field) =>
  body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must have uppercase, lowercase, number')

router.post('/register', [
  body('name').trim().notEmpty().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  passwordRule('password'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('en-IN'),
], register)
router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty()], login)
router.post('/logout', logout)
router.post('/refresh-token', refreshToken)
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], forgotPassword)
router.post('/reset-password/:token', [passwordRule('password')], resetPassword)
router.get('/me', protect, getMe)
router.patch('/update-profile', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('en-IN'),
], updateProfile)
router.patch('/change-password', [protect, body('currentPassword').notEmpty(), passwordRule('newPassword')], changePassword)

export default router
