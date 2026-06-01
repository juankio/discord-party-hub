import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    nickname: '',
    avatarId: 1, // 1 a 6 por ejemplo
    color: '#ff5722', // Color por defecto (naranja)
    roomId: '',
    playersInRoom: [] as any[]
  }),
  actions: {
    setPlayerSetup(nickname: string, avatarId: number, color: string = '#ff5722') {
      this.nickname = nickname
      this.avatarId = avatarId
      this.color = color
    },
    setRoom(id: string) {
      this.roomId = id
    },
    updatePlayers(players: any[]) {
      this.playersInRoom = players
    }
  }
})
