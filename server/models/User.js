// server/models/User.js
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
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
        userAgent: String,
        ipAddress: String,
        isRevoked: { type: Boolean, default: false },
      },
    ],
    lastLoginAt: { type: Date },
    lastLoginIP: { type: String },
    loginCount: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
)

userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ createdAt: -1 })

export default mongoose.model('User', userSchema)
