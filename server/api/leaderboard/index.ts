import mongoose from 'mongoose'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  // Connect to DB if not connected
  if (mongoose.connection.readyState !== 1) {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-party-hub'
      await mongoose.connect(uri)
    } catch (e) {
      console.error('MongoDB connection error in leaderboard', e)
      return []
    }
  }

  try {
    const topPlayers = await User.find()
      .sort({ 'stats.totalWins': -1 })
      .limit(5)
      .select('username avatarId color stats.totalWins')
      .lean()
    
    return topPlayers.map(p => ({
      username: p.username,
      avatarId: p.avatarId,
      color: p.color,
      totalWins: p.stats?.totalWins || 0
    }))
  } catch (error) {
    console.error('Leaderboard error:', error)
    return []
  }
})
