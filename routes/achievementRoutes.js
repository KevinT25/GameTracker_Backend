import express from 'express'
import Achievement from '../models/Achievement.js'
import User from '../models/User.js'

const router = express.Router()

// Crear un logro nuevo
router.post('/', async (req, res) => {
  try {
    const newAchievement = new Achievement(req.body)
    console.log(req.body)
    await newAchievement.save()
    res.status(201).json(newAchievement)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Obtener todos los logros
router.get('/', async (req, res) => {
  const achievements = await Achievement.find()
  res.status(200).json(achievements)
})

// Obtener un logro específico
router.get('/achievements/:id', async (req, res) => {
  const achievement = await Achievement.findById(req.params.id)

  if (!achievement) {
    return res.status(404).json({ error: 'Logro no encontrado' })
  }

  res.status(200).json(achievement)
})

// Eliminar un logro
router.delete('/achievements/:id', async (req, res) => {
  const deletedAchievement = await Achievement.findByIdAndDelete(req.params.id)

  if (!deletedAchievement) {
    return res.status(404).json({ error: 'Logro no encontrado' })
  }

  res.status(200).json(deletedAchievement)
})

// Actualizar un logro
router.put('/achievements/:id', async (req, res) => {
  const updatedAchievement = await Achievement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  if (!updatedAchievement) {
    return res.status(404).json({ error: 'Logro no encontrado' })
  }

  res.status(200).json(updatedAchievement)
})

// Asignar un logro a un usuario
router.post('/:userId/add', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    const { achievementId } = req.body

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    const achievement = await Achievement.findById(achievementId)
    if (!achievement)
      return res.status(404).json({ error: 'Logro no encontrado' })

    // Evitar duplicados
    if (user.logros.includes(achievementId)) {
      return res.status(400).json({ error: 'El usuario ya tiene este logro' })
    }

    user.logros.push(achievementId)
    await user.save()

    res.status(200).json({ message: 'Logro asignado al usuario', user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
