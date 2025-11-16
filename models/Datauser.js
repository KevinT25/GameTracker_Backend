import mongoose from 'mongoose'

const datauserSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  juegoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
  },
  logrosDesbloqueados: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
  ],
  interaccion: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  amigos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  cantidadamigos: { type: Number, default: 0 },
  juegoSubido: [{ type: String, default: 'owner' }],
  miLogro: { type: String, default: '' },
  genero: { type: String, default: '' },
  loginCount: { type: Number, default: 0 },
  level: { type: Number, min: 0, max: 80, default: 0 },
  horasJugadas: { type: Number, default: 0 },
  tiempoActivo: { type: Number, default: 0 },
  juegosCompletadas: { type: Number, default: 0 },
  logrosObtenidos: { type: Number, default: 0 },
  completado: { type: Boolean, default: false },
  misjuegos: { type: Boolean, default: false },
  wishlist: { type: Boolean, default: false },
})

datauserSchema.index({ usuarioId: 1, juegoId: 1 }, { unique: true })

export default mongoose.model('Datauser', datauserSchema)
