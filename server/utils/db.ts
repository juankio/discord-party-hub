import mongoose from 'mongoose'

let isConnected = false

export const connectDB = async () => {
  if (isConnected) {
    return
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('⚠️ MONGODB_URI no está definido. Ignorando conexión a BD para evitar crash en modo local.')
    return
  }
  
  // Como aún no tenemos usuario/password real puesto por el usuario en el .env, 
  // capturamos el error para que la UI no se caiga mientras lo configuran
  try {
    const db = await mongoose.connect(uri)
    isConnected = db?.connection?.readyState === 1
    console.log('✅ MongoDB conectado')
  } catch (error) {
    console.error('❌ Error conectando a MongoDB. Revisa tus credenciales en el .env:', error)
  }
}
