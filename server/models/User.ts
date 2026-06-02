import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  username: { type: String, required: true },
  avatarId: { type: Number, default: 1 },
  color: { type: String, default: '#f97316' },
  picture: { type: String }, // Fallback para la foto de Google si prefieren usarla
  stats: {
    unoWins: { type: Number, default: 0 },
    pinturilloWins: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 }
  }
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
