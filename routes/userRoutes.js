import express from 'express'
import User from '../models/User.js'
import Datauser from '../models/Datauser.js'
import { procesarLogrosAutomaticos } from '../controllers/condicioneslogro.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { verificarToken } from '../middleware/auth.js'

dotenv.config()

const router = express.Router()
const SALT_ROUNDS = 10

// Registro (ahora con hash de contraseña)
router.post('/', async (req, res) => {
  const { nombre, email, contrasenia } = req.body
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ error: 'El usuario ya existe' })

    const hashed = await bcrypt.hash(contrasenia, SALT_ROUNDS)

    const newUser = new User({ nombre, email, contrasenia: hashed })
    await newUser.save()

    // Crear datauser inicial
    const data = new Datauser({
      usuarioId: newUser._id,
      loginCount: 1,
      logrosDesbloqueados: [],
    })
    await data.save()

    await procesarLogrosAutomaticos(newUser._id, 'login')

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

// Login (ahora genera JWT)
router.post('/login', async (req, res) => {
  const { email, contrasenia } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    // comparar hash
    const match = await bcrypt.compare(contrasenia, user.contrasenia)
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' })

    // Actualizar o crear Datauser loginCount
    let data = await Datauser.findOne({ usuarioId: user._id })
    if (!data) {
      data = new Datauser({ usuarioId: user._id, loginCount: 0 })
    }
    data.loginCount = (data.loginCount || 0) + 1
    await data.save()

    await procesarLogrosAutomaticos(user._id, 'login')

    // Crear JWT
    const payload = { id: user._id }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    // Responder el token y user (front guardará token)
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
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

// Obtener todos los usuarios (ejemplo: proteger si quieres)
router.get('/', verificarToken, async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener un usuario específico (PROTEGIDO)
router.get('/users/:id', verificarToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Eliminar un usuario (PROTEGIDO)
router.delete('/users/:id', verificarToken, async (req, res) => {
  try {
    // opcional: validar que req.user.id === req.params.id o que sea admin
    const deletedUser = await User.findByIdAndDelete(req.params.id)
    if (!deletedUser)
      return res.status(404).json({ error: 'Usuario no encontrado' })
    res.status(200).json(deletedUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Actualizar un usuario (PROTEGIDO)
router.put('/users/:id', verificarToken, async (req, res) => {
  try {
    // opcional: validar permisos
    const updateData = { ...req.body }
    // Si vienen contrasenia, aplicar hash
    if (updateData.contrasenia) {
      updateData.contrasenia = await bcrypt.hash(
        updateData.contrasenia,
        SALT_ROUNDS
      )
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    )
    if (!updatedUser)
      return res.status(404).json({ error: 'Usuario no encontrado' })
    res.status(200).json(updatedUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
