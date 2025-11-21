import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const verificarToken = (req, res, next) => {
  // 1) intentar leer header Authorization: "Bearer <token>"
  const authHeader = req.headers.authorization || req.headers.Authorization
  let token

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.cookies && req.cookies.token) {
    // fallback si en algún momento quieres usar cookies
    token = req.cookies.token
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado: token faltante' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded normalmente contiene { id: userId, iat, exp }
    req.user = decoded
    next()
  } catch (err) {
    console.error('Error verificando token:', err.message)
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
