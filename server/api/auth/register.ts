import { connectDB } from '../../utils/db'
import { User } from '../../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') return { error: 'Method not allowed' }
  
  await connectDB()
  const body = await readBody(event)
  
  if (!body.username || !body.password) {
    return { error: 'Missing fields' }
  }

  try {
    const existing = await User.findOne({ username: body.username })
    if (existing) return { error: 'Username already taken' }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(body.password, salt)

    const newUser = await User.create({
      username: body.username,
      passwordHash: hash,
      avatarId: body.avatarId || 1,
      color: body.color || '#f97316'
    })

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' })

    return { 
      token, 
      user: { 
        username: newUser.username, 
        avatarId: newUser.avatarId, 
        color: newUser.color, 
        stats: newUser.stats 
      } 
    }
  } catch (e: any) {
    return { error: e.message }
  }
})
