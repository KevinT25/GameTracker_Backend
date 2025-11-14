import express from 'express'
import User from '../models/User.js'
import Datauser from '../models/Datauser.js'
import { procesarLogrosAutomaticos } from '../controllers/condicioneslogro.js'

const router = express.Router()

// Registro
router.post('/', async (req, res) => {
  const { nombre, email, contrasenia } = req.body
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ error: 'El usuario ya existe' })

    const newUser = new User({ nombre, email, contrasenia })
    await newUser.save()

    res.status(201).json({
      id: newUser._id,
      nombre: newUser.nombre,
      email: newUser.email,
    })
  } catch (err) {
    console.error('Error en registro:', err)
    res.status(500).json({ error: 'Error al registrar el usuario' })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, contrasenia } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    if (user.contrasenia !== contrasenia)
      return res.status(401).json({ error: 'Contraseña incorrecta' })

    // Buscar su Datauser
    let data = await Datauser.findOne({ usuarioId: user._id })

    if (!data) {
      data = new Datauser({ usuarioId: user._id })
    }

    // Incrementar contador de inicios de sesión
    data.loginCount = (data.loginCount || 0) + 1

    await data.save()

    // Evaluar logros correspondientes al login
    await procesarLogrosAutomaticos(user._id, 'login')

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
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener un usuario específico
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Eliminar un usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)
    if (!deletedUser)
      return res.status(404).json({ error: 'Usuario no encontrado' })
    res.status(200).json(deletedUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🔹 Actualizar un usuario
router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!updatedUser)
      return res.status(404).json({ error: 'Usuario no encontrado' })
    res.status(200).json(updatedUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
