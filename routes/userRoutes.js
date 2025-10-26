import express from 'express'
import User from '../models/User.js'

const router = express.Router()

// Crear un usuario (registro)
router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body)
    console.log(req.body)
    await newUser.save()
    res.status(201).json(newUser)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  const users = await User.find().populate('logros', 'nombre descripcion')
  res.status(200).json(users)
})

// Obtener un usuario específico
router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).populate('logros', 'nombre')

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.status(200).json(user)
})

// Eliminar un usuario
router.delete('/users/:id', async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id)

  if (!deletedUser) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.status(200).json(deletedUser)
})

// Actualizar un usuario
router.put('/users/:id', async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })

  if (!updatedUser) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.status(200).json(updatedUser)
})

export default router
