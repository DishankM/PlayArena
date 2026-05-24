import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    walletBalance: { type: Number, default: 0 },
    nxlCredits: { type: Number, default: 0 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
