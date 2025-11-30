import mongoose from 'mongoose'

const publicacionSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  nombreUsuario: { type: String, required: true },

  titulo: { type: String, required: true, trim: true },
  contenido: { type: String, required: true, trim: true },

  tag: {
    type: String,
    enum: ['general', 'noticia', 'reseña', 'discusion', 'pregunta', 'fanart'],
    default: 'general',
  },

  // Votos (like + dislike)
  votos: [
    {
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      voto: { type: Number, enum: [1, -1] },
    },
  ],

  // Comentarios estilo foro
  comentarios: [
    {
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      nombreUsuario: String,
      texto: String,
      fecha: { type: Date, default: Date.now },

      respuestas: [
        {
          usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          nombreUsuario: String,
          texto: String,
          fecha: { type: Date, default: Date.now },
        },
      ],
    },
  ],

  reportes: [
    {
      usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      motivo: String,
      fecha: { type: Date, default: Date.now },
    },
  ],

  fechaCreacion: { type: Date, default: Date.now },
})

export default mongoose.model('Publicacion', publicacionSchema)
