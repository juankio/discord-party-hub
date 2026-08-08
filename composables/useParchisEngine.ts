import { watch, computed } from 'vue'

import { useParchisStore } from '~/stores/games/parchisStore'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'
import { useParchisAudio } from '~/composables/useParchisAudio'

export const useParchisEngine = (roomId: string) => {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const parchisStore = useParchisStore()
  const playerStore = usePlayerStore()
  const { playMove, playCapture, playGoal } = useParchisAudio()

  const previousTokens = new Map<string, any>()

  watch(
    () => parchisStore.players,
    (newPlayers) => {
      if (!newPlayers) return

      let moved = false
      let captured = false
      let goal = false

      newPlayers.forEach((player) => {
        player.tokens?.forEach((token: any) => {
          const key = `${player.userId}-${token.id}`
          const prev = previousTokens.get(key)

          if (prev) {
            // Detect Move
            if (prev.position !== token.position && token.state !== "HOME" && prev.state !== "HOME") {
              moved = true
            }
            if (prev.state === "HOME" && (token.state === "TRACK" || token.state === "BOARD")) {
              moved = true
            }

            // Detect Capture
            if ((prev.state === "TRACK" || prev.state === "BOARD") && token.state === "HOME") {
              captured = true
            }

            // Detect Goal
            if (prev.state !== "FINISHED" && token.state === "FINISHED") {
              goal = true
            }
          }

          previousTokens.set(key, { ...token })
        })
      })

      if (captured) {
        playCapture()
      } else if (goal) {
        playGoal()
      } else if (moved) {
        playMove()
      }
    },
    { deep: true }
  )

  watch(
    socket,
    (newSocket, oldSocket, onCleanup) => {
      if (newSocket) {
        newSocket.emit("parchis:join", { roomId })

        const handleGameStateUpdate = (data: any) => {
          parchisStore.updateState(data)
        }

        newSocket.on('game_state_update', handleGameStateUpdate)

        onCleanup(() => {
          newSocket.off('game_state_update', handleGameStateUpdate)
        })
      }
    },
    { immediate: true }
  )

  const handleAction = {
    selectFigure: (figureId: string) => {
      if (socket.value) {
        socket.value.emit("parchis:choose_figure", { roomId, figureId })
      }
    },
    surrender: () => {
      if (socket.value) {
        socket.value.emit("parchis:surrender")
      }
    }
  }

  const exitGame = () => {
    const isHost = playerStore.hostUserId === playerStore.userId
    
    if (isHost || parchisStore.gameState === "FINISHED") {
      socket.value?.emit("return_to_lobby")
    } else {
      if (parchisStore.gameState !== "WAITING") {
        handleAction.surrender()
      }
      router.push(`/sala/${roomId}`)
    }
  }

  // Not directly requested, but aligns with Engine pattern
  const isMyTurn = computed(() => {
    // Current turn logic for Parchis if needed.
    // If currentTurnUserId exists on parchisStore:
    return (parchisStore as any).currentTurnUserId === playerStore.userId
  })

  return {
    state: parchisStore,
    playerState: playerStore,
    isMyTurn,
    handleAction,
    exitGame
  }
}
