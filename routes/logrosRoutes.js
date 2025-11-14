import express from 'express'
import {
  otorgarLogro,
  obtenerLogrosUsuario,
  desbloquearLogroPorNombre,
} from '../controllers/logrosController.js'

const router = express.Router()

// Otorgar un logro 
router.post('/usuario/:usuarioId/logros/:logroId', otorgarLogro)

// Desbloquear logro por nombre
router.post('/logros/desbloquear', desbloquearLogroPorNombre)

// Obtener todos los logros del usuario
router.get('/usuario/:usuarioId/logros', obtenerLogrosUsuario)

export default router
