import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        phone: String,
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('Team', teamSchema)
