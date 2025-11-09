import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
  facilitador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  titulo: { type: String, required: true },
  genero: { type: String, required: true },
  plataforma: { type: String, required: true },
  anioLanzamiento: { type: Number, required: true },
  clasificacionEdad: { type: String, required: true },
  desarrollador: { type: String, required: true },
  imagenPortada: { type: String, required: true },
  descripcion: { type: String, default: 'Comienza tu aventura' },
  fechaCreacion: { type: Date, default: Date.now },
})

export default mongoose.model('Game', gameSchema)
