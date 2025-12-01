import express from 'express'
import Review from '../models/Review.js'
import { verificarToken } from '../middleware/auth.js'

const router = express.Router()

// ===============================
// 🔥 Middleware Anti-Spam (2s)
// ===============================
const cooldowns = new Map()

function antiSpam(req, res, next) {
  const userId = req.user.id // AHORA VIENE DEL TOKEN

  const now = Date.now()
  const last = cooldowns.get(userId)

  if (last && now - last < 2000) {
    return res
      .status(429)
      .json({ error: 'Debes esperar 2 segundos antes de hacer otra acción' })
  }

  cooldowns.set(userId, now)
  next()
}

// ===============================
// 🔥 CREAR RESEÑA
// ===============================
router.post('/', verificarToken, antiSpam, async (req, res) => {
  try {
    const review = new Review({
      ...req.body,
      usuarioId: req.user.id,
      nombreUsuario: req.user.username,
    })

    await review.save()
    res.status(201).json(review)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ===============================
// 🔥 OBTENER TODAS LAS RESEÑAS
// ===============================
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ===============================
// 🔥 OBTENER RESEÑA POR ID
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })
    res.json(review)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ===============================
// 🔥 EDITAR RESEÑA
// ===============================
router.put('/:id', verificarToken, antiSpam, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    // Solo autor o admin puede editar
    if (review.usuarioId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    Object.assign(review, req.body)
    await review.save()

    res.json(review)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ===============================
// 🔥 ELIMINAR RESEÑA
// ===============================
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    if (review.usuarioId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    await review.deleteOne()
    res.json({ mensaje: 'Reseña eliminada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ===============================
// 🔥 AGREGAR COMENTARIO
// ===============================
router.post('/:id/comentar', verificarToken, antiSpam, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    review.comentarios.push({
      usuarioId: req.user.id,
      nombreUsuario: req.user.username,
      texto: req.body.texto,
      fecha: new Date(),
    })

    await review.save()
    res.json(review)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ===============================
// 🔥 RESPONDER COMENTARIO
// ===============================
router.post(
  '/:id/comentario/:comentarioId/responder',
  verificarToken,
  antiSpam,
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id)
      if (!review)
        return res.status(404).json({ error: 'Reseña no encontrada' })

      const comentario = review.comentarios.id(req.params.comentarioId)
      if (!comentario)
        return res.status(404).json({ error: 'Comentario no encontrado' })

      comentario.respuestas.push({
        usuarioId: req.user.id,
        nombreUsuario: req.user.username,
        texto: req.body.texto,
        fecha: new Date(),
      })

      await review.save()
      res.json(review)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// ===============================
// 🔥 ELIMINAR COMENTARIO
// ===============================
router.delete(
  '/:id/comentario/:comentarioId',
  verificarToken,
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id)
      if (!review)
        return res.status(404).json({ error: 'Reseña no encontrada' })

      const comentario = review.comentarios.id(req.params.comentarioId)
      if (!comentario)
        return res.status(404).json({ error: 'Comentario no encontrado' })

      if (
        comentario.usuarioId.toString() !== req.user.id &&
        !req.user.isAdmin
      ) {
        return res.status(403).json({ error: 'No autorizado' })
      }

      comentario.remove()
      await review.save()

      res.json({ mensaje: 'Comentario eliminado' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// ===============================
// 🔥 ELIMINAR RESPUESTA
// ===============================
router.delete(
  '/:id/comentario/:comentarioId/respuesta/:respuestaId',
  verificarToken,
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id)
      if (!review)
        return res.status(404).json({ error: 'Reseña no encontrada' })

      const comentario = review.comentarios.id(req.params.comentarioId)
      if (!comentario)
        return res.status(404).json({ error: 'Comentario no encontrado' })

      const respuesta = comentario.respuestas.id(req.params.respuestaId)
      if (!respuesta)
        return res.status(404).json({ error: 'Respuesta no encontrada' })

      if (respuesta.usuarioId.toString() !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'No autorizado' })
      }

      respuesta.remove()
      await review.save()

      res.json({ mensaje: 'Respuesta eliminada' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// ===============================
// 🔥 REPORTAR RESEÑA
// ===============================
router.post('/:id/reportar', verificarToken, antiSpam, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' })

    const yaReporto = review.reportes.some(
      (r) => r.usuarioId.toString() === req.user.id
    )

    if (yaReporto) {
      return res.status(400).json({ error: 'Ya has reportado esta reseña' })
    }

    review.reportes.push({
      usuarioId: req.user.id,
      motivo: req.body.motivo,
      fecha: new Date(),
    })

    await review.save()
    res.json({ mensaje: 'Reporte enviado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
