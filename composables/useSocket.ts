import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { usePlayerStore } from '~/stores/playerStore'

import { useUnoStore } from '~/stores/games/unoStore'

const socket = ref<Socket | null>(null)
const isConnected = ref(false)

export const useSocket = () => {
  const config = useRuntimeConfig()
  const playerStore = usePlayerStore()
  const router = useRouter()
  const route = useRoute()

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
        color: playerStore.color,
        totalWins: playerStore.totalWins
      })
    })

    socket.value.on('room_update', (data) => {
      playerStore.updateRoomState(data.users, data.hostUserId, data.roomRules)
    })

    socket.value.on('game_state_update', (data) => {
      useUnoStore().updateState(data)
    })

    socket.value.on('game_action', (data) => {
      // Usaremos un custom event para que los componentes puedan reaccionar a acciones físicas
      try {
        window.dispatchEvent(new CustomEvent('uno:action', { detail: data }))
      } catch {}
    })

    socket.value.on('player_won', (userId: string) => {
      if (userId === playerStore.userId) {
        playerStore.incrementWin()
      }
    })

    socket.value.on('uno:rival_hover', (data) => {
      useUnoStore().setRivalHover(data.userId, data.index)
    })

    socket.value.on('return_to_lobby', () => {
      if (route.path !== `/sala/${roomId}`) {
        router.push(`/sala/${roomId}`)
      }
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
