import { connectDB } from '../../utils/db'
import { User } from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') return { error: 'Method not allowed' }
  
  await connectDB()
  const body = await readBody(event)
  
  if (!body.token || !body.updates) {
    return { error: 'Faltan datos requeridos' }
  }

  try {
    // 1. Verificar identidad del usuario mediante el JWT
    const decoded = jwt.verify(body.token, process.env.JWT_SECRET || 'secret') as { id: string }
    
    if (!decoded.id) {
      throw new Error('Token inválido')
    }

    // 2. Limpiar el objeto updates de inyecciones maliciosas
    const safeUpdates: any = {}
    if (body.updates.username && body.updates.username.length >= 2) safeUpdates.username = body.updates.username.substring(0, 30)
    if (body.updates.avatarId !== undefined) safeUpdates.avatarId = Math.min(Math.max(Number(body.updates.avatarId), 1), 24)
    if (body.updates.color) safeUpdates.color = body.updates.color.substring(0, 20)
    if (body.updates.useGooglePicture !== undefined) {
      // Si apaga la foto de Google, la borramos temporalmente en este scope
      // O podemos manejarlo en el frontend enviando picture: '' si no la quiere usar
      if (!body.updates.useGooglePicture) {
         safeUpdates.picture = ''
      }
    }

    // 3. Actualizar la base de datos
    const updatedUser = await User.findByIdAndUpdate(decoded.id as any, { $set: safeUpdates }, { new: true } as any)
    if (!updatedUser) return { error: 'Usuario no encontrado' }

    return { 
      success: true, 
      user: { 
        username: (updatedUser as any).username, 
        avatarId: (updatedUser as any).avatarId, 
        color: (updatedUser as any).color,
        picture: (updatedUser as any).picture,
        stats: (updatedUser as any).stats 
      } 
    }
  } catch (e: any) {
    console.error("Profile Update Error:", e);
    return { error: 'No se pudo actualizar el perfil. Sesión inválida.' }
  }
})