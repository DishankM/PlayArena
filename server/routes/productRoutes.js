// server/routes/productRoutes.js
import express from 'express'
import { body, param } from 'express-validator'
import {
  createProduct,
  createReview,
  deleteProduct,
  deleteReview,
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  updateProduct,
} from '../controllers/productController.js'
import { isAdmin, optionalAuth, protect } from '../middleware/authMiddleware.js'
import { uploadProduct } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.get('/', optionalAuth, getAllProducts)
router.get('/featured', getFeaturedProducts)
router.get('/:slug', getProductBySlug)
router.post('/', protect, isAdmin, uploadProduct, [
  body('name').notEmpty(),
  body('price').isNumeric(),
  body('category').notEmpty(),
  body('sport').notEmpty(),
  body('description').notEmpty(),
], createProduct)
router.patch('/:id', protect, isAdmin, uploadProduct, [param('id').isMongoId()], updateProduct)
router.delete('/:id', protect, isAdmin, [param('id').isMongoId()], deleteProduct)
router.post('/:id/reviews', protect, [
  param('id').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').trim().notEmpty(),
  body('body').trim().isLength({ min: 10, max: 500 }),
], createReview)
router.delete('/:id/reviews/:reviewId', protect, [param('id').isMongoId(), param('reviewId').isMongoId()], deleteReview)

export default router
