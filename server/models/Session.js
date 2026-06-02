// server/models/Session.js
import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ipAddress: String,
    userAgent: String,
    refreshToken: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
)

sessionSchema.index({ user: 1, revoked: 1 })
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('Session', sessionSchema)
