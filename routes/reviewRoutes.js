import express from 'express'
import Review from '../models/Review.js'
import { procesarLogrosAutomaticos } from '../controllers/condicioneslogro.js'

const router = express.Router()

/* ============================================================
   1. Crear reseña
   ============================================================ */
router.post('/', async (req, res) => {
  try {
    const {
      juegoId,
      usuarioId,
      nombreUsuario,
      puntuacion,
      textoResenia,
      horasJugadas,
      asunto,
      recomendaria,
    } = req.body

    // Verificar si ya existe una reseña del usuario sobre ese juego
    const existente = await Review.findOne({ juegoId, usuarioId })
    if (existente) {
      return res.status(400).json({
        error: 'Ya has publicado una reseña para este juego.',
      })
    }

    const review = new Review({
      juegoId,
      usuarioId,
      nombreUsuario,
      puntuacion,
      textoResenia,
      horasJugadas,
      asunto,
      recomendaria,
    })

    await review.save()

    // Notificar logro → nuevaResena
    await procesarLogrosAutomaticos(usuarioId, 'nuevaResena', juegoId, {
      totalResenas: await Review.countDocuments({ usuarioId }),
    })

    // Notificar logro → muchaResena (si aplica)
    await procesarLogrosAutomaticos(usuarioId, 'muchaResena', juegoId, {
      totalResenas: await Review.countDocuments({ usuarioId }),
    })

    res.status(201).json(review)
  } catch (err) {
    console.error('Error creando reseña:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   2. Editar reseña
   ============================================================ */
router.put('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    if (review.usuarioId.toString() !== req.body.usuarioId) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const campos = [
      'puntuacion',
      'textoResenia',
      'horasJugadas',
      'asunto',
      'recomendaria',
    ]

    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        review[campo] = req.body[campo]
      }
    })

    review.fechaEdicion = new Date()
    await review.save()

    res.json(review)
  } catch (err) {
    console.error('Error editando reseña:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   3. Eliminar reseña
   ============================================================ */
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    if (review.usuarioId.toString() !== req.body.usuarioId) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    await review.deleteOne()

    res.json({ message: 'Reseña eliminada correctamente' })
  } catch (err) {
    console.error('Error eliminando reseña:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   4. Votar reseña (like / dislike)
   ============================================================ */
router.post('/votar/:id', async (req, res) => {
  try {
    const { usuarioId, voto } = req.body // voto = 1 o -1
    const review = await Review.findById(req.params.id)

    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })
    if (review.usuarioId.toString() === usuarioId) {
      return res.status(400).json({ error: 'No puedes votar tu propia reseña' })
    }

    // quitar voto previo
    review.votos = review.votos.filter(
      (v) => v.usuarioId.toString() !== usuarioId
    )

    // agregar nuevo voto si no es 0
    if (voto !== 0) {
      review.votos.push({ usuarioId, voto })
    }

    await review.save()
    res.json(review)
  } catch (err) {
    console.error('Error votando reseña:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   5. Crear comentario
   ============================================================ */
router.post('/:id/comentarios', async (req, res) => {
  try {
    const { usuarioId, nombreUsuario, texto } = req.body

    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    review.comentarios.push({
      usuarioId,
      nombreUsuario,
      texto,
    })

    await review.save()
    res.json(review)
  } catch (err) {
    console.error('Error comentando reseña:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   6. Responder a un comentario
   ============================================================ */
router.post('/:id/comentarios/:comentarioId/responder', async (req, res) => {
  try {
    const { usuarioId, nombreUsuario, texto } = req.body

    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    const comentario = review.comentarios.id(req.params.comentarioId)
    if (!comentario)
      return res.status(404).json({ error: 'Comentario no encontrado' })

    comentario.respuestas.push({
      usuarioId,
      nombreUsuario,
      texto,
    })

    await review.save()

    // Notificar logro → respuestaComentario
    await procesarLogrosAutomaticos(usuarioId, 'respuestaComentario', null, {
      respuestasTotales: comentario.respuestas.length,
    })

    res.json(review)
  } catch (err) {
    console.error('Error respondiendo comentario:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   7. Obtener todas las reseñas de un juego
   ============================================================ */
router.get('/juego/:juegoId', async (req, res) => {
  try {
    const reviews = await Review.find({ juegoId: req.params.juegoId })
      .sort({ fechaCreacion: -1 })
      .lean()

    res.json(reviews)
  } catch (err) {
    console.error('Error obteniendo reseñas:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   8. Obtener una reseña por ID
   ============================================================ */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    res.json(review)
  } catch (err) {
    console.error('Error obteniendo reseña:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
