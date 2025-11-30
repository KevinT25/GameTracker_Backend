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
  // Datos principales de la reseña
  puntuacion: { type: Number, min: 0, max: 5, required: true },
  textoResenia: { type: String, trim: true },
  horasJugadas: { type: Number, default: 0 },
  asunto: { type: String },
  recomendaria: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaEdicion: { type: Date, default: null },
  // Sistema de etiquetas (opcional)
  tags: [{ type: String }],

  // Sistema de votos
  votos: [
    {
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      voto: { type: Number, enum: [1, -1] }, // 1 = like, -1 = dislike
    }
  ],

  // Sistema de reportes (moderación)
  reportes: [
    {
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      motivo: { type: String, trim: true },
      fecha: { type: Date, default: Date.now },
    }
  ],

  // Comentarios anidados tipo foro
  comentarios: [
    {
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      nombreUsuario: String,
      texto: String,
      fecha: { type: Date, default: Date.now },
      fechaEdicion: { type: Date, default: null },

      // Para respuestas anidadas
      respuestas: [
        {
          usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          nombreUsuario: String,
          texto: String,
          fecha: { type: Date, default: Date.now },
          fechaEdicion: { type: Date, default: null },
        }
      ]
    }
  ]
});


export default mongoose.model('Review', reviewSchema)
