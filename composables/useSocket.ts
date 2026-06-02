import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'
import { useRuntimeConfig } from '#app'
import { usePlayerStore } from '~/stores/playerStore'

import { useUnoStore } from '~/stores/games/unoStore'

const socket = ref<Socket | null>(null)
const isConnected = ref(false)

export const useSocket = () => {
  const config = useRuntimeConfig()
  const playerStore = usePlayerStore()

  const connect = (roomId: string) => {
    if (socket.value) return

    socket.value = io(config.public.socketUrl, {
      transports: ['websocket']
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      
      // Unirse a la sala enviando los datos guardados en Pinia
      socket.value?.emit('join_room', {
        roomId,
        userId: playerStore.userId,
        nickname: playerStore.nickname,
        avatarId: playerStore.avatarId,
        color: playerStore.color
      })
    })

    socket.value.on('room_update', (data) => {
      playerStore.updateRoomState(data.users, data.hostUserId)
    })

    socket.value.on('game_state_update', (data) => {
      useUnoStore().updateState(data)
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  return {
    socket,
    isConnected,
    connect,
    disconnect
  }
}
