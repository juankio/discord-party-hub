import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { usePlayerStore } from '~/stores/playerStore'

import { useUnoStore } from '~/stores/games/unoStore'
import { useStopStore } from '~/stores/games/stopStore'
import { useParchisStore } from '~/stores/games/parchisStore'

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
      playerStore.updateRoomState(data.users, data.hostUserId, data.roomRules, data.selectedGame)
    })

    socket.value.on('game_state_update', (data) => {
      const selectedGame = playerStore.selectedGame;
      if (selectedGame === 'uno') {
        useUnoStore().updateState(data)
      } else if (selectedGame === 'stop') {
        useStopStore().updateState(data)
      } else if (selectedGame === 'parchis') {
        useParchisStore().updateState(data)
      }
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
      const targetPath = `/sala/${roomId}`
      if (window.location.pathname !== targetPath) {
        window.location.href = targetPath // Fuerza navegacion nativa para evitar bloqueos del router de Vue
      }
    })

    socket.value.on('room_not_found', () => {
      disconnect()
      playerStore.updateRoomState([], '')
      useToast().add({ title: 'Sala Cerrada', description: 'La sala que buscas no existe o fue cerrada.', color: 'red', icon: 'i-heroicons-exclamation-triangle' })
      router.push('/')
    })

    socket.value.on('room_full', () => {
      disconnect()
      useToast().add({ title: 'Sala Llena', description: 'La sala ha alcanzado su límite de jugadores.', color: 'red', icon: 'i-heroicons-exclamation-triangle' })
      router.push('/')
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

  const updateProfile = (data: { nickname: string, avatarId: number, color: string }) => {
    if (socket.value) {
      socket.value.emit('update_profile', data)
    }
  }

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    updateProfile
  }
}
