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
        gamesPlayed: 0,
        lastPlayed: null,
    gamesPlayed: 0,
    lastPlayed: null as Date | string | null,
    picture: '',
    roomRules: {
      stackDrawCards: true, playMultipleSame: true, zeroAndSevenRules: true, drawUntilPlayable: false, interceptExact: false
    }
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
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const authDataParam = searchParams.get('auth_data');
        if (authDataParam) {
          try {
            const authDataString = atob(authDataParam);
            const authData = JSON.parse(authDataString);
            
            const oldDataRaw = window.localStorage.getItem('party-hub-user');
            let roomId = '';
            if (oldDataRaw) {
              const oldData = JSON.parse(oldDataRaw);
              roomId = oldData.roomId || '';
            }
            if (roomId) authData.roomId = roomId;
            
            window.localStorage.setItem('party-hub-user', JSON.stringify(authData));
            
            // Limpiar la URL para que no quede el token ahí feo
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch(e) {
            console.error('Failed to parse auth data from URL', e);
          }
        }
      }
      
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
            this.gamesPlayed = parsed.gamesPlayed || 0
            this.lastPlayed = parsed.lastPlayed || null
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
          gamesPlayed: this.gamesPlayed,
          lastPlayed: this.lastPlayed,
                gamesPlayed: this.gamesPlayed,
                lastPlayed: this.lastPlayed,
                picture: this.picture
              }))
            } else {
              this.userId = parsed.userId
            }
          } catch (e) {
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
    updateRoomState(players: any[], hostId: string, rules?: any) {
      this.playersInRoom = players
      this.hostUserId = hostId
      if (rules) {
        // Solo actualizamos si realmente hay un cambio para evitar el bucle infinito de Vue watch
        const currentRulesStr = JSON.stringify(this.roomRules);
        const newRulesStr = JSON.stringify({ ...this.roomRules, ...rules });
        
        if (currentRulesStr !== newRulesStr) {
          this.roomRules = { ...this.roomRules, ...rules }
        }
      }
    },
    setAccountAuth(token: string, user: any) {
      this.isLoggedIn = true
      this.token = token
      this.nickname = user.username
      this.avatarId = user.avatarId || 1
      this.color = user.color || '#f97316'
      this.totalWins = user.stats?.totalWins || 0
      this.gamesPlayed = user.gamesPlayed || 0
      this.lastPlayed = user.lastPlayed || null
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
    async updateProfile(updates: any) {
      if (!this.isLoggedIn || !this.token) throw new Error('No estás logueado');
      
      const config = useRuntimeConfig();
      const baseUrl = config.public.socketUrl || 'http://localhost:3001';
      
      const res = await $fetch<any>(`${baseUrl}/api/auth/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: {
          updates
        }
      });

      if (!res.success) {
        throw new Error(res.error || res.message || 'Error al actualizar el perfil');
      }

      // Actualizamos estado si sale bien
      const updatedUser = res.data?.user || res.data;
      this.setAccountAuth(this.token, updatedUser);
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
    },
    incrementWin() {
      this.totalWins++;
      try {
        const data = localStorage.getItem('party-hub-user');
        if (data) {
          const parsed = JSON.parse(data);
          parsed.totalWins = this.totalWins;
          localStorage.setItem('party-hub-user', JSON.stringify(parsed));
        }
      } catch {}
    }
  }
})
