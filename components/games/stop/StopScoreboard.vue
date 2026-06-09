<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-white">
    <UCard class="w-full max-w-3xl bg-slate-800 border-slate-700 shadow-2xl">
      <template #header>
        <div class="text-center">
          <h2 class="text-3xl font-black text-primary-400 mb-2">
            {{ isFinal ? 'Resultados Finales' : `Puntuación Ronda ${currentRound}` }}
          </h2>
          <p class="text-slate-400">
            100pts Única | 50pts Repetida | 0pts Veto/Vacía
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <div 
          v-for="(player, idx) in sortedPlayers" 
          :key="player.userId"
          class="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700 relative overflow-hidden"
        >
          <!-- Ranking Badge -->
          <div 
            class="absolute left-0 top-0 bottom-0 w-2 flex items-center justify-center"
            :class="idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-600'"
          ></div>

          <div class="flex items-center gap-4 pl-4">
            <div class="text-2xl font-black w-8 text-center text-slate-500">
              #{{ idx + 1 }}
            </div>
            <UAvatar :src="player.avatar" :alt="player.nickname" size="lg" />
            <div>
              <div class="font-bold text-lg" :class="{'text-primary-400': player.userId === myUserId}">
                {{ player.nickname }}
              </div>
              <div class="text-xs text-slate-400" v-if="!isFinal">
                +{{ getRoundScore(player.userId) }} esta ronda
              </div>
            </div>
          </div>

          <div class="text-3xl font-black" :class="idx === 0 ? 'text-yellow-400' : 'text-white'">
            {{ scores[player.userId] || 0 }} <span class="text-sm font-normal text-slate-400">pts</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-center gap-4 mt-4">
          <UButton v-if="isHost && !isFinal" size="xl" color="primary" @click="$emit('next_round')">
            Siguiente Ronda ({{ currentRound + 1 }}/{{ totalRounds }})
          </UButton>
          <UButton v-if="isHost && isFinal" size="xl" color="green" @click="$emit('back_to_lobby')">
            Volver al Lobby
          </UButton>
          <div v-if="!isHost" class="text-slate-400 flex items-center gap-2">
            <UIcon name="i-lucide-loader-2" class="animate-spin w-5 h-5" />
            Esperando al Host...
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  players: any[]
  scores: Record<string, number>
  roundScores: Record<string, number>
  currentRound: number
  totalRounds: number
  isFinal: boolean
  myUserId: string
  isHost: boolean
}>()

const emit = defineEmits(['next_round', 'back_to_lobby'])

const sortedPlayers = computed(() => {
  return [...props.players].sort((a, b) => (props.scores[b.userId] || 0) - (props.scores[a.userId] || 0))
})

const getRoundScore = (userId: string) => {
  return props.roundScores[userId] || 0
}
</script>
