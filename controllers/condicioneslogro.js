import Datauser from '../models/Datauser.js'
import Achievement from '../models/Achievement.js'

// Tabla de reglas por nombre de logro
const reglasLogros = {
  'El Juramento del Acero': {
    evento: 'login',
    condicion: () => true,
  },

  'Eco del Héroe Caído': {
    evento: 'nuevaReseña',
    condicion: (data) => (data.interaccion?.length || 0) >= 1,
  },

  'Sabiduría del Archivo Perdido': {
    evento: 'muchaResena',
    condicion: (data) => (data.totalResenas || 0) >= 10,
  },

  'Jugador principiante': {
    evento: 'subirNivel',
    condicion: (data) => data.level >= 5,
  },

  'Jugador Veterano': {
    evento: 'subirNivel',
    condicion: (data) => data.level >= 30,
  },

  'Ascenso del Eterno': {
    evento: 'subirNivel',
    condicion: (data) => data.level >= 80,
  },

  'Consejero Real': {
    evento: 'respuestaComentario',
    condicion: (data) => (data.interaccion?.length || 0) >= 1,
  },

  'Lobo fiel': {
    evento: 'login',
    condicion: (data) => data.loginCount >= 7,
  },

  'Coleccionista de aventuras': {
    evento: 'misJuegos',
    condicion: (data) => data.misjuegos === true,
  },

  'Coleccionador de logros': {
    evento: 'evaluar',
    condicion: (data, totalLogros) =>
      data.logrosDesbloqueados.length === totalLogros - 1,
  },
}

export const procesarLogrosAutomaticos = async (
  usuarioId,
  evento,
  juegoId = null,
  dataExtra = {}
) => {
  try {
    const filtro = juegoId ? { usuarioId, juegoId } : { usuarioId }
    const data = await Datauser.findOne(filtro)

    if (!data) return

    if (!Array.isArray(data.logrosDesbloqueados)) {
      data.logrosDesbloqueados = []
    }

    const logros = await Achievement.find()

    for (const logro of logros) {
      const regla = reglasLogros[logro.nombre]
      if (!regla) continue

      if (regla.evento !== evento) continue

      if (data.logrosDesbloqueados.includes(logro._id)) continue

      const cumple =
        logro.nombre === 'Coleccionador de logros'
          ? regla.condicion({ ...data.toObject(), ...dataExtra }, logros.length)
          : regla.condicion({ ...data.toObject(), ...dataExtra })

      if (cumple) {
        data.logrosDesbloqueados.push(logro._id)
      }
    }

    // Actualiza el total
    data.logrosObtenidos = data.logrosDesbloqueados.length

    await data.save()
  } catch (err) {
    console.error('❌ Error verificando logros automáticos:', err)
  }
}
