import { watch, computed } from 'vue'

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
    (newSocket, oldSocket, onCleanup) => {
      if (newSocket) {
        newSocket.emit('uno:join', { roomId })

        const handleGameMessage = (data: any) => {
          toast.add({ 
            title: data.message, 
            timeout: 2500,
            ui: {
              wrapper: 'fixed bottom-24 left-1/2 -translate-x-1/2 w-auto pointer-events-none z-[100]',
              container: 'items-center justify-center',
              width: 'w-auto max-w-sm',
              background: 'bg-black/70 backdrop-blur-sm',
              ring: 'ring-1 ring-white/10',
              padding: 'px-4 py-2',
              rounded: 'rounded-full',
              title: 'text-white text-sm font-medium text-center',
              icon: { color: 'text-white/70' }
            }
          })
        }

        const handleGameStateUpdate = (data: any) => {
          unoStore.updateState(data)
        }

        const handleRivalHover = (data: any) => {
          unoStore.setRivalHover(data.userId, data.index)
        }

        newSocket.on('game_message', handleGameMessage)
        newSocket.on('game_state_update', handleGameStateUpdate)
        newSocket.on('uno:rival_hover', handleRivalHover)

        onCleanup(() => {
          newSocket.off('game_message', handleGameMessage)
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
