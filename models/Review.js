import mongoose from 'mongoose'

const respuestaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nombreUsuario: String,
  texto: String,
  fecha: { type: Date, default: Date.now },
  fechaEdicion: { type: Date, default: null },
})

const comentarioSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nombreUsuario: String,
  texto: String,
  fecha: { type: Date, default: Date.now },
  fechaEdicion: { type: Date, default: null },
  respuestas: [respuestaSchema],
})

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
  puntuacion: { type: Number, min: 0, max: 5 },
  textoResenia: { type: String, trim: true, required: true },
  horasJugadas: { type: Number, default: 0 },
  asunto: { type: String },
  recomendaria: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
  fechaEdicion: { type: Date, default: null },

  // Sistema de votos (like / dislike)
  votos: [
    {
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      voto: { type: Number, enum: [1, -1] },
    },
  ],

  // Comentarios e hilos
  comentarios: [comentarioSchema],
})

export default mongoose.model('Review', reviewSchema)
