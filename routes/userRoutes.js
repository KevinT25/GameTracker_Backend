import express from 'express'
import User from '../models/User.js'
const router = express.Router()

// Registro
router.post('/', async (req, res) => {
  const { nombre, email, contrasenia } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' })
    }

    const newUser = new User({ nombre, email, contrasenia })
    await newUser.save()

    res.status(201).json({
      id: newUser._id,
      nombre: newUser.nombre,
      email: newUser.email,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

//Login
router.post('/login', async (req, res) => {
  const { email, contrasenia } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (user.contrasenia !== contrasenia) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    // Login exitoso
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
      },
    })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  const users = await User.find()
  res.status(200).json(users)
})

// Obtener un usuario específico
router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)

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
