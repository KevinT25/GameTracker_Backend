import express from 'express'
import {
  otorgarLogro,
  obtenerLogrosUsuario,
  desbloquearLogroPorNombre,
  obtenerMiLogros,
  actualizarMiLogro,
} from '../controllers/logrosController.js'

const router = express.Router()

// Otorgar un logro 
router.post('/usuario/:usuarioId/logros/:logroId', otorgarLogro)

// Desbloquear logro por nombre
router.post('/logros/desbloquear', desbloquearLogroPorNombre)

// Obtener todos los logros del usuario
router.get('/usuario/:usuarioId/logros', obtenerLogrosUsuario)

// Obtener el titulo del usuario
router.get('/usuario/:usuarioId/miLogro', obtenerMiLogros)

// Actualizar los logros del usuario
router.put('/usuario/:usuarioId/miLogro', actualizarMiLogro)

export default router
