import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://jacobogarcesoquendo:aFJzVMGN3o7fA38A@cluster0.mqwbn.mongodb.net/diegoLozanoMora'
    )
    console.log('MongoDB connected')
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
  }
}


