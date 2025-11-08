import mongoose from 'mongoose'

const datauserSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  juegoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  logrosDesbloqueados: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
  ],
  interaccion: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  level: { type: Number, min: 0, max: 80 },
  genero: {type: String },
  karma: { type: Number, min: -80, max: 80 },
  tiempoActivo: { type: Number, default: 0 },
  amigos: { type: Number, default: 0 },
  logrosObtenidos: { type: Number, default: 0 },
  easterEggs: { type: Number, default: 0 },
  juegosCompletadas: { type: Number, default: 0 },
  completado: { type: Boolean, default: false },
  misjuegos: { type: Boolean, default: false },
  wishlist: { type: Boolean, default: false },
})

datauserSchema.index({ usuarioId: 1, juegoId: 1 }, { unique: true })

export default mongoose.model('Datauser', datauserSchema)
