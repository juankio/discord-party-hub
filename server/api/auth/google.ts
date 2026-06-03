import { connectDB } from '../../utils/db'
import { User } from '../../models/User'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') return { error: 'Method not allowed' }
  
  await connectDB()
  const body = await readBody(event)
  
  if (!body.token) {
    return { error: 'Missing Google Token' }
  }

  try {
    // Verificar token con Google (Usamos el access_token o el id_token)
    // Asumimos que vue3-google-login nos mandó un credential (id_token) si usamos el popup estándar
    const ticket = await client.verifyIdToken({
      idToken: body.token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) return { error: 'Invalid Google Token' };

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Buscar o crear usuario
    let user = await User.findOne({ googleId: googleId } as any)
    
    if (!user) {
      user = await User.create({
        googleId: googleId,
        email: email,
        username: name,
        picture: picture,
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
    console.error("Google Auth Error:", e);
    return { error: 'Authentication failed. Please try again.' }
  }
})