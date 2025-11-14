import express from 'express'
import Game from '../models/Game.js'

const router = express.Router()

// Subir un juego
router.post('/', async (req, res) => {
  try {
    const {
      facilitador,
      titulo,
      genero,
      plataforma,
      anioLanzamiento,
      clasificacionEdad,
      desarrollador,
      imagenPortada,
      descripcion,
    } = req.body

    // Validación básica
    if (
      !facilitador ||
      !titulo ||
      !genero ||
      !plataforma ||
      !anioLanzamiento ||
      !clasificacionEdad ||
      !desarrollador ||
      !imagenPortada
    ) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
    }

    const newGame = new Game({
      facilitador,
      titulo,
      genero,
      plataforma,
      anioLanzamiento,
      clasificacionEdad,
      desarrollador,
      imagenPortada,
      descripcion,
    })

    await newGame.save()
    res.status(201).json(newGame)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Obtener todos los juegos (opcionalmente filtrados por facilitador)
router.get('/', async (req, res) => {
  try {
    const { facilitador } = req.query
    const filtro = facilitador ? { facilitador } : {}

    const juegos = await Game.find(filtro)
      .populate('facilitador', 'nombre email') // Mostrar info del usuario
      .sort({ fechaCreacion: -1 })

    res.status(200).json(juegos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener un juego específico
router.get('/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate(
      'facilitador',
      'nombre email'
    )

    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' })
    }

    res.status(200).json(game)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Eliminar un juego
router.delete('/games/:id', async (req, res) => {
  try {
    const deletedGame = await Game.findByIdAndDelete(req.params.id)

    if (!deletedGame) {
      return res.status(404).json({ error: 'Juego no encontrado' })
    }

    res.status(200).json({ mensaje: 'Juego eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Actualizar un juego
router.put('/games/:id', async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!updatedGame) {
      return res.status(404).json({ error: 'Juego no encontrado' })
    }

    res.status(200).json(updatedGame)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
