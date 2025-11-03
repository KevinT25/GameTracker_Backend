import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'

import gameRoutes from './routes/gameRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import datauserRoutes from './routes/datauserRoutes.js'
import userRoutes from './routes/userRoutes.js'
import achievementRoutes from './routes/achievementRoutes.js'

const app = express()
const port = 3000

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })) // <--- permitir frontend
app.use(express.json())

// Conexión a la base de datos
connectDB()

// Rutas
app.use('/api/games', gameRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/dataUser', datauserRoutes)

// Servidor
app.listen(port, () => console.log(`Server running on port ${port}`))
