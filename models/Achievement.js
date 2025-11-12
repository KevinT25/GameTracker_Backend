import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  condicion: { type: String, required: true, trim: true },
  icono: { type: String, required: true, trim: true },
})

export default mongoose.model('Achievement', achievementSchema)




