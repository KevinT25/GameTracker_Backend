import express from 'express'
import Notice from '../models/Notice.js'

const router = express.Router()

// Crear noticia
router.post('/', async (req, res) => {
  try {
    const noticia = new Notice(req.body)
    await noticia.save()
    res.status(201).json(noticia)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Leer todas
router.get('/', async (req, res) => {
  try {
    const noticias = await Notice.find().sort({ createdAt: -1 })
    res.json(noticias)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Leer una
router.get('/:id', async (req, res) => {
  try {
    const noticia = await Notice.findById(req.params.id)
    if (!noticia)
      return res.status(404).json({ error: 'Noticia no encontrada' })
    res.json(noticia)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Actualizar
router.put('/:id', async (req, res) => {
  try {
    const noticia = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    res.json(noticia)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id)
    res.json({ message: 'Noticia eliminada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
