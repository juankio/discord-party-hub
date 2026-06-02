import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarId: { type: Number, default: 1 },
  color: { type: String, default: '#f97316' },
  stats: {
    unoWins: { type: Number, default: 0 },
    pinturilloWins: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 }
  }
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
