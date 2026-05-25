// server/controllers/productController.js
import { validationResult } from 'express-validator'
import Product from '../models/Product.js'
import Review from '../models/Review.js'
import { createError } from '../middleware/errorMiddleware.js'

const throwIfInvalid = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw createError(422, 'Validation failed', errors.array().map((error) => error.msg))
}

const makeSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')

const uniqueSlug = async (name, ignoreId) => {
  const base = makeSlug(name)
  let slug = base
  let index = 2
  while (await Product.exists({ slug, ...(ignoreId && { _id: { $ne: ignoreId } }) })) {
    slug = `${base}-${index}`
    index += 1
  }
  return slug
}

const cloudinaryUrls = (files = []) => files.map((file) => file.path || file.secure_url).filter(Boolean)

const refreshRatings = async (productId) => {
  const reviews = await Review.find({ product: productId }).select('rating').lean()
  const count = reviews.length
  const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0
  await Product.updateOne({ _id: productId }, { ratings: { average, count } })
  return { average, count }
}

export const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, sport, minPrice, maxPrice, rating, sort, featured } = req.query
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48)
    const filter = { isActive: true }
    const and = []

    if (search) and.push({ $or: [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }] })
    if (category) filter.category = category
    if (sport) filter.sport = sport
    if (featured !== undefined) filter.isFeatured = featured === 'true'
    if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) }
    if (rating) filter['ratings.average'] = { $gte: Number(rating) }
    if (and.length) filter.$and = and

    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 },
      'top-rated': { 'ratings.average': -1 },
      featured: { isFeatured: -1, createdAt: -1 },
    }

    const [totalCount, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortMap[sort] || { isFeatured: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ])

    res.status(200).json({ success: true, data: { products, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) } })
  } catch (error) {
    next(error)
  }
}

export const getFeaturedProducts = async (_req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).sort({ createdAt: -1 }).limit(8).lean()
    res.status(200).json({ success: true, data: { products } })
  } catch (error) {
    next(error)
  }
}

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate({ path: 'reviews', populate: { path: 'user', select: 'name' } })
      .lean()
    if (!product) throw createError(404, 'Product not found')
    res.status(200).json({ success: true, data: { product } })
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const product = await Product.create({
      ...req.body,
      slug: await uniqueSlug(req.body.name),
      images: cloudinaryUrls(req.files),
    })
    res.status(201).json({ success: true, data: { product } })
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const product = await Product.findById(req.params.id)
    if (!product) throw createError(404, 'Product not found')

    const updates = { ...req.body }
    if (updates.name) updates.slug = await uniqueSlug(updates.name, product._id)
    if (req.files?.length) updates.images = [...(product.images || []), ...cloudinaryUrls(req.files)]

    const updated = await Product.findByIdAndUpdate(product._id, updates, { new: true, runValidators: true }).lean()
    res.status(200).json({ success: true, data: { product: updated } })
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean()
    if (!product) throw createError(404, 'Product not found')
    res.status(200).json({ success: true, data: {}, message: 'Product removed' })
  } catch (error) {
    next(error)
  }
}

export const createReview = async (req, res, next) => {
  try {
    throwIfInvalid(req)
    const product = await Product.findById(req.params.id)
    if (!product || product.isActive === false) throw createError(404, 'Product not found')

    const alreadyReviewed = await Review.exists({ user: req.user._id, product: product._id })
    if (alreadyReviewed) throw createError(409, 'You have already reviewed this product')

    const review = await Review.create({
      user: req.user._id,
      product: product._id,
      rating: req.body.rating,
      title: req.body.title,
      body: req.body.body,
    })
    product.reviews.push(review._id)
    await product.save()
    await refreshRatings(product._id)

    res.status(201).json({ success: true, data: { review } })
  } catch (error) {
    next(error)
  }
}

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId)
    if (!review) throw createError(404, 'Review not found')
    if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') throw createError(403, 'Access denied')

    await Promise.all([
      Review.deleteOne({ _id: review._id }),
      Product.updateOne({ _id: req.params.id }, { $pull: { reviews: review._id } }),
    ])
    await refreshRatings(req.params.id)
    res.status(200).json({ success: true, data: {}, message: 'Review removed' })
  } catch (error) {
    next(error)
  }
}
