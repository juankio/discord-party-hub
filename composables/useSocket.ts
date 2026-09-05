import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { usePlayerStore } from '~/stores/playerStore'

import { useAppAudio } from '~/composables/useAppAudio'
import { useAppAlert } from '~/composables/useAppAlert'

const socket = ref<Socket | null>(null)
const isConnected = ref(false)
const isReconnecting = ref(false)

export const useSocket = () => {
  const config = useRuntimeConfig()
  const playerStore = usePlayerStore()
  const router = useRouter()
  const route = useRoute()
  const { playJoin, playStart } = useAppAudio()

  const connect = (roomId: string) => {
    if (socket.value) return

    socket.value = io(config.public.socketUrl, {
      transports: ['websocket'],
      auth: {
        token: playerStore.token || '',
        guestId: playerStore.userId || ''
      }
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      isReconnecting.value = false
      
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

    socket.value.io.on('reconnect_attempt', () => {
      isReconnecting.value = true
    })

    socket.value.io.on('reconnect', () => {
      isReconnecting.value = false
      isConnected.value = true
    })

    socket.value.on('connect_error', () => {
      isConnected.value = false
    })

    socket.value.io.on('reconnect_failed', () => {
      isReconnecting.value = false
      isConnected.value = false
    })

    socket.value.on('room_update', (data) => {
      const prevPlayers = playerStore.playersInRoom.length
      playerStore.updateRoomState(
        data.users,
        data.hostUserId,
        data.roomRules,
        data.selectedGame,
        data.isGameActive,
        data.activeGameType
      )
      if (data.users && data.users.length > prevPlayers) {
        playJoin()
      }
    })

    socket.value.on('game_in_progress', (data: { gameType: string, playersCount: number }) => {
      playerStore.isGameActive = true
      playerStore.activeGameType = data.gameType
      playerStore.isWaitingInLobby = true
    })

    socket.value.on('player_waiting_in_lobby', (data: { nickname: string, avatarId: number, color: string }) => {
      useAppAlert().showAlert({
        title: '¡Amigo en el Lobby!',
        description: `${data.nickname} se ha unido a la sala y está esperando a que termine la partida.`,
        type: 'warning',
        icon: 'i-lucide-user-check'
      })
    })

    socket.value.on('player_status_change', (data: { userId: string, nickname: string, isOffline?: boolean, wasEvicted?: boolean, gracePeriodSec?: number }) => {
      if (data.userId === playerStore.userId) return

      if (data.wasEvicted) {
        useAppAlert().showAlert({
          title: 'Jugador Retirado',
          description: `${data.nickname} no regresó a tiempo (30s) y ha sido retirado de la partida.`,
          type: 'error',
          icon: 'i-lucide-user-x',
          autoCloseMs: 4000
        })
      } else if (data.isOffline) {
        useAppAlert().showAlert({
          title: 'Jugador Desconectado',
          description: `${data.nickname} se ha desconectado. Esperando reconexión (${data.gracePeriodSec || 30}s)...`,
          type: 'warning',
          icon: 'i-lucide-wifi-off',
          autoCloseMs: 4000
        })
      } else if (data.isOffline === false) {
        useAppAlert().showAlert({
          title: '¡Jugador Reconectado!',
          description: `${data.nickname} ha vuelto a la partida.`,
          type: 'success',
          icon: 'i-lucide-wifi',
          autoCloseMs: 3000
        })
      }
    })

    socket.value.on('game_started', () => {
      playerStore.isWaitingInLobby = false
      playStart()
    })

    socket.value.on('game_message', (data: any) => {
      const message = typeof data === 'string' ? data : (data?.message || data?.text)
      if (message) {
        const gameTitles: Record<string, string> = {
          uno: 'Partida UNO',
          parchis: 'Parchís',
          stop: 'Stop (Basta)',
          liars: "Liar's Bar",
          pinturillo: 'Pinturillo',
          impostor: 'Impostor'
        }
        const activeType = playerStore.activeGameType || playerStore.selectedGame || ''
        const title = gameTitles[activeType] || 'Aviso de Partida'

        useAppAlert().showAlert({
          title,
          description: message,
          type: 'info',
          icon: 'i-lucide-gamepad-2',
          autoCloseMs: 3000
        })
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

    socket.value.on('return_to_lobby', () => {
      playerStore.isGameActive = false
      playerStore.activeGameType = null
      playerStore.isWaitingInLobby = false
      const targetPath = `/sala/${roomId}`
      if (window.location.pathname !== targetPath) {
        window.location.href = targetPath // Fuerza navegacion nativa para evitar bloqueos del router de Vue
      }
    })

    socket.value.on('room_not_found', () => {
      disconnect()
      playerStore.updateRoomState([], '')
      useAppAlert().showAlert({
        title: 'Sala Cerrada',
        description: 'La sala que buscas no existe o fue cerrada.',
        type: 'error',
        icon: 'i-lucide-alert-circle'
      })
      router.push('/')
    })

    socket.value.on('room_full', () => {
      disconnect()
      useAppAlert().showAlert({
        title: 'Sala Llena',
        description: 'La sala ha alcanzado su límite de jugadores.',
        type: 'error',
        icon: 'i-lucide-alert-circle'
      })
      router.push('/')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.off('game_message')
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      isReconnecting.value = false
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
    isReconnecting,
    connect,
    disconnect,
    updateProfile
  }
}
