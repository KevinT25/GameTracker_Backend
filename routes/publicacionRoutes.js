import express from 'express'
import Publicacion from '../models/Publicacion.js'
import { verificarToken } from '../middleware/auth.js'

const router = express.Router()

/* ============================================================
    SISTEMA DE COOLDOWN EN MEMORIA
============================================================ */
const cooldowns = {
  publicar: new Map(),
  reportar: new Map(),
}

function checkCooldown(map, userId, seconds = 2) {
  const last = map.get(userId)
  const now = Date.now()
  if (last && now - last < seconds * 1000) return false
  map.set(userId, now)
  return true
}

/* ============================================================
    CREAR PUBLICACIÓN
============================================================ */
router.post('/', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.user.id
    const nombreUsuario = req.user.nombre || 'Usuario'
    const { titulo, contenido, tag } = req.body

    if (!titulo?.trim() || !contenido?.trim()) {
      return res
        .status(400)
        .json({ error: 'Título y contenido son requeridos.' })
    }

    if (!tag) {
      return res.status(400).json({ error: 'Debes seleccionar un tag.' })
    }

    if (!checkCooldown(cooldowns.publicar, usuarioId)) {
      return res.status(429).json({
        error: 'Espera 2 segundos antes de publicar de nuevo.',
      })
    }

    const nueva = new Publicacion({
      usuarioId,
      nombreUsuario,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      tag,
    })

    await nueva.save()
    res.status(201).json(nueva)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
    OBTENER PUBLICACIONES
============================================================ */
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query
    const filtro = tag ? { tag } : {}

    const lista = await Publicacion.find(filtro).sort({ createdAt: -1 }).lean()

    const procesado = lista.map((pub) => ({
      ...pub,
      likes: pub.votos.filter((v) => v.voto === 1).length,
      dislikes: pub.votos.filter((v) => v.voto === -1).length,
      totalComentarios: pub.comentarios.length,
    }))

    res.status(200).json(procesado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
    VOTAR PUBLICACIÓN (LIKE / DISLIKE)
============================================================ */
router.post('/:id/votar', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.user.id
    const { voto } = req.body

    if (![1, -1].includes(voto)) {
      return res.status(400).json({ error: 'Voto inválido.' })
    }

    const pub = await Publicacion.findById(req.params.id)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada.' })

    if (pub.usuarioId.toString() === usuarioId) {
      return res
        .status(400)
        .json({ error: 'No puedes votar tu propia publicación.' })
    }

    const yaVoto = pub.votos.find((v) => v.usuarioId.toString() === usuarioId)

    if (yaVoto) {
      if (yaVoto.voto === voto) {
        // Quitar voto si repite el mismo
        pub.votos = pub.votos.filter(
          (v) => v.usuarioId.toString() !== usuarioId
        )
      } else {
        yaVoto.voto = voto
      }
    } else {
      pub.votos.push({ usuarioId, voto })
    }

    await pub.save()
    res.status(200).json(pub)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
    COMENTAR PUBLICACIÓN
============================================================ */
router.post('/:id/comentar', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.user.id
    const nombreUsuario = req.user.nombre || 'Usuario'
    const { texto } = req.body

    if (!texto?.trim()) {
      return res
        .status(400)
        .json({ error: 'El comentario no puede estar vacío.' })
    }

    const pub = await Publicacion.findById(req.params.id)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada.' })

    pub.comentarios.push({
      usuarioId,
      nombreUsuario,
      texto: texto.trim(),
    })

    await pub.save()
    res.status(200).json(pub)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
    RESPONDER A UN COMENTARIO
============================================================ */
router.post(
  '/:postId/comentario/:comentarioId/responder',
  verificarToken,
  async (req, res) => {
    try {
      const usuarioId = req.user.id
      const nombreUsuario = req.user.nombre || 'Usuario'
      const { texto } = req.body

      if (!texto?.trim()) {
        return res
          .status(400)
          .json({ error: 'La respuesta no puede estar vacía.' })
      }

      const pub = await Publicacion.findById(req.params.postId)
      if (!pub)
        return res.status(404).json({ error: 'Publicación no encontrada.' })

      const comentario = pub.comentarios.id(req.params.comentarioId)
      if (!comentario)
        return res.status(404).json({ error: 'Comentario no encontrado.' })

      comentario.respuestas.push({
        usuarioId,
        nombreUsuario,
        texto: texto.trim(),
      })
      await pub.save()
      res.status(200).json(pub)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

/* ============================================================
    REPORTAR PUBLICACIÓN
============================================================ */
router.post('/:id/reportar', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.user.id
    const { motivo } = req.body

    if (!motivo?.trim()) {
      return res.status(400).json({ error: 'Debes especificar un motivo.' })
    }

    if (!checkCooldown(cooldowns.reportar, usuarioId)) {
      return res.status(429).json({
        error: 'Espera 2 segundos antes de reportar de nuevo.',
      })
    }

    const pub = await Publicacion.findById(req.params.id)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada.' })

    const yaReporto = pub.reportes.find(
      (r) => r.usuarioId.toString() === usuarioId
    )
    if (yaReporto) {
      return res.status(400).json({ error: 'Ya reportaste esta publicación.' })
    }

    pub.reportes.push({ usuarioId, motivo: motivo.trim() })
    await pub.save()

    res.status(200).json({ mensaje: 'Reporte enviado.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
    ELIMINAR PUBLICACIÓN
============================================================ */
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.user.id
    const rol = req.user.rol

    const pub = await Publicacion.findById(req.params.id)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada.' })

    if (pub.usuarioId.toString() !== usuarioId && rol !== 'admin') {
      return res
        .status(403)
        .json({ error: 'No puedes eliminar publicaciones de otros.' })
    }

    await pub.deleteOne()
    res.status(200).json({ mensaje: 'Publicación eliminada.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
    ELIMINAR COMENTARIO
============================================================ */
router.delete(
  '/:postId/comentario/:comentarioId',
  verificarToken,
  async (req, res) => {
    try {
      const usuarioId = req.user.id
      const rol = req.user.rol

      const pub = await Publicacion.findById(req.params.postId)
      if (!pub)
        return res.status(404).json({ error: 'Publicación no encontrada.' })

      const comentario = pub.comentarios.id(req.params.comentarioId)
      if (!comentario)
        return res.status(404).json({ error: 'Comentario no encontrado.' })

      if (comentario.usuarioId.toString() !== usuarioId && rol !== 'admin') {
        return res
          .status(403)
          .json({ error: 'No tienes permiso para eliminar este comentario.' })
      }

      comentario.deleteOne()
      await pub.save()

      res.status(200).json({ mensaje: 'Comentario eliminado.' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

/* ============================================================
    ELIMINAR RESPUESTA
============================================================ */
router.delete(
  '/:postId/comentario/:comentarioId/respuesta/:respuestaId',
  verificarToken,
  async (req, res) => {
    try {
      const usuarioId = req.user.id
      const rol = req.user.rol

      const pub = await Publicacion.findById(req.params.postId)
      if (!pub)
        return res.status(404).json({ error: 'Publicación no encontrada.' })

      const comentario = pub.comentarios.id(req.params.comentarioId)
      if (!comentario)
        return res.status(404).json({ error: 'Comentario no encontrado.' })

      const respuesta = comentario.respuestas.id(req.params.respuestaId)
      if (!respuesta)
        return res.status(404).json({ error: 'Respuesta no encontrada.' })

      if (respuesta.usuarioId.toString() !== usuarioId && rol !== 'admin') {
        return res
          .status(403)
          .json({ error: 'No tienes permiso para eliminar esta respuesta.' })
      }

      respuesta.deleteOne()
      await pub.save()

      res.status(200).json({ mensaje: 'Respuesta eliminada.' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

export default router
