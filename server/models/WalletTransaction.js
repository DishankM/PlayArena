import mongoose from 'mongoose'

const walletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    nxlAmount: { type: Number, default: 0 },
    description: { type: String, required: true },
    reference: String,
    balanceAfter: Number,
    nxlAfter: Number,
  },
  { timestamps: true }
)

export default mongoose.model('WalletTransaction', walletTransactionSchema)
