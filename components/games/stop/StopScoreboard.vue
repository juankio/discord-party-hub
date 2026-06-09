<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8 text-white relative" style="color: var(--theme-text-color, white);">
    
    <div class="w-full max-w-3xl bg-[#4a2e1b] border-8 border-[#7d512a] rounded-[40px] shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden relative z-20 flex flex-col">
      <div class="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px);"></div>
      
      <!-- Header -->
      <div class="bg-[#3a2212] p-6 border-b-4 border-[#2a180c] relative z-10 shadow-lg text-center">
        <h2 class="text-3xl sm:text-4xl font-black text-[#f97316] tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-2">
          {{ isFinal ? 'Resultados Finales' : `Puntuación Ronda ${currentRound}` }}
        </h2>
        <div class="flex items-center justify-center gap-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#cdab84]">
          <span class="bg-[#2a180c] px-3 py-1 rounded border-2 border-[#1a0f08]">100pts Única</span>
          <span class="bg-[#2a180c] px-3 py-1 rounded border-2 border-[#1a0f08]">50pts Compartida</span>
          <span class="bg-[#991b1b] text-white px-3 py-1 rounded border-2 border-[#7f1d1d]">0pts Veto</span>
        </div>
      </div>

      <!-- Body -->
      <div class="p-6 sm:p-8 bg-[#8b5a2b] relative z-10 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div 
          v-for="(player, idx) in sortedPlayers" 
          :key="player.userId"
          class="flex items-center justify-between bg-[#6d4621] p-4 rounded-2xl border-4 border-[#5c3a21] shadow-inner relative overflow-hidden"
          :class="player.userId === myUserId ? 'border-[#f97316]/50 bg-[#7d512a]' : ''"
        >
          <!-- Ranking Badge -->
          <div 
            class="absolute left-0 top-0 bottom-0 w-3 flex items-center justify-center border-r-2 border-[#3a2212]"
            :class="idx === 0 ? 'bg-[#fbbf24]' : idx === 1 ? 'bg-[#94a3b8]' : idx === 2 ? 'bg-[#b45309]' : 'bg-[#4a2e1b]'"
          ></div>

          <div class="flex items-center gap-4 pl-6">
            <div class="text-3xl font-black w-10 text-center" :class="idx === 0 ? 'text-[#fbbf24] drop-shadow-md' : 'text-[#3a2212] drop-shadow-sm'">
              #{{ idx + 1 }}
            </div>
            
            <div class="relative">
              <img :src="`/avatars/avatar-${player.avatarId}.svg`" class="w-12 h-12 rounded-full bg-[#1a0f08] p-1 border-2 shadow-inner" :style="{ borderColor: player.color }" />
            </div>
            
            <div class="flex flex-col">
              <div class="font-black text-xl tracking-wider uppercase drop-shadow-sm" :class="player.userId === myUserId ? 'text-[#f97316]' : 'text-white'">
                {{ player.nickname }}
              </div>
              <div class="text-[10px] font-black uppercase tracking-widest text-[#109041] mt-1" v-if="!isFinal && getRoundScore(player.userId) > 0">
                +{{ getRoundScore(player.userId) }} esta ronda
              </div>
              <div class="text-[10px] font-black uppercase tracking-widest text-[#991b1b] mt-1" v-else-if="!isFinal">
                0 esta ronda
              </div>
            </div>
          </div>

          <div class="text-4xl font-black tracking-tighter drop-shadow-md flex items-end gap-1" :class="idx === 0 ? 'text-[#fbbf24]' : 'text-white'">
            {{ player.score || 0 }} <span class="text-sm font-bold text-[#cdab84] mb-1">pts</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-[#3a2212] p-6 border-t-4 border-[#2a180c] relative z-10 flex justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
        <button 
          v-if="isHost && !isFinal" 
          class="px-8 py-4 bg-[#f97316] hover:bg-[#ea580c] text-white font-black tracking-[0.2em] uppercase rounded-xl border-b-4 border-[#c2410c] active:translate-y-1 active:border-b-0 shadow-[0_5px_15px_rgba(0,0,0,0.4)] transition-all w-full sm:w-auto"
          @click="$emit('next_round')"
        >
          Siguiente Ronda ({{ currentRound + 1 }}/{{ totalRounds }})
        </button>
        <button 
          v-if="isHost && isFinal" 
          class="px-8 py-4 bg-[#109041] hover:bg-[#15b051] text-white font-black tracking-[0.2em] uppercase rounded-xl border-b-4 border-[#0a5c28] active:translate-y-1 active:border-b-0 shadow-[0_5px_15px_rgba(0,0,0,0.4)] transition-all w-full sm:w-auto"
          @click="$emit('back_to_lobby')"
        >
          Volver al Lobby
        </button>
        <div v-if="!isHost" class="flex flex-col items-center justify-center gap-2 py-2">
          <div class="w-8 h-8 rounded-full border-4 border-[#5c3a21] border-t-[#f97316] animate-spin"></div>
          <span class="text-[#cdab84] uppercase tracking-widest text-[10px] font-black">Esperando al Host...</span>
        </div>
      </div>

    </div>
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
  return [...props.players].sort((a, b) => (b.score || 0) - (a.score || 0))
})

const getRoundScore = (userId: string) => {
  return props.roundScores[userId] || 0
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 12px;
  width: 12px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #2a180c;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #7d512a;
  border-radius: 4px;
  border: 2px solid #2a180c;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a06d40;
}
</style>
