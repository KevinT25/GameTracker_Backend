import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  juegoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nombreUsuario: { type: String, required: true },
  puntuacion: { type: Number, min: 0, max: 5, required: true },
  textoResenia: { type: String, trim: true },
  horasJugadas: { type: Number, default: 0 },
  dificultad: { type: String },
  recomendaria: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  respuestas: [
    {
      texto: { type: String, required: true },
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      fecha: { type: Date, default: Date.now },
    },
  ],
})

export default mongoose.model('Review', reviewSchema)
