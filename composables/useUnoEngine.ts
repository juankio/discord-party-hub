import { watch, computed } from 'vue'

import { useUnoStore } from '~/stores/games/unoStore'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'
import { useUnoAnimations } from '~/composables/useUnoAnimations'

export const useUnoEngine = (roomId: string) => {
  const router = useRouter()
  const playerStore = usePlayerStore()
  const unoStore = useUnoStore()
  const { socket, isConnected } = useSocket()

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
    (newSocket, oldSocket, onCleanup) => {
      if (newSocket) {
        newSocket.emit('uno:join', { roomId })

        const handleGameStateUpdate = (data: any) => {
          unoStore.updateState(data)
        }

        const handleRivalHover = (data: any) => {
          unoStore.setRivalHover(data.userId, data.index)
        }

        newSocket.on('game_state_update', handleGameStateUpdate)
        newSocket.on('uno:rival_hover', handleRivalHover)

        onCleanup(() => {
          newSocket.off('game_state_update', handleGameStateUpdate)
          newSocket.off('uno:rival_hover', handleRivalHover)
        })
      }
    },
    { immediate: true }
  )

  return {
    state: unoStore,
    playerState: playerStore,
    isMyTurn,
    handleAction,
    exitGame
  }
}
