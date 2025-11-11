import mongoose from 'mongoose'

const reviewSchema = new new mongoose.Schema({
  juegoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Esto permite almacenar el nombre del usuario al momento de la reseña
  nombreUsuario: { type: String },
  // 🌟 CAMBIO CLAVE: Puntuación de 1 a 5 estrellas
  puntuacion: { type: Number, min: 1, max: 5, required: true }, 
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


  

