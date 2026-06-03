import mongoose from 'mongoose'

const failedLoginSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    reason: { type: String },
  },
  { timestamps: true }
)

failedLoginSchema.index({ createdAt: -1 })
failedLoginSchema.index({ email: 1 })

export default mongoose.model('FailedLogin', failedLoginSchema)
