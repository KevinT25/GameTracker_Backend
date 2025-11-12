import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
  facilitador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  titulo: { type: String, required: true, trim: true },
  genero: { type: String, required: true, trim: true },
  plataforma: { type: String, required: true, trim: true },
  anioLanzamiento: { type: Number, required: true },
  clasificacionEdad: { type: String, required: true, trim: true },
  desarrollador: { type: String, required: true, trim: true },
  imagenPortada: { type: String, required: true, trim: true },
  descripcion: { type: String, default: 'Comienza tu aventura', trim: true },
  fechaCreacion: { type: Date, default: Date.now },
})

export default mongoose.model('Game', gameSchema)
