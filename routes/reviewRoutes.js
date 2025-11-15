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
      dificultad,
      recomendaria,
    } = req.body

    // Verificar existencia del juego y usuario
    const game = await Game.findById(juegoId)
    if (!game) return res.status(404).json({ error: 'Juego no encontrado' })

    const dataUser = await Datauser.findOne({ usuarioId, juegoId })
    if (!dataUser)
      return res.status(400).json({
        error: 'Solo puede reseñar un juego si lo ha jugado',
      })

    // Crear reseña
    const nueva = new Review({
      juegoId,
      usuarioId,
      nombreUsuario,
      puntuacion,
      textoResenia,
      horasJugadas,
      dificultad,
      recomendaria,
    })

    await nueva.save()

    // Asociar reseña al DataUser
    if (!dataUser.interaccion.includes(nueva._id)) {
      dataUser.interaccion.push(nueva._id)
      await dataUser.save()
    }

    // Obtener estadísticas del usuario desde Datauser
    const statsRes = await fetch(
      `http://localhost:3000/api/dataUser/usuario/${usuarioId}/stats`
    )
    const stats = await statsRes.json()

    const totalResenas = stats.reseñasDadas || 0

    // Logro por NUEVA reseña
    await procesarLogrosAutomaticos(usuarioId, 'nuevaResena', null, {
      totalResenas,
    })

    // Logro por 10 reseñas usando totalResenas
    await procesarLogrosAutomaticos(usuarioId, 'muchaResena', null, {
      totalResenas,
    })

    // Populate limpio (solo una vez por campo)
    const reseñaCompleta = await Review.findById(nueva._id)
      .populate('usuarioId', 'nombre')
      .populate('juegoId', 'titulo imagenPortada')
      .populate('respuestas.usuarioId', 'nombre')

    res.status(201).json(reseñaCompleta)
  } catch (err) {
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

    // Guardar la respuesta
    review.respuestas.push({ texto: respuesta, usuarioId, fecha: new Date() })
    await review.save()

    // 🔥 Contar cuántas respuestas ha hecho el usuario en TODAS las reseñas
    const respuestasTotales = await Review.countDocuments({
      'respuestas.usuarioId': usuarioId,
    })

    // LOGRO: Responder comentario (pasamos respuestasTotales)
    await procesarLogrosAutomaticos(usuarioId, 'respuestaComentario', null, {
      respuestasTotales,
    })

    // Populate consistente
    const actualizado = await Review.findById(req.params.id)
      .populate('usuarioId', 'nombre')
      .populate('juegoId', 'titulo imagenPortada')
      .populate('respuestas.usuarioId', 'nombre')

    res.status(200).json(actualizado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener todas las reseñas (con filtros)
router.get('/', async (req, res) => {
  try {
    const { juego, usuario } = req.query
    const filtro = {}
    if (juego) filtro.juegoId = juego
    if (usuario) filtro.usuarioId = usuario

    // Populate limpio y uniforme
    const reviews = await Review.find(filtro)
      .populate('usuarioId', 'nombre')
      .populate('juegoId', 'titulo imagenPortada')
      .populate('respuestas.usuarioId', 'nombre')
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
      .populate('respuestas.usuarioId', 'nombre')
      .sort({ fechaCreacion: -1 })
    res.status(200).json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Eliminar reseña
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return
    res.status(404).json({ error: 'Reseña no encontrada' })

    // Eliminar relación con Datauser
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
