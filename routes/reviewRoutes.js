import express from 'express'
import Review from '../models/Review.js'
import Datauser from '../models/Datauser.js'
import Game from '../models/Game.js'
import { procesarLogrosAutomaticos } from '../controllers/condicioneslogro.js'

const router = express.Router()

// Crear reseña
router.post('/', async (req, res) => {
  try {
    const {
      juegoId,
      usuarioId,
      puntuacion,
      nombreUsuario,
      textoResenia,
      horasJugadas,
      asunto,
      recomendaria,
    } = req.body

    const game = await Game.findById(juegoId)
    if (!game) return res.status(404).json({ error: 'Juego no encontrado' })

    const dataUser = await Datauser.findOne({ usuarioId, juegoId })
    if (!dataUser)
      return res.status(400).json({
        error: 'Solo puede reseñar un juego si lo ha jugado',
      })

    const nueva = new Review({
      juegoId,
      usuarioId,
      nombreUsuario,
      puntuacion,
      textoResenia,
      horasJugadas,
      asunto,
      recomendaria,
    })

    await nueva.save()

    if (!dataUser.interaccion.includes(nueva._id)) {
      dataUser.interaccion.push(nueva._id)
      await dataUser.save()
    }

    const totalResenas = dataUser.interaccion.length

    await procesarLogrosAutomaticos(usuarioId, 'nuevaResena', null, {
      totalResenas,
    })

    await procesarLogrosAutomaticos(usuarioId, 'muchaResena', null, {
      totalResenas,
    })

    const reseñaCompleta = await Review.findById(nueva._id)
      .populate('usuarioId', 'nombre')
      .populate('juegoId', 'titulo imagenPortada')
      .populate('respuestas.usuarioId', 'nombre')

    res.status(201).json(reseñaCompleta)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// Agregar respuesta a una reseña
router.post('/:id/responder', async (req, res) => {
  try {
    const { respuesta, usuarioId } = req.body
    if (!respuesta || !usuarioId)
      return res.status(400).json({ error: 'Faltan datos' })

    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    review.respuestas.push({ texto: respuesta, usuarioId, fecha: new Date() })
    await review.save()

    // 🔥 Conteo correcto de respuestas (FIX)
    const respuestasTotalesAgg = await Review.aggregate([
      { $unwind: '$respuestas' },
      {
        $match: {
          'respuestas.usuarioId': new mongoose.Types.ObjectId(usuarioId),
        },
      },
      { $count: 'total' },
    ])

    const respuestasTotales = respuestasTotalesAgg[0]?.total || 0

    await procesarLogrosAutomaticos(usuarioId, 'respuestaComentario', null, {
      respuestasTotales,
    })

    const actualizado = await Review.findById(req.params.id)
      .populate('usuarioId', 'nombre')
      .populate('juegoId', 'titulo imagenPortada')
      .populate('respuestas.usuarioId', 'nombre')

    res.status(200).json(actualizado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// VOTAR reseña
router.post('/:id/votar', async (req, res) => {
  try {
    const { usuarioId, voto } = req.body // voto: 1 o -1

    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    const yaVoto = review.votos?.find(
      (v) => v.usuarioId.toString() === usuarioId
    )

    if (yaVoto) {
      if (yaVoto.voto === voto) {
        review.votos = review.votos.filter(
          (v) => v.usuarioId.toString() !== usuarioId
        )
      } else {
        yaVoto.voto = voto
      }
    } else {
      review.votos.push({ usuarioId, voto })
    }

    await review.save()

    const actualizado = await Review.findById(req.params.id).populate(
      'usuarioId',
      'nombre'
    )

    res.status(200).json(actualizado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Reportar reseña
router.post('/:id/reportar', async (req, res) => {
  try {
    const { usuarioId, motivo } = req.body

    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    review.reportes.push({ usuarioId, motivo })
    await review.save()

    res.status(200).json({ mensaje: 'Reporte enviado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Editar reseña
router.put('/:id', async (req, res) => {
  try {
    const { textoResenia, puntuacion, horasJugadas, asunto, recomendaria } =
      req.body

    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    if (textoResenia !== undefined) review.textoResenia = textoResenia
    if (puntuacion !== undefined) review.puntuacion = puntuacion
    if (horasJugadas !== undefined) review.horasJugadas = horasJugadas
    if (asunto !== undefined) review.asunto = asunto
    if (recomendaria !== undefined) review.recomendaria = recomendaria

    review.fechaEdicion = new Date()

    await review.save()

    res.status(200).json(review)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener reseñas
router.get('/', async (req, res) => {
  try {
    const { juego, usuario } = req.query
    const filtro = {}
    if (juego) filtro.juegoId = juego
    if (usuario) filtro.usuarioId = usuario

    const reviews = await Review.find(filtro)
      .populate('usuarioId', 'nombre')
      .populate('juegoId', 'titulo imagenPortada')
      .populate('comentarios.usuarioId', 'nombre')
      .populate('comentarios.respuestas.usuarioId', 'nombre')
      .sort({ fechaCreacion: -1 })

    res.status(200).json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener reseñas de un juego específico
router.get('/game/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ juegoId: req.params.id })
      .populate('usuarioId', 'nombre')
      .populate('juegoId', 'titulo imagenPortada')
      .populate('comentarios.usuarioId', 'nombre')
      .populate('comentarios.respuestas.usuarioId', 'nombre')
      .sort({ fechaCreacion: -1 })

    res.status(200).json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Eliminar reseña (FIX)
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    await Datauser.updateOne(
      { usuarioId: review.usuarioId, juegoId: review.juegoId },
      { $pull: { interaccion: review._id } }
    )

    await review.deleteOne()

    res.status(200).json({ mensaje: 'Reseña eliminada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
