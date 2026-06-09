<template>
  <div class="relative min-h-screen flex flex-col bg-transparent overflow-hidden text-white font-sans">
    <!-- Top Bar actions -->
    <div class="absolute top-4 left-4 z-50 flex gap-4">
      <UButton color="gray" variant="ghost" icon="i-lucide-arrow-left" @click="exitGame">
        Salir de la Partida
      </UButton>
    </div>

    <Transition name="fade" mode="out-in">
      <StopLobby
        v-if="stopStore.gameState === 'LOBBY'"
        :is-host="stopStore.isHost"
        :players="stopStore.players"
        :initial-categories="stopStore.categories"
        :initial-rounds="stopStore.rounds"
        @update_config="updateConfig"
        @start="startGame"
        @cancel="exitGame"
      />

      <StopBoard
        v-else-if="stopStore.gameState === 'PLAYING'"
        :categories="stopStore.categories"
        :current-round="stopStore.currentRound"
        :total-rounds="stopStore.rounds"
        :letter="stopStore.currentLetter"
        :is-finished="false"
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
        :round-scores="roundScores"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSocket } from '~/composables/useSocket'
import { usePlayerStore } from '~/stores/playerStore'
import { useStopStore } from '~/stores/games/stopStore'

// Components
import StopLobby from '~/components/games/stop/StopLobby.vue'
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

const exitGame = () => {
  socket.value?.emit('return_to_lobby')
  router.push(`/sala/${roomId}`)
}

const updateConfig = (config: any) => {
  socket.value?.emit('stop:update_config', config)
}

const startGame = (config: any) => {
  socket.value?.emit('stop:start_game', config)
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

onMounted(() => {
  stopStore.bindEvents()
  socket.value?.emit('stop:join', { roomId })
  
  socket.value?.on('stop:round_scores', (scores: Record<string, number>) => {
    roundScores.value = scores
  })
})

onUnmounted(() => {
  stopStore.unbindEvents()
  socket.value?.off('stop:round_scores')
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
