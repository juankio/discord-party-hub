import { connectDB } from '../../utils/db'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') return { error: 'Method not allowed' }
  
  await connectDB()
  const body = await readBody(event)
  
  if (!body.userId || !body.game) {
    return { error: 'Missing fields' }
  }

  try {
    const updateQuery: any = { $inc: { 'stats.totalWins': 1 } }
    updateQuery.$inc[`stats.${body.game}`] = 1

    const user = await User.findByIdAndUpdate(body.userId, updateQuery, { new: true } as any)
    if (!user) return { error: 'User not found' }

    return { success: true, stats: (user as any).stats }
  } catch (e: any) {
    return { error: e.message }
  }
})
