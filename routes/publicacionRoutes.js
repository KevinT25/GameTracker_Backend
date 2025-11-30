import express from 'express'
import Publicacion from '../models/Publicacion.js'

const router = express.Router()

// CREAR PUBLICACIÓN
router.post('/', async (req, res) => {
  try {
    const { usuarioId, nombreUsuario, titulo, contenido, tag } = req.body

    const nueva = new Publicacion({
      usuarioId,
      nombreUsuario,
      titulo,
      contenido,
      tag,
    })

    await nueva.save()

    res.status(201).json(nueva)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// OBTENER TODAS LAS PUBLICACIONES
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query

    const filtro = {}
    if (tag) filtro.tag = tag

    const lista = await Publicacion.find(filtro).sort({ fechaCreacion: -1 })

    res.status(200).json(lista)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// VOTAR PUBLICACIÓN
router.post('/:id/votar', async (req, res) => {
  try {
    const { usuarioId, voto } = req.body

    const pub = await Publicacion.findById(req.params.id)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada' })

    const yaVoto = pub.votos.find((v) => v.usuarioId.toString() === usuarioId)

    if (yaVoto) {
      if (yaVoto.voto === voto) {
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

// AGREGAR COMENTARIO
router.post('/:id/comentar', async (req, res) => {
  try {
    const { usuarioId, nombreUsuario, texto } = req.body

    const pub = await Publicacion.findById(req.params.id)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada' })

    pub.comentarios.push({
      usuarioId,
      nombreUsuario,
      texto,
    })

    await pub.save()
    res.status(200).json(pub)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// RESPONDER A UN COMENTARIO
router.post('/:postId/comentario/:comentarioId/responder', async (req, res) => {
  try {
    const { usuarioId, nombreUsuario, texto } = req.body

    const pub = await Publicacion.findById(req.params.postId)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada' })

    const comentario = pub.comentarios.id(req.params.comentarioId)
    if (!comentario)
      return res.status(404).json({ error: 'Comentario no encontrado' })

    comentario.respuestas.push({
      usuarioId,
      nombreUsuario,
      texto,
    })

    await pub.save()
    res.status(200).json(pub)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// REPORTAR PUBLICACIÓN
router.post('/:id/reportar', async (req, res) => {
  try {
    const { usuarioId, motivo } = req.body

    const pub = await Publicacion.findById(req.params.id)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada' })

    pub.reportes.push({ usuarioId, motivo })

    await pub.save()
    res.status(200).json({ mensaje: 'Reporte enviado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ELIMINAR PUBLICACIÓN
router.delete('/:id', async (req, res) => {
  try {
    const pub = await Publicacion.findById(req.params.id)
    if (!pub)
      return res.status(404).json({ error: 'Publicación no encontrada' })

    await pub.deleteOne()

    res.status(200).json({ mensaje: 'Publicación eliminada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
