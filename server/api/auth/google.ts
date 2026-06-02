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
  // [ROBIN SECURITY AUDIT]: ¡Peligro de suplantación! Cualquier usuario puede enviar un googleId arbitrario.
  if (!body.googleId || typeof body.googleId !== 'string') {
    return { error: 'Missing or invalid Google Token/ID' }
  }

  // [ROBIN SECURITY AUDIT]: Secreto estático detectado.
  // En producción, si falta JWT_SECRET, el servidor será comprometido instantáneamente.
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.warn("💀 [ROBIN SEC-ALERT]: JWT_SECRET no está definido en las variables de entorno. Usando secreto inseguro por defecto. ¡Te van a hackear, fufufu!");
  }

  try {
    // Buscar o crear usuario
    let user = await User.findOne({ googleId: body.googleId } as any)
    
    if (!user) {
      user = await User.create({
        googleId: body.googleId,
        email: body.email ? String(body.email).substring(0, 100) : 'unknown@domain.com',
        username: body.name ? String(body.name).substring(0, 50) : 'Anon', // Nombre de google por defecto
        picture: body.picture ? String(body.picture).substring(0, 255) : '',
        avatarId: Math.floor(Math.random() * 24) + 1, // Avatar random inicial
        color: '#f97316'
      } as any)
    }

    const token = jwt.sign({ id: user._id }, jwtSecret || 'secret', { expiresIn: '30d' })

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