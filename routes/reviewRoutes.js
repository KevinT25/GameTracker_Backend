import express from 'express'
import Review from '../models/Review.js'

const router = express.Router()

// Crear una reseña
router.post('/', async (req, res) => {
  try {
    const newReview = new Review(req.body)
    console.log(req.body)
    await newReview.save()
    res.status(201).json(newReview)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Obtener todas las reseñas
router.get('/', async (req, res) => {
  const reviews = await Review.find().populate(
    'juego',
    'titulo genero plataforma'
  )
  res.status(200).json(reviews)
})

// Obtener una reseña específica
router.get('/reviews/:id', async (req, res) => {
  const review = await Review.findById(req.params.id).populate(
    'juego',
    'titulo'
  )

  if (!review) {
    return res.status(404).json({ error: 'Reseña no encontrada' })
  }

  res.status(200).json(review)
})

// Eliminar una reseña
router.delete('/reviews/:id', async (req, res) => {
  const deletedReview = await Review.findByIdAndDelete(req.params.id)

  if (!deletedReview) {
    return res.status(404).json({ error: 'Reseña no encontrada' })
  }

  res.status(200).json(deletedReview)
})

// Actualizar una reseña
router.put('/reviews/:id', async (req, res) => {
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  )

  if (!updatedReview) {
    return res.status(404).json({ error: 'Reseña no encontrada' })
  }

  res.status(200).json(updatedReview)
})

export default router
