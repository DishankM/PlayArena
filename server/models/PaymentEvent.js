// server/models/PaymentEvent.js
import mongoose from 'mongoose'

const paymentEventSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['razorpay', 'stripe', 'nxl'], required: true },
    eventType: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderRef: String,
    paymentRef: String,
    status: { type: String, enum: ['received', 'processed', 'failed'], default: 'received' },
    payload: mongoose.Schema.Types.Mixed,
    message: String,
  },
  { timestamps: true }
)

paymentEventSchema.index({ provider: 1, eventType: 1, createdAt: -1 })
paymentEventSchema.index({ paymentRef: 1 }, { sparse: true })

export default mongoose.model('PaymentEvent', paymentEventSchema)
