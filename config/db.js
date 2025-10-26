import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://GameTraker:haSEKGLP4qqw0WSu@cametracker.yrfzuw4.mongodb.net/?appName=CameTracker'
    )
    console.log('MongoDB connected')
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
  }
}


