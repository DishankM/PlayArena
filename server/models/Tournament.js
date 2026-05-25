// server/models/Tournament.js
import mongoose from 'mongoose'

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    sport: { type: String, required: true },
    type: { type: String, enum: ['indoor', 'outdoor'], required: true },
    format: { type: String, enum: ['solo', 'team', 'doubles'] },
    entryFee: { type: Number, default: 0 },
    prize: String,
    maxSlots: { type: Number, required: true },
    filledSlots: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: Date,
    venue: String,
    rules: [String],
    poster: String,
    nxlReward: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'open', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

tournamentSchema.index({ status: 1, startDate: 1 })
tournamentSchema.index({ sport: 1, type: 1, format: 1 })

export default mongoose.model('Tournament', tournamentSchema)
