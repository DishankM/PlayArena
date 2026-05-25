// server/models/Registration.js
import mongoose from 'mongoose'

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    type: { type: String, enum: ['solo', 'team'] },
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    qrToken: { type: String, unique: true },
    attended: { type: Boolean, default: false },
    attendedAt: Date,
  },
  { timestamps: true }
)

registrationSchema.index({ user: 1, tournament: 1 }, { unique: true })

export default mongoose.model('Registration', registrationSchema)
