import { defineStore } from 'pinia'

// Función simple para generar un ID único
const generateId = () => Math.random().toString(36).substring(2, 15)

export const usePlayerStore = defineStore('player', {
  state: () => ({
    userId: '', // ID único y persistente
    nickname: '',
    avatarId: 1, // 1 a 16
    color: '#f97316', // Color por defecto (naranja)
    roomId: '',
    hostUserId: '', // El ID del creador de la sala
    playersInRoom: [] as any[],
    isLoggedIn: false,
    token: '',
    totalWins: 0,
    picture: ''
  }),
  actions: {
    setPlayerSetup(nickname: string, avatarId: number, color: string = '#f97316') {
      this.nickname = nickname
      this.avatarId = avatarId
      this.color = color
      if (!this.userId) {
        this.userId = generateId()
      }

      try {
        localStorage.setItem('party-hub-user', JSON.stringify({ 
          userId: this.userId,
          nickname, 
          avatarId, 
          color 
        }))
      } catch {}
    },
    loadPlayerSetup() {
      try {
        const data = localStorage.getItem('party-hub-user')
        if (data) {
          try {
            const parsed = JSON.parse(data)
            this.userId = parsed.userId || generateId()
            this.nickname = parsed.nickname || ''
            this.avatarId = parsed.avatarId || 1
            this.color = parsed.color || '#f97316'
            this.isLoggedIn = parsed.isLoggedIn || false
            this.token = parsed.token || ''
            this.totalWins = parsed.totalWins || 0
            this.picture = parsed.picture || ''
            
            // Si el usuario viene de la versión anterior y no tiene userId, se lo creamos y guardamos
            if (!parsed.userId) {
              this.userId = generateId()
              localStorage.setItem('party-hub-user', JSON.stringify({ 
                userId: this.userId,
                nickname: this.nickname, 
                avatarId: this.avatarId, 
                color: this.color,
                isLoggedIn: this.isLoggedIn,
                token: this.token,
                totalWins: this.totalWins,
                picture: this.picture
              }))
            } else {
              this.userId = parsed.userId
            }
          } catch {
            console.error('Error parsing user data', e)
          }
        } else {
          this.userId = generateId()
        }
      } catch {}
    },
    setRoom(id: string) {
      this.roomId = id
    },
    updateRoomState(players: any[], hostId: string) {
      this.playersInRoom = players
      this.hostUserId = hostId
    },
    setAccountAuth(token: string, user: any) {
      this.isLoggedIn = true
      this.token = token
      this.nickname = user.username
      this.avatarId = user.avatarId || 1
      this.color = user.color || '#f97316'
      this.totalWins = user.stats?.totalWins || 0
      this.picture = user.picture || ''
      if (!this.userId) this.userId = generateId()
      
      try {
        localStorage.setItem('party-hub-user', JSON.stringify({ 
          userId: this.userId,
          nickname: this.nickname, 
          avatarId: this.avatarId, 
          color: this.color,
          isLoggedIn: this.isLoggedIn,
          token: this.token,
          totalWins: this.totalWins,
          picture: this.picture
        }))
      } catch {}
    },
    logout() {
      this.token = ''
      this.isLoggedIn = false
      this.userId = generateId()
      
      localStorage.setItem('party-hub-user', JSON.stringify({ 
        userId: this.userId,
        nickname: this.nickname, 
        avatarId: this.avatarId, 
        color: this.color,
        isLoggedIn: false,
        token: '',
        totalWins: 0
      }))
    }
  }
})
