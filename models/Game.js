import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  genero: { type: String, required: true },
  plataforma: { type: String, required: true },
  anioLanzamiento: { type: Number, required: true },
  ClasificacionEdad: { type: String, required: true },
  desarrollador: { type: String, required: true },
  imagenPortada: { type: String, required: true },
  descripcion: { type: String, default: 'Comienza tu aventura' },
  completado: { type: Boolean, default: false },
  misjuegos: {type: Boolean, default: false},
  fechaCreacion: { type: Date, default: Date.now },
})

export default mongoose.model('Game', gameSchema)
