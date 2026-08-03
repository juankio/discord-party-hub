<template>
  <GameLayout
    bg-class="bg-transparent text-white font-sans"
    :is-finished="state.gameState === 'FINISHED'"
    :winner-message="state.winner === playerState.userId ? '¡Has ganado la partida!' : `El ganador es ${state.rivals.find((r: any) => r.userId === state.winner)?.nickname || 'un rival'}.`"
    :rules="['Combina cartas por color o número.', 'No olvides pulsar \&quot;UNO\&quot; cuando te quede una carta, o serás penalizado.', 'Si tiras un +2 o +4, el siguiente puede acumular tirando otro (si la regla está activa).']"
    @leave="exitGame"
  >
    <!-- Botón Rendirse -->
    <button 
      @click="handleAction.surrender()"
      class="absolute top-4 right-20 z-50 group flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all duration-300 active:scale-95 shadow-lg overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)] rounded-xl pointer-events-none"></div>
      <UIcon name="i-heroicons-flag" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Rendirse</span>
    </button>

    <!-- Turn Banner -->
    <div v-if="state.gameState !== 'WAITING'" class="absolute top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-500" 
         :class="isMyTurn ? 'scale-110' : 'scale-100 opacity-80'">
      <div class="bg-black/80 backdrop-blur-md border-b-4 border-x-4 rounded-b-3xl px-4 py-2 sm:px-8 sm:py-3 flex flex-col items-center shadow-2xl transition-colors duration-500"
           :class="isMyTurn ? 'border-yellow-500' : 'border-white/10'">
        <span class="text-[10px] font-black tracking-[0.4em] uppercase text-gray-400 mb-1">Turno actual</span>
        <h2 class="text-lg sm:text-3xl font-black tracking-widest uppercase whitespace-nowrap max-w-none"
            :class="isMyTurn ? 'text-yellow-400' : 'text-white'">
          {{ isMyTurn ? '¡TU TURNO!' : (state.rivals.find(r => r.userId === state.currentTurnUserId)?.nickname || 'Pensando...') }}
        </h2>
      </div>
    </div>

    <!-- Central Table & Game Area -->
    <template v-if="state.gameState !== 'WAITING'">
      <UnoTable 
        :top-card="state.topCard"
        :current-color="state.currentColor"
        :pending-draws="state.pendingDraws"
        :is-my-turn="isMyTurn"
        :has-drawn-this-turn="state.hasDrawnThisTurn"
        :my-hand="state.myHand"
        :rivals="state.rivals"
        :current-turn-user-id="state.currentTurnUserId"
        @draw="handleAction.drawCard"
        @pass-turn="handleAction.passTurn"
        @challenge="handleAction.challengeUno"
      />

      <UnoHand 
        :my-hand="state.myHand"
        :is-my-turn="isMyTurn"
        :top-card="state.topCard"
        :current-color="state.currentColor"
        :pending-draws="state.pendingDraws"
        @play-card="handleAction.playCard"
        @yell-uno="handleAction.yellUno"
        @hover-card="handleAction.onCardHover"
      />
    </template>

    <!-- Estado de Espera -->
    <GameLoading v-else message="PREPARANDO LA MESA" icon="i-heroicons-arrow-path" />

    <!-- Color Modal -->
    <UnoColorModal 
      :is-open="state.gameState === 'CHOOSING_COLOR' && state.actionRequiredFrom === playerState.userId"
      @select="handleAction.declareColor"
    />

    <!-- Swap Modal -->
    <UnoSwapModal
      :is-open="state.gameState === 'CHOOSING_PLAYER' && state.actionRequiredFrom === playerState.userId"
      :rivals="state.rivals"
      @select="handleAction.swapHands"
    />
  </GameLayout>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ["game-guard"] })


import { useUnoEngine } from '~/composables/useUnoEngine'

const route = useRoute()
const roomId = route.params.id as string

const { state, playerState, isMyTurn, handleAction, exitGame } = useUnoEngine(roomId)
</script>
