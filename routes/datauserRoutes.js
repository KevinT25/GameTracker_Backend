import express from 'express'
import Datauser from '../models/Datauser.js'
import Users from '../models/User.js'
import { procesarLogrosAutomaticos } from '../controllers/condicioneslogro.js'

const router = express.Router()

//----------------------USO GENERAL----------------------//
// Crear o actualizar una relación usuario-juego
router.post('/', async (req, res) => {
  try {
    const {
      usuarioId,
      juegoId,
      completado,
      misjuegos,
      wishlist,
      miLogro,
      horasJugadas,
      level,
    } = req.body
    let data = await Datauser.findOne({ usuarioId, juegoId })

    if (data) {
      Object.assign(data, {
        completado: completado ?? data.completado,
        misjuegos: misjuegos ?? data.misjuegos,
        wishlist: wishlist ?? data.wishlist,
        horasJugadas: horasJugadas ?? data.horasJugadas,
        miLogro: miLogro ?? data.miLogro,
        level: level ?? data.level,
      })
      await data.save()
      return res.status(200).json(data)
    }

    const newData = new Datauser({
      usuarioId,
      juegoId,
      completado,
      misjuegos,
      wishlist,
      horasJugadas,
      miLogro,
      level,
    })
    await newData.save()
    res.status(201).json(newData)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// Obtener datos del usuario
router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const data = await Datauser.find({
      usuarioId: req.params.usuarioId,
    })
      .populate('juegoId')
      .populate('logrosDesbloqueados')
    res.status(200).json(data)
  } catch (err) {
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

//----------------------AÑADIR A AMIGOS----------------------//
// Crear amigos
router.post('/usuario/:usuarioId/anadir-amigo/:amigoId', async (req, res) => {
  try {
    const { usuarioId, amigoId } = req.params

    if (usuarioId === amigoId) {
      return res.status(400).json({ message: 'No puedes agregarte a ti mismo' })
    }

    const usuarioData = await Datauser.findOne({ usuarioId })
    const amigo = await Users.findById(amigoId)

    if (!usuarioData || !amigo) {
      return res.status(404).json({ message: 'Usuario o amigo no encontrado' })
    }

    if (usuarioData.amigos.includes(amigoId)) {
      return res.status(400).json({ message: 'Ya son amigos' })
    }

    usuarioData.amigos.push(amigoId)
    usuarioData.cantidadamigos = usuarioData.amigos.length // actualizar contador
    await usuarioData.save()

    const usuarioDat = await Datauser.findOne({ usuarioId }).populate(
      'amigos',
      'nombre email'
    )

    res.status(200).json({
      message: 'Amigo agregado exitosamente',
      cantidadamigos: usuarioDat.cantidadamigos,
      amigos: usuarioDat.amigos,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

//----------------------ESTADISITCAS----------------------//
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
        logrosObtenidos: 0,
        reseñasDadas: 0,
        xp: 0,
        level: 0,
      })
    }

    const usuarioData = await Datauser.findOne({ usuarioId })
    const totalAmigos = usuarioData?.cantidadamigos || 0
    const totalTiempo = data.reduce((acc, d) => acc + (d.tiempoActivo || 0), 0)
    const totalLogros = data.reduce(
      (acc, d) => acc + (d.logrosObtenidos || 0),
      0
    )
    const totalCompletados = data.reduce(
      (acc, d) => acc + (d.juegosCompletadas || 0),
      0
    )
    const totalReseñas = data.reduce(
      (acc, d) => acc + (d.interaccion?.length || 0),
      0
    )
    const totalXP = data.reduce((acc, d) => acc + (d.xp || 0), 0)

    const level =
      totalTiempo + totalAmigos + totalLogros + totalCompletados + totalReseñas

    await procesarLogrosAutomaticos(usuarioId, 'subirNivel', null, { level })

    res.status(200).json({
      tiempoActivo: totalTiempo,
      cantidaddeamigos: totalAmigos,
      misionesCompletadas: totalCompletados,
      logrosObtenidos: totalLogros,
      reseñasDadas: totalReseñas,
      xp: totalXP,
      level,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

//-------AÑADIR A MIS JUEGOS, WISLIST O COMPLETADO---------//
// Actualizar datos (completado, misjuegos, wishlist, etc.)
router.put('/usuario/:usuarioId/juego/:juegoId', async (req, res) => {
  try {
    const { usuarioId, juegoId } = req.params
    const updateFields = req.body

    const dataActual = await Datauser.findOne({ usuarioId, juegoId })

    const antesCompletado = dataActual?.completado || false
    const antesWishlist = dataActual?.wishlist || false

    // Actualizar campos
    const data = await Datauser.findOneAndUpdate(
      { usuarioId, juegoId },
      { $set: updateFields },
      { new: true, upsert: true }
    )

    if (updateFields.misjuegos === true) {
      // Verificar si ya tiene el logro de "misJuegos" global
      const yaTieneLogro = await Datauser.exists({
        usuarioId,
        logrosDesbloqueados: '69177c9b2cd27f6edfac7a36',
      })

      if (!yaTieneLogro) {
        await procesarLogrosAutomaticos(
          usuarioId,
          'misJuegos',
          juegoId,
          updateFields
        )
      }
    }

    // Logro wishlist
    if (updateFields.wishlist === true && !antesWishlist) {
      await procesarLogrosAutomaticos(
        usuarioId,
        'wishlist',
        juegoId,
        updateFields
      )
    }

    // Solo contar "completado" si cambió de false -> true
    if (updateFields.completado === true && !antesCompletado) {
      await Datauser.updateOne(
        { usuarioId, juegoId },
        { $inc: { juegosCompletadas: 1 } }
      )

      await procesarLogrosAutomaticos(usuarioId, 'juegoCompletado', juegoId, {
        totalCompletados: (dataActual?.juegosCompletadas || 0) + 1,
      })
    }

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

//----------------------GENERO/PERSONAJE----------------------//
// Obtener el género del usuario
router.get('/usuario/:usuarioId/genero', async (req, res) => {
  try {
    const { usuarioId } = req.params
    const data = await Datauser.findOne({ usuarioId })

    if (!data || !data.genero) {
      return res.status(200).json({ genero: null })
    }

    res.status(200).json({ genero: data.genero })
  } catch (err) {
    console.error('Error al obtener género:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Actualizar o guardar el género del usuario
router.put('/usuario/:usuarioId/genero', async (req, res) => {
  try {
    const { usuarioId } = req.params
    const { genero } = req.body

    if (!genero) {
      return res.status(400).json({ error: 'Debe enviar un género' })
    }

    // Buscar cualquier registro del usuario
    let data = await Datauser.findOne({ usuarioId })

    // Si no existe, crear un registro nuevo solo con el género
    if (!data) {
      data = new Datauser({ usuarioId, genero })
    } else {
      data.genero = genero
    }

    await data.save()
    res.status(200).json({ message: 'Género actualizado correctamente', data })
  } catch (err) {
    console.error('Error al actualizar género:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
