import mongoose from 'mongoose'
import Registration from '../models/Registration.js'

const hasDesiredQrTokenIndex = (index) =>
  index.unique && index.partialFilterExpression?.qrToken?.$type === 'string'

const repairRegistrationIndexes = async () => {
  const indexes = await Registration.collection.indexes()
  const qrTokenIndex = indexes.find((index) => index.key?.qrToken === 1)

  if (qrTokenIndex && !hasDesiredQrTokenIndex(qrTokenIndex)) {
    await Registration.collection.dropIndex(qrTokenIndex.name)
    console.log(`Dropped unsafe registration index: ${qrTokenIndex.name}`)
  }

  await Registration.createIndexes()
}

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    await repairRegistrationIndexes()
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}
