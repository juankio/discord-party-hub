import { usePlayerStore } from '~/stores/playerStore'
import { useUnoStore } from '~/stores/games/unoStore'
import { useStopStore } from '~/stores/games/stopStore'
import { useParchisStore } from '~/stores/games/parchisStore'

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return // Solo ejecutar en el cliente

  const playerStore = usePlayerStore()
  const roomId = to.params.id as string
  
  // Si no hay jugador o no hay jugadores en la sala
  if (!playerStore.nickname || playerStore.playersInRoom.length === 0) {
    return navigateTo(`/sala/${roomId}`)
  }

  // Verificamos el estado del juego actual
  let gameState = 'WAITING';
  if (to.path.includes('/uno')) {
    gameState = useUnoStore().gameState;
  } else if (to.path.includes('/stop')) {
    gameState = useStopStore().gameState;
  } else if (to.path.includes('/parchis')) {
    gameState = useParchisStore().gameState;
  }

  // Si está en WAITING, lo mandamos al lobby
  if (gameState === 'WAITING') {
    return navigateTo(`/sala/${roomId}`)
  }
})
