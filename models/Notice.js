import mongoose from 'mongoose'

const NoticeSchema = new mongoose.Schema(
  {
    encabezado: { type: String, required: true },
    texto: { type: String, required: true },
    imagen: { type: String }, 
    autor: { type: String, default: 'Admin' },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Notice', NoticeSchema)
