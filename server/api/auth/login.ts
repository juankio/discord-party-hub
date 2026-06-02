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
    const user = await User.findOne({ username: body.username })
    if (!user) return { error: 'User not found' }

    const isMatch = await bcrypt.compare(body.password, user.passwordHash)
    if (!isMatch) return { error: 'Invalid password' }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' })

    return { 
      token, 
      user: { 
        username: user.username, 
        avatarId: user.avatarId, 
        color: user.color, 
        stats: user.stats 
      } 
    }
  } catch (e: any) {
    return { error: e.message }
  }
})
