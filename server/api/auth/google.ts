import { connectDB } from '../../utils/db'
import { User } from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') return { error: 'Method not allowed' }
  
  await connectDB()
  const body = await readBody(event)
  
  // Aquí recibiremos el token de Google desde el frontend cuando nos den la API Key
  // Usaremos OAuth2Client de 'google-auth-library' para verificarlo
  
  // -- Simulador temporal mientras esperamos la API Key --
  if (!body.googleId) {
    return { error: 'Missing Google Token/ID' }
  }

  try {
    // Buscar o crear usuario
    let user = await User.findOne({ googleId: body.googleId } as any)
    
    if (!user) {
      user = await User.create({
        googleId: body.googleId,
        email: body.email,
        username: body.name, // Nombre de google por defecto
        picture: body.picture,
        avatarId: Math.floor(Math.random() * 24) + 1, // Avatar random inicial
        color: '#f97316'
      } as any)
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' })

    return { 
      token, 
      user: { 
        username: user.username, 
        avatarId: user.avatarId, 
        color: user.color,
        picture: user.picture,
        stats: user.stats 
      } 
    }
  } catch (e: any) {
    return { error: e.message }
  }
})