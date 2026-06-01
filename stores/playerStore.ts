import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    nickname: '',
    avatarId: 1, // 1 a 8
    color: '#f97316', // Color por defecto (naranja)
    roomId: '',
    playersInRoom: [] as any[]
  }),
  actions: {
    setPlayerSetup(nickname: string, avatarId: number, color: string = '#f97316') {
      this.nickname = nickname
      this.avatarId = avatarId
      this.color = color

      try {
        localStorage.setItem('party-hub-user', JSON.stringify({ nickname, avatarId, color }))
      } catch (e) {}
    },
    loadPlayerSetup() {
      try {
        const data = localStorage.getItem('party-hub-user')
        if (data) {
          try {
            const parsed = JSON.parse(data)
            this.nickname = parsed.nickname || ''
            this.avatarId = parsed.avatarId || 1
            this.color = parsed.color || '#f97316'
          } catch (e) {
            console.error('Error parsing user data', e)
          }
        }
      } catch (e) {}
    },
    setRoom(id: string) {
      this.roomId = id
    },
    updatePlayers(players: any[]) {
      this.playersInRoom = players
    }
  }
})
