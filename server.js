import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import userRoutes from './routes/user.js'

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/gametracker')

app.use('/api/users', userRoutes)

app.listen(4000, () => console.log('Servidor activo en puerto 4000'))
