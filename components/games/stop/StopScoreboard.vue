<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8 text-white relative" style="color: var(--theme-text-color, white);">
    
    <div class="w-full max-w-3xl bg-[#1e3f20]/95 backdrop-blur-lg border border-white/10 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden relative z-20 flex flex-col">
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E'); mix-blend-mode: overlay;"></div>
      
      <!-- Header -->
      <div class="bg-[#173119]/80 p-6 border-b border-white/10 relative z-10 text-center">
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-widest uppercase drop-shadow-md mb-3 font-['Comic_Sans_MS',_cursive,sans-serif]">
          {{ isFinal ? 'Resultados Finales' : `Puntuación Ronda ${currentRound}` }}
        </h2>
        <div class="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#e2e8f0] font-['Comic_Sans_MS',_cursive,sans-serif] flex-wrap">
          <span class="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">100pts Única</span>
          <span class="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">50pts Compartida</span>
          <span class="bg-red-500/10 text-red-300 px-3 py-1.5 rounded-full border border-red-500/20 shadow-sm">0pts Inválida</span>
        </div>
      </div>

      <!-- Body -->
      <div class="p-6 sm:p-8 relative z-10 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div 
          v-for="(player, idx) in sortedPlayers" 
          :key="player.userId"
          class="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl border border-white/10 relative overflow-hidden"
          :class="player.userId === myUserId ? 'border-yellow-400/50 bg-yellow-400/5' : ''"
        >
          <!-- Ranking Badge -->
          <div 
            class="absolute left-0 top-0 bottom-0 w-2 flex items-center justify-center"
            :class="idx === 0 ? 'bg-[#fbbf24]' : idx === 1 ? 'bg-[#94a3b8]' : idx === 2 ? 'bg-[#b45309]' : 'bg-transparent'"
          ></div>

          <div class="flex items-center gap-4 pl-6">
            <div class="text-3xl font-black w-10 text-center font-['Comic_Sans_MS',_cursive,sans-serif]" :class="idx === 0 ? 'text-[#fbbf24] drop-shadow-md' : 'text-white/30 drop-shadow-sm'">
              #{{ idx + 1 }}
            </div>
            
            <div class="relative">
              <img :src="`/avatars/avatar-${player.avatarId}.svg`" class="w-12 h-12 rounded-full bg-[#1a0f08] p-1 border-2 shadow-inner" :style="{ borderColor: player.color }" />
            </div>
            
            <div class="flex flex-col">
              <div class="font-black text-xl tracking-wider uppercase drop-shadow-sm font-['Comic_Sans_MS',_cursive,sans-serif]" :class="player.userId === myUserId ? 'text-yellow-300' : 'text-white'">
                {{ player.nickname }}
              </div>
              <div class="text-[10px] font-black uppercase tracking-widest text-[#4ade80] mt-1 font-['Comic_Sans_MS',_cursive,sans-serif]" v-if="!isFinal && getRoundScore(player.userId) > 0">
                +{{ getRoundScore(player.userId) }} esta ronda
              </div>
              <div class="text-[10px] font-black uppercase tracking-widest text-red-400 mt-1 font-['Comic_Sans_MS',_cursive,sans-serif]" v-else-if="!isFinal">
                0 esta ronda
              </div>
            </div>
          </div>

          <div class="text-4xl font-black tracking-tighter drop-shadow-md flex items-end gap-1 font-['Comic_Sans_MS',_cursive,sans-serif]" :class="idx === 0 ? 'text-[#fbbf24]' : 'text-white'">
            {{ player.score || 0 }} <span class="text-sm font-bold text-[#e2e8f0] mb-1">pts</span>
          </div>
        </div>
      </div>

      <!-- Podium of Shame -->
      <div v-if="isFinal && mostInvalidatedPlayer" class="mx-auto mb-6 bg-black/20 border border-white/10 rounded-full px-6 py-2 flex items-center justify-center gap-3 relative z-10 shadow-sm backdrop-blur-sm w-max">
        <div class="relative z-10 text-white/50">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="relative z-10 flex items-center gap-2">
          <div class="text-white/60 font-medium tracking-wide text-xs">Mente en Blanco:</div>
          <div class="text-white/90 font-bold text-sm tracking-wide flex items-center gap-1.5">
            {{ mostInvalidatedPlayer.nickname }} 
            <span class="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">{{ mostInvalidatedPlayer.invalidatedCount }} invalidadas</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-[#173119]/80 p-6 border-t border-white/10 relative z-10 flex justify-center backdrop-blur-md">
        <button 
          v-if="isHost && !isFinal" 
          class="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-[#2d1b11] font-black tracking-[0.2em] uppercase rounded border-b-4 border-yellow-700 active:translate-y-1 active:border-b-0 shadow-[0_5px_15px_rgba(0,0,0,0.4)] transition-all w-full sm:w-auto font-['Comic_Sans_MS',_cursive,sans-serif]"
          @click="$emit('next_round')"
        >
          Siguiente Ronda ({{ currentRound + 1 }}/{{ totalRounds }})
        </button>
        <button 
          v-if="isHost && isFinal" 
          class="px-8 py-4 bg-[#109041] hover:bg-[#15b051] text-white font-black tracking-[0.2em] uppercase rounded border-b-4 border-[#0a5c28] active:translate-y-1 active:border-b-0 shadow-[0_5px_15px_rgba(0,0,0,0.4)] transition-all w-full sm:w-auto font-['Comic_Sans_MS',_cursive,sans-serif]"
          @click="$emit('back_to_lobby')"
        >
          Volver al Lobby
        </button>
        <div v-if="!isHost" class="flex flex-col items-center justify-center gap-2 py-2">
          <div class="w-8 h-8 rounded-full border-4 border-white/20 border-t-yellow-400 animate-spin"></div>
          <span class="text-gray-300 uppercase tracking-widest text-[10px] font-black font-['Comic_Sans_MS',_cursive,sans-serif]">Esperando al Host...</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">

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

const mostInvalidatedPlayer = computed(() => {
  if (!props.isFinal) return null
  const playersWithInvalidations = props.players.filter(p => p.invalidatedCount && p.invalidatedCount > 0)
  if (playersWithInvalidations.length === 0) return null
  return playersWithInvalidations.reduce((prev, current) => (prev.invalidatedCount > current.invalidatedCount) ? prev : current)
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
  background: #173119;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #254b27;
  border-radius: 4px;
  border: 2px solid #173119;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #2f5f31;
}
</style>
