import express from 'express'
import Datauser from '../models/Datauser.js'

const router = express.Router()

// Crear o actualizar una relación usuario-juego
router.post('/', async (req, res) => {
  try {
    const {
      usuarioId,
      juegoId,
      completado,
      misjuegos,
      wishlist, 
      horasJugadas,
      karma,
      level,
    } = req.body

    let data = await Datauser.findOne({ usuarioId, juegoId })
    if (data) {
      data.completado = completado ?? data.completado
      data.misjuegos = misjuegos ?? data.misjuegos
      data.wishlist = wishlist ?? data.wishlist 
      data.horasJugadas = horasJugadas ?? data.horasJugadas
      data.karma = karma ?? data.karma
      data.level = level ?? data.level
      await data.save()
      return res.status(200).json(data)
    } // Si no existe, se crea una nueva relación

    const newData = new Datauser({
      usuarioId,
      juegoId,
      completado,
      misjuegos,
      wishlist,
      horasJugadas,
      karma,
      level,
    })
    await newData.save()
    res.status(201).json(newData)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// Obtener estadísticas del usuario
router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const data = await Datauser.find({
      usuarioId: req.params.usuarioId,
    }).populate('juegoId')
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// Obtener estadísticas del usuario
router.get('/usuario/:usuarioId/stats', async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId
    const data = await Datauser.find({ usuarioId })

    if (!data || data.length === 0) {
      return res.status(200).json({
        tiempoActivo: 0,
        cantidaddeamigos: 0,
        misionesCompletadas: 0,
        tesorosDescubiertos: 0,
        logrosObtenidos: 0,
        reseñasDadas: 0,
      })
    }

    // Sumar los campos de todos los registros
    const totalTiempo = data.reduce((acc, d) => acc + (d.tiempoActivo || 0), 0)
    const totalAmigos = data.reduce((acc, d) => acc + (d.amigos || 0), 0)
    const totalLogros = data.reduce((acc, d) => acc + (d.logrosObtenidos || 0), 0)
    const totalEaster = data.reduce((acc, d) => acc + (d.easterEggs || 0), 0)
    const totalCompletados = data.reduce(
      (acc, d) => acc + (d.juegosCompletadas || 0),
      0
    )
    const totalReseñas = data.reduce(
      (acc, d) => acc + ((d.interaccion && d.interaccion.length) || 0),
      0
    )

    const resumen = {
      tiempoActivo: totalTiempo,
      cantidaddeamigos: totalAmigos,
      misionesCompletadas: totalCompletados,
      tesorosDescubiertos: totalEaster,
      logrosObtenidos: totalLogros,
      reseñasDadas: totalReseñas,
    }

    res.status(200).json(resumen)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Obtener un juego específico de un usuario
router.get('/usuario/:usuarioId/juego/:juegoId', async (req, res) => {
  try {
    const data = await Datauser.findOne({
      usuarioId: req.params.usuarioId,
      juegoId: req.params.juegoId,
    }).populate('juegoId')

    if (!data) {
      return res
        .status(404)
        .json({ error: 'No se encontró relación usuario-juego' })
    }

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Actualizar datos (completado, misjuegos, wishlist, etc.) 
router.put('/usuario/:usuarioId/juego/:juegoId', async (req, res) => {
  try {
    const { usuarioId, juegoId } = req.params
    const updateFields = req.body

    const data = await Datauser.findOneAndUpdate(
      { usuarioId, juegoId },
      { $set: updateFields },
      { new: true, upsert: true } 
    )

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Eliminar una relación usuario-juego
router.delete('/usuario/:usuarioId/juego/:juegoId', async (req, res) => {
  try {
    const deleted = await Datauser.findOneAndDelete({
      usuarioId: req.params.usuarioId,
      juegoId: req.params.juegoId,
    })

    if (!deleted) {
      return res
        .status(404)
        .json({ error: 'No se encontró relación para eliminar' })
    }

    res.status(200).json({ message: 'Relación eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
