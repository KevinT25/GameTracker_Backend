import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'

// Importar rutas
import gameRoutes from './routes/gameRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import datauserRoutes from './routes/datauserRoutes.js'
import userRoutes from './routes/userRoutes.js'
import achievementRoutes from './routes/achievementRoutes.js'
import noticeRoutes from './routes/noticeRoutes.js'
import logrosRoutes from './routes/logrosRoutes.js'

// Inicializar app
const app = express() 
const port = 3000

// Middlewares globales
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true, // Por si manejas cookies o sesiones en el futuro
  })
)

app.use(express.json()) // Parsear JSON
app.use(express.urlencoded({ extended: true })) // Permitir datos de formularios

// Conexión a la base de datos
connectDB()

// Rutas principales
app.use('/api/games', gameRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/dataUser', datauserRoutes)
app.use('/api/noticias', noticeRoutes)
app.use('/api/', logrosRoutes)

// Servidor 
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})