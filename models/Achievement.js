import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  condicion: { type: String }, 
  icono: { type: String }, 
})

export default mongoose.model('Achievement', achievementSchema)
