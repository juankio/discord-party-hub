<script setup lang="ts">
definePageMeta({ middleware: ["game-guard"] })


import { useParchisEngine } from "~/composables/useParchisEngine"

const route = useRoute()
const roomId = route.params.id as string

const { state, playerState, handleAction, exitGame } = useParchisEngine(roomId)
</script>

<template>
  <div class="relative w-full h-full min-h-[80vh] flex flex-col p-4 md:p-8">
    <GameExitButton @leave="exitGame" />

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
    <div v-else-if="state.gameState === 'WAITING'" class="flex flex-col items-center justify-center flex-grow absolute inset-0 z-20 bg-[#1a0f08]/90 backdrop-blur-md">
      <div class="relative flex items-center justify-center w-24 h-24 mb-6">
        <div class="absolute inset-0 border-t-4 border-orange-500 rounded-full animate-spin"></div>
        <div class="absolute inset-2 border-r-4 border-yellow-500 rounded-full animate-spin direction-reverse"></div>
        <UIcon name="i-heroicons-cube-transparent" class="w-10 h-10 text-orange-400 animate-pulse" />
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-widest mb-4 text-center drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">PREPARANDO TABLERO</h1>
      <p class="text-gray-300 text-lg sm:text-xl text-center mb-8">Organizando fichas y dados...</p>
      <UButton color="gray" variant="soft" class="mt-4 px-6 py-3 rounded-xl font-bold" @click="$router.push(`/sala/${roomId}`)">
        Volver a la sala
      </UButton>
    </div>

    <!-- Victory Modal -->
    <UnoVictoryModal
      :is-open="state.gameState === 'FINISHED'"
      :winner-message="state.winner === playerState.userId ? '¡Has ganado la partida!' : `El ganador es ${state.players.find((r: any) => r.userId === state.winner)?.nickname || 'un rival'}.`"
      @lobby="exitGame"
    />
  </div>
</template>
