// server/models/Review.js
import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, minlength: 10 },
  },
  { timestamps: true }
)

reviewSchema.index({ product: 1, createdAt: -1 })
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

export default mongoose.model('Review', reviewSchema)
