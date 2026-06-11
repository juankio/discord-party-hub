<template>
  <div class="relative min-h-screen flex flex-col bg-transparent overflow-hidden text-white font-sans">
    <!-- Top Bar actions -->
    <div class="absolute top-4 left-4 z-50 flex gap-4">
      <!-- Botón Salir (Pro Max UI) -->
      <button 
        @click="exitGame"
        class="group relative flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all duration-300 active:scale-95 shadow-lg overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)] rounded-xl pointer-events-none"></div>
        <!-- Icono arreglado (Heroicons) -->
        <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Salir de la Partida</span>
      </button>
    </div>

    <Transition name="fade" mode="out-in">
      <StopBoard
        v-if="stopStore.gameState === 'PLAYING'"
        :categories="stopStore.categories"
        :current-round="stopStore.currentRound"
        :total-rounds="stopStore.rounds"
        :letter="stopStore.currentLetter"
        :is-finished="false"
        :panic-mode="panicMode"
        @update_answers="updateAnswersLocally"
        @stop_call="callStop"
      />

      <StopVerification
        v-else-if="stopStore.gameState === 'VERIFYING'"
        :players="stopStore.players"
        :verifying-data="stopStore.verifyingData"
        :letter="stopStore.currentLetter"
        :my-user-id="playerStore.userId"
        :is-host="stopStore.isHost"
        @veto="castVeto"
        @finish_verification="finishVerification"
      />

      <StopScoreboard
        v-else-if="stopStore.gameState === 'SCORING' || stopStore.gameState === 'FINISHED'"
        :players="stopStore.players"
        :scores="stopStore.roundScores"
        :round-scores="stopStore.roundScores"
        :current-round="stopStore.currentRound"
        :total-rounds="stopStore.rounds"
        :is-final="stopStore.gameState === 'FINISHED'"
        :my-user-id="playerStore.userId"
        :is-host="stopStore.isHost"
        @next_round="nextRound"
        @back_to_lobby="backToLobby"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSocket } from '~/composables/useSocket'
import { usePlayerStore } from '~/stores/playerStore'
import { useStopStore } from '~/stores/games/stopStore'

// Components
import StopBoard from '~/components/games/stop/StopBoard.vue'
import StopVerification from '~/components/games/stop/StopVerification.vue'
import StopScoreboard from '~/components/games/stop/StopScoreboard.vue'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id as string

const { socket } = useSocket()
const playerStore = usePlayerStore()
const stopStore = useStopStore()

const roundScores = ref<Record<string, number>>({})
let localAnswers: Record<string, string> = {}
const panicMode = ref(false)

const exitGame = () => {
  socket.value?.emit('return_to_lobby')
  router.push(`/sala/${roomId}`)
}

const updateAnswersLocally = (answers: Record<string, string>) => {
  localAnswers = { ...answers }
}

const callStop = (answers: Record<string, string>) => {
  localAnswers = { ...answers }
  socket.value?.emit('stop:call_stop', { answers: localAnswers })
}

const castVeto = (data: { targetId: string, category: string }) => {
  socket.value?.emit('stop:cast_veto', data)
}

const finishVerification = () => {
  socket.value?.emit('stop:finish_verification')
}

const nextRound = () => {
  socket.value?.emit('stop:next_round')
}

const backToLobby = () => {
  socket.value?.emit('stop:back_to_lobby')
}

watch(() => stopStore.gameState, (newState) => {
  if (newState === 'PLAYING') {
    panicMode.value = false
    localAnswers = {} // Fix: Limpiar las respuestas locales de la ronda anterior
  }
})

onMounted(() => {
  let joined = false
  watchEffect(() => {
    if (socket.value && !joined) {
      // Auto-submit mechanism when someone else calls stop
      socket.value.off('stop_called')
      socket.value.on('stop_called', () => {
        panicMode.value = true
        // Delay slighty to let user realize panic mode activated
        setTimeout(() => {
          socket.value?.emit('stop:submit_answers', { answers: localAnswers })
        }, 1500)
      })

      socket.value.emit('stop:join', { roomId })
      joined = true
    }
  })
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.off('stop_called')
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
