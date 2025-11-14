import express from 'express'
import Achievement from '../models/Achievement.js'

const router = express.Router()

// Crear un logro nuevo
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, condicion, icono } = req.body

    if (!nombre || !descripcion || !condicion || !icono) {
      return res
        .status(400)
        .json({ error: 'Todos los campos son obligatorios' })
    }

    const nuevo = new Achievement({ nombre, descripcion, condicion, icono })
    await nuevo.save()

    res.status(201).json(nuevo)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Obtener todos los logros
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ fechaCreacion: -1 })
    res.status(200).json(achievements)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener un logro específico
router.get('/achievements/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
    if (!achievement)
      return res.status(404).json({ error: 'Logro no encontrado' })

    res.status(200).json(achievement)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Eliminar un logro
router.put('/achievements/:id', async (req, res) => {
  try {
    const { nombre, descripcion, condicion, icono } = req.body
    const updated = await Achievement.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, condicion, icono },
      { new: true, runValidators: true }
    )

    if (!updated) return res.status(404).json({ error: 'Logro no encontrado' })

    res.status(200).json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})
// Actualizar un logro
router.put('/achievements/:id', async (req, res) => {
  try {
    const deleted = await Achievement.findByIdAndDelete(req.params.id)
    if (!deleted)
      return res.status(404).json({ error: 'Logro no encontrado' })

    res.status(200).json({ mensaje: 'Logro eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
