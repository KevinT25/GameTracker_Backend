import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  juegoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  puntuacion: { type: Number, min: 0, max: 100 },
  textoResenia: { type: String },
  horasJugadas: { type: Number, default: 0 },
  dificultad: { type: String },
  recomendaria: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  respuestas: [
    {
      texto: String,
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      fecha: { type: Date, default: Date.now },
    },
  ],
})

export default mongoose.model('Review', reviewSchema)


  

