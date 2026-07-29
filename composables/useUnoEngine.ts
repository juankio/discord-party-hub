import { onMounted, onUnmounted, watch, computed } from 'vue'

import { useUnoStore } from '~/stores/games/unoStore'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'
import { useUnoAnimations } from '~/composables/useUnoAnimations'
import { useToast } from '#imports'

export const useUnoEngine = (roomId: string) => {
  const router = useRouter()
  const playerStore = usePlayerStore()
  const unoStore = useUnoStore()
  const { socket, isConnected } = useSocket()
  const toast = useToast()

  const { playCardAnimation, drawCardAnimation } = useUnoAnimations(unoStore, playerStore, socket)

  const isMyTurn = computed(() => unoStore.currentTurnUserId === playerStore.userId)
  const isHost = computed(() => playerStore.hostUserId === playerStore.userId)

  const handleAction = {
    playCard: (id: string) => playCardAnimation(id),
    drawCard: () => drawCardAnimation(),
    passTurn: () => socket.value?.emit('uno:pass_turn'),
    declareColor: (color: string) => socket.value?.emit('uno:declare_color', color),
    yellUno: () => socket.value?.emit('uno:yell_uno'),
    challengeUno: (targetId: string) => socket.value?.emit('uno:challenge_uno', targetId),
    swapHands: (id: string) => socket.value?.emit('uno:swap_hands', id),
    onCardHover: (index: number | null) => socket.value?.emit('uno:hover_card', index),
    surrender: () => socket.value?.emit('uno:surrender')
  }

  const exitGame = () => {
    if (isHost.value || unoStore.gameState === 'FINISHED') {
      socket.value?.emit('return_to_lobby')
    } else {
      if (unoStore.gameState !== 'WAITING') {
        handleAction.surrender()
      }
      router.push(`/sala/${roomId}`)
    }
  }

  watch(
    socket,
    (newSocket) => {
      if (newSocket) {
        newSocket.emit('uno:join', { roomId })
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (socket.value && isConnected.value) {
      socket.value.emit('uno:join', { roomId })
    }

    socket.value?.on('game_message', (data: any) => {
      toast.add({ title: 'UNO', description: data.message, color: 'primary', icon: 'i-lucide-info' })
    })

    socket.value?.on('game_state_update', (data: any) => {
      unoStore.updateState(data)
    })

    socket.value?.on('uno:rival_hover', (data: any) => {
      unoStore.setRivalHover(data.userId, data.index)
    })
  })

  onUnmounted(() => {
    socket.value?.off('game_message')
    socket.value?.off('game_state_update')
    socket.value?.off('uno:rival_hover')
  })

  return {
    state: unoStore,
    playerState: playerStore,
    isMyTurn,
    handleAction,
    exitGame
  }
}
