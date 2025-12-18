import mongoose from 'mongoose'

const respuestaSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nombreUsuario: { type: String, required: true },
  texto: { type: String, required: true, trim: true },
  fecha: { type: Date, default: Date.now },
  fechaEdicion: { type: Date, default: null },
})

const comentarioSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nombreUsuario: { type: String, required: true },
  texto: { type: String, required: true, trim: true },
  fecha: { type: Date, default: Date.now },
  fechaEdicion: { type: Date, default: null },
  respuestas: [respuestaSchema],
})

const publicacionSchema = new mongoose.Schema(
  {
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
      enum: ['general', 'discusion', 'pregunta', 'fanart', 'bug/errores'],
      default: 'general',
    },

    votos: [
      {
        usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        voto: { type: Number, enum: [1, -1] },
      },
    ],

    comentarios: [comentarioSchema],
    
    imagenes: [
      {
        url: { type: String, required: true }, 
      },
    ],

    reportes: [
      {
        usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        motivo: { type: String, trim: true },
        fecha: { type: Date, default: Date.now },
      },
    ],

    fechaCreacion: { type: Date, default: Date.now },
    fechaEdicion: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Publicacion', publicacionSchema)
