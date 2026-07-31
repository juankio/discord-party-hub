<script setup lang="ts">
definePageMeta({ middleware: ["game-guard"] })


import { useParchisEngine } from "~/composables/useParchisEngine"

const route = useRoute()
const roomId = route.params.id as string

const { state, playerState, handleAction, exitGame } = useParchisEngine(roomId)
</script>

<template>
  <GameLayout
    bg-class="p-4 md:p-8"
    :is-finished="state?.gameState === 'FINISHED'"
    :winner-message="state.winner === playerState.userId ? '¡Has ganado la partida!' : `El ganador es ${state.players.find((r: any) => r.userId === state.winner)?.nickname || 'un rival'}.`"
    @leave="exitGame"
  >
    <!-- Overlay de Selección de Fichas -->
    <ParchisTokenSelector 
      v-if="state.gameState === 'CHOOSING_TOKENS'" 
      :players="state.players" 
      :my-user-id="playerState.userId" 
      @select_figure="handleAction.selectFigure" 
    />
    
    <!-- Tablero de Juego Principal -->
    <ParchisBoard v-else-if="['PLAYING', 'ROLLING_FOR_ORDER', 'CHOOSING_SEATS'].includes(state.gameState)" class="flex-grow" />

    <ParchisInitiative v-if="state.gameState === 'ROLLING_FOR_ORDER'" :players="state.players" />


    <!-- Estado de Espera u Otros -->
    <GameLoading v-else-if="state.gameState === 'WAITING'" message="PREPARANDO TABLERO" icon="i-heroicons-cube-transparent" />
  </GameLayout>
</template>
