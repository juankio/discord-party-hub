import { connectDB } from '../../utils/db'
import { User } from '../../models/User'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const updateSchema = z.object({
  username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres").max(30, "El nombre de usuario no puede exceder los 30 caracteres").optional(),
  avatarId: z.number().min(1, "Avatar inválido").max(24, "Avatar inválido").optional(),
  color: z.string().optional(),
  useGooglePicture: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    return { success: false, data: null, message: null, error: 'Method not allowed' }
  }
  
  await connectDB()
  const body = await readBody(event)
  
  if (!body.token || !body.updates) {
    return { success: false, data: null, message: null, error: 'Faltan datos requeridos' }
  }

  try {
    // 1. Verificar identidad del usuario mediante el JWT
    const decoded = jwt.verify(body.token, process.env.JWT_SECRET || 'secret') as { id: string }
    
    if (!decoded.id) {
      throw new Error('Token inválido')
    }

    // 2. Validar el payload (updates) con Zod
    const validation = updateSchema.safeParse(body.updates)
    if (!validation.success) {
      const errorMessages = validation.error.issues.map((err: any) => err.message).join(', ')
      return { success: false, data: null, message: null, error: `Datos inválidos: ${errorMessages}` }
    }

    const updates = validation.data
    const safeUpdates: any = {}

    if (updates.username) safeUpdates.username = updates.username
    if (updates.avatarId !== undefined) safeUpdates.avatarId = updates.avatarId
    if (updates.color) safeUpdates.color = updates.color
    
    if (updates.useGooglePicture !== undefined) {
      // Si apaga la foto de Google, la borramos en el frontend la puede reactivar
      if (!updates.useGooglePicture) {
         safeUpdates.picture = ''
      }
    }

    // 3. Actualizar la base de datos
    const updatedUserDoc = await User.findByIdAndUpdate(decoded.id as any, { $set: safeUpdates }, { new: true } as any)
    if (!updatedUserDoc) {
      return { success: false, data: null, message: null, error: 'Usuario no encontrado' }
    }

    const updatedUser = { 
      username: (updatedUserDoc as any).username, 
      avatarId: (updatedUserDoc as any).avatarId, 
      color: (updatedUserDoc as any).color,
      picture: (updatedUserDoc as any).picture,
      stats: (updatedUserDoc as any).stats 
    }

    // Retorno con la estructura sagrada
    return { 
      success: true, 
      data: { user: updatedUser }, 
      message: 'Perfil actualizado',
      error: undefined
    }
  } catch (e: any) {
    console.error("Profile Update Error:", e);
    return { success: false, data: null, message: null, error: 'No se pudo actualizar el perfil. Sesión inválida.' }
  }
})