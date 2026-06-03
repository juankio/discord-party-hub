import { connectDB } from '../../../utils/db'
import { User } from '../../../models/User'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string

  if (!code) {
    return sendRedirect(event, '/?error=missing_code')
  }

  try {
    await connectDB()

    // 1. Intercambiar el código por tokens
    const { tokens } = await client.getToken(code)
    
    // 2. Verificar el ID Token
    if (!tokens.id_token) {
      throw new Error('No id_token received')
    }
    
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.sub) {
      throw new Error('Invalid Google Token payload')
    }

    const googleId = payload.sub
    const email = payload.email
    const name = payload.name || payload.given_name || 'Gamer'
    const picture = payload.picture

    // 3. Buscar o crear usuario en MongoDB
    let user = await User.findOne({ googleId: googleId } as any)
    
    if (!user) {
      user = await User.create({
        googleId: googleId,
        email: email,
        username: name,
        picture: picture,
        avatarId: Math.floor(Math.random() * 24) + 1,
        color: '#f97316'
      } as any)
    }

    // 4. Generar JWT Interno
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' })

    // 5. Preparar la inyección de estado en localStorage (Para Pinia playerStore)
    const userData = {
      userId: user._id.toString(),
      nickname: user.username,
      avatarId: user.avatarId,
      color: user.color,
      isLoggedIn: true,
      token: token,
      totalWins: user.stats?.totalWins || 0,
      picture: user.picture
    }

    // 6. Enviar HTML que inyecta en localStorage y redirige al home
    const htmlResponse = `
      <html>
        <head><title>Autenticando...</title></head>
        <body style="background-color: #0A0A0A; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
          <h2>Iniciando sesión...</h2>
          <script>
            try {
              // Rescatamos datos viejos (si el usuario ya tenía un roomId guardado temporalmente)
              const oldDataRaw = window.localStorage.getItem('party-hub-user');
              let roomId = '';
              if (oldDataRaw) {
                const oldData = JSON.parse(oldDataRaw);
                roomId = oldData.roomId || '';
              }
              
              const newData = ${JSON.stringify(userData)};
              if (roomId) newData.roomId = roomId;

              window.localStorage.setItem('party-hub-user', JSON.stringify(newData));
              window.location.href = '/';
            } catch(e) {
              console.error(e);
              window.location.href = '/?error=storage';
            }
          </script>
        </body>
      </html>
    `
    
    event.node.res.setHeader('Content-Type', 'text/html')
    return htmlResponse

  } catch (error) {
    console.error('OAuth Callback Error:', error)
    return sendRedirect(event, '/?error=oauth_failed')
  }
})
