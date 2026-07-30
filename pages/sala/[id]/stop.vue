<template>
  <div class="h-[100dvh] w-full overflow-hidden flex flex-col bg-transparent relative text-white font-sans">
    <!-- Top Bar actions -->
    <div class="absolute top-4 left-4 z-50 flex gap-4">
      <GameExitButton @leave="exitGame" />
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

      <!-- Estado de Espera (Zoro added) -->
      <div v-else-if="stopStore.gameState === 'LOBBY'" class="flex flex-col items-center justify-center flex-grow min-h-screen">
        <UIcon name="i-heroicons-arrow-path" class="w-16 h-16 text-blue-500 animate-spin mb-6" />
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-widest mb-4 drop-shadow-lg text-center">PREPARANDO EL TABLERO</h1>
        <p class="text-gray-300 text-lg sm:text-xl text-center mb-8">Cargando categorías y jugadores...</p>
        <div class="w-full max-w-md flex flex-col gap-3 px-4">
          <USkeleton class="h-12 w-full bg-gray-800/80 rounded-xl" />
          <USkeleton class="h-12 w-full bg-gray-800/80 rounded-xl" />
          <USkeleton class="h-12 w-full bg-gray-800/80 rounded-xl" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ["game-guard"] })

import { usePlayerStore } from '~/stores/playerStore'
import { useStopStore } from '~/stores/games/stopStore'

// Components

const route = useRoute()
const router = useRouter()
const roomId = route.params.id as string

const { socket } = useSocket()
const playerStore = usePlayerStore()
const stopStore = useStopStore()
const { playRoundStart, playBasta } = useStopAudio()

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
    playRoundStart()
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
        playBasta()
        // Delay slighty to let user realize panic mode activated
        setTimeout(() => {
          socket.value?.emit('stop:submit_answers', { answers: localAnswers })
        }, 1500)
      })

      socket.value.on('game_state_update', (data: any) => {
        stopStore.updateState(data)
      })

      socket.value.emit('stop:join', { roomId })
      joined = true
    }
  })
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.off('stop_called')
    socket.value.off('game_state_update')
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
