import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rango: { type: String },
  nivel: { type: Number, default: 1 },
  experiencia: { type: Number, default: 0 }, // porcentaje
  biografia: { type: String },
  estatus: { type: String },

  juegos: [
    {
      titulo: String,
      horas: Number,
    },
  ],

  logrosRecientes: [
    {
      icono: String,
      descripcion: String,
    },
  ],

  // datos de autenticación (opcional)
  email: { type: String, unique: true },
  passwordHash: { type: String },
})

export default mongoose.model('User', userSchema)
