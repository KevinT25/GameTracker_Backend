import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  condicion: { type: String, required: true },
  icono: { type: String, required: true },
})

export default mongoose.model('Achievement', achievementSchema)
