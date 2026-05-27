// server/models/Registration.js
import mongoose from 'mongoose'

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    type: { type: String, enum: ['solo', 'team'] },
    paymentId: String,
    razorpayOrderId: String,
    stripePaymentIntentId: String,
    paidAt: Date,
    paymentMethod: { type: String, enum: ['razorpay', 'stripe', 'nxl'] },
    nxlUsed: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    qrToken: { type: String },
    attended: { type: Boolean, default: false },
    attendedAt: Date,
  },
  { timestamps: true }
)

registrationSchema.index({ user: 1, tournament: 1 }, { unique: true })
registrationSchema.index({ qrToken: 1 }, { unique: true, sparse: true })
registrationSchema.index({ tournament: 1 })
registrationSchema.index({ paymentStatus: 1 })
registrationSchema.index({ razorpayOrderId: 1 }, { sparse: true })
registrationSchema.index({ stripePaymentIntentId: 1 }, { sparse: true })

export default mongoose.model('Registration', registrationSchema)
