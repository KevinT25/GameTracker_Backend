import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  juegoId: {type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true,},
  usuarioId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,},
  puntuacion: { type: Number, min: 0, max: 100, require: true, },
  textoResenia: { type: String },
  horasJugadas: { type: Number },
  dificultad: { type: String },
  recomendaria: { type: Boolean },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
})

export default mongoose.model('Review', reviewSchema)