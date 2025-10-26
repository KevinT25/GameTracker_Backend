import express from 'express'
import Game from '../models/Game.js'

const router = express.Router()

// Subir un juego
router.post('/', async (req, res) => {
  try {
    const newGame = new Game(req.body) 
    console.log(req.body)
    await newGame.save()
    res.status(201).json(newGame)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

//Obtener todo los juegos
router.get('/', async (req, res) => {
  const games = await Game.find()
  res.status(200).json(games)
})

//Obtener los juegos específica
router.get('/games/:id', async (req, res) => {
  const game = await Game.findById(req.params.id)

  if (!game) {
    return res.status(404).json({ error: 'Juego no encontrado' })
  }
  res.status(200).json(game)
})

// Eliminar un juego
router.delete('/games/:id', async (req, res) => {
  const deletedGame = await Game.findByIdAndDelete(req.params.id)

  if (!deletedGame) {
    return res.status(404).json({ error: 'Juego no encontrado' })
  }

  res.status(200).json(deletedGame)
})

// Actualizar un juego
router.put('/games/:id', async (req, res) => {
  const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body)

  if (!updatedGame) {
    return res.status(404).json({ error: 'Juego no encontrado' })
  }

  res.status(200).json(updatedGame)
})

export default router
