// controllers/logrosController.js
import Datauser from '../models/Datauser.js'
import Achievement from '../models/Achievement.js'

/*torgar un logro a un usuario */
export const otorgarLogro = async (req, res) => {
  try {
    const { usuarioId, logroId, juegoId } = req.params

    let data = await Datauser.findOne({ usuarioId, juegoId })

    if (!data) {
      data = new Datauser({
        usuarioId,
        juegoId,
        logrosDesbloqueados: [],
      })
    }

    const logro = await Achievement.findById(logroId)
    if (!logro) return res.status(404).json({ error: 'Logro no encontrado' })

    const yaTiene = data.logrosDesbloqueados.some(
      (id) => id.toString() === logroId
    )

    if (!yaTiene) {
      data.logrosDesbloqueados.push(logroId)
      data.logrosObtenidos = (data.logrosObtenidos || 0) + 1
      await data.save()
    }

    const updatedData = await Datauser.findById(data._id).populate(
      'logrosDesbloqueados'
    )

    res.status(200).json({
      message: 'Logro desbloqueado correctamente',
      logro,
      total: updatedData.logrosObtenidos,
      logros: updatedData.logrosDesbloqueados,
    })
  } catch (err) {
    console.error('Error otorgando logro:', err)
    res.status(500).json({ error: err.message })
  }
}

/*Obtener todos los logros de un usuario*/
export const obtenerLogrosUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params
    const data = await Datauser.find({ usuarioId }).populate(
      'logrosDesbloqueados'
    )

    const logros = data.flatMap((d) => d.logrosDesbloqueados)
    const logrosUnicos = Array.from(
      new Set(logros.map((l) => l._id.toString()))
    ).map((id) => logros.find((l) => l._id.toString() === id))

    res.status(200).json(logrosUnicos)
  } catch (err) {
    console.error('Error obteniendo logros del usuario:', err)
    res.status(500).json({ error: err.message })
  }
}

/* Desbloquear logro por nombre */
export const desbloquearLogroPorNombre = async (req, res) => {
  try {
    const { usuarioId, logroNombre } = req.body

    if (!usuarioId || !logroNombre) {
      return res.status(400).json({ error: 'Faltan datos' })
    }

    const logro = await Achievement.findOne({ nombre: logroNombre })
    if (!logro) {
      return res.status(404).json({ error: 'Logro no encontrado' })
    }

    let data = await Datauser.findOne({ usuarioId })
    if (!data) {
      data = new Datauser({
        usuarioId,
        logrosDesbloqueados: [],
        logrosObtenidos: 0,
      })
    }

    const yaTiene = data.logrosDesbloqueados.some(
      (id) => id.toString() === logro._id.toString()
    )

    if (yaTiene) {
      return res.status(200).json({ message: 'Logro ya obtenido' })
    }

    data.logrosDesbloqueados.push(logro._id)
    data.logrosObtenidos = (data.logrosObtenidos || 0) + 1
    await data.save()

    res.status(200).json({
      message: `Logro "${logro.nombre}" desbloqueado exitosamente`,
      logro,
    })
  } catch (error) {
    console.error('Error desbloqueando logro:', error)
    res.status(500).json({ error: error.message })
  }
}
