import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: Number,
    category: {
      type: String,
      required: true,
      enum: [
        'shoes',
        'jerseys',
        'rackets',
        'footballs',
        'perfumes',
        'water-bottles',
        'gym-accessories',
        'other',
      ],
    },
    sport: {
      type: String,
      enum: ['badminton', 'table-tennis', 'tennis', 'football', 'running', 'gym', 'general'],
    },
    images: [String],
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    nxlEarnRate: { type: Number, default: 5 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
