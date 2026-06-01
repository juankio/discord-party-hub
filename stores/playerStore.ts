import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    nickname: '',
    avatarId: 1, // 1 a 6 por ejemplo
    roomId: '',
    playersInRoom: [] as any[]
  }),
  actions: {
    setPlayerSetup(nickname: string, avatarId: number) {
      this.nickname = nickname
      this.avatarId = avatarId
    },
    setRoom(id: string) {
      this.roomId = id
    },
    updatePlayers(players: any[]) {
      this.playersInRoom = players
    }
  }
})
