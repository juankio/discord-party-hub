import { defineStore } from 'pinia'
import { generateId, saveUserToStorage, loadUserFromStorage, handleAuthFromUrl } from '~/utils/authStorage'

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
    lastPlayed: null as Date | string | null,
    picture: '',
    roomRules: {
      stackDrawCards: true, playMultipleSame: true, zeroAndSevenRules: true, drawUntilPlayable: false, interceptExact: false, extendedLobby: false,
      stopCategories: ['NOMBRE', 'ANIMAL', 'COLOR', 'COSA', 'FRUTA'], stopRounds: 5, bannedLetters: ['W', 'X', 'Y', 'Z']
    }
  }),
  actions: {
    setPlayerSetup(nickname: string, avatarId: number, color: string = '#f97316') {
      this.nickname = nickname
      this.avatarId = avatarId
      this.color = color
      if (!this.userId) this.userId = generateId()
      saveUserToStorage({ userId: this.userId, nickname, avatarId, color })
    },

    loadPlayerSetup() {
      handleAuthFromUrl()
      
      const parsed = loadUserFromStorage()
      if (parsed) {
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
        
        // Si no tiene userId (versión anterior), lo generamos
        if (!parsed.userId) {
          this.userId = generateId()
          saveUserToStorage({ ...parsed, userId: this.userId })
        }
      } else {
        this.userId = generateId()
      }
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
      
      saveUserToStorage({ 
        userId: this.userId, nickname: this.nickname, avatarId: this.avatarId, color: this.color,
        isLoggedIn: this.isLoggedIn, token: this.token, totalWins: this.totalWins, picture: this.picture
      })
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
      
      saveUserToStorage({ 
        userId: this.userId,
        nickname: this.nickname, 
        avatarId: this.avatarId, 
        color: this.color,
        isLoggedIn: false,
        token: '',
        totalWins: 0
      })
    },
    incrementWin() {
      this.totalWins++;
      const parsed = loadUserFromStorage()
      if (parsed) {
        parsed.totalWins = this.totalWins;
        saveUserToStorage(parsed);
      }
    }
  }
})
