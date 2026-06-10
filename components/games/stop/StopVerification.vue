<template>
  <div class="min-h-screen p-4 sm:p-8 relative flex flex-col items-center" style="color: var(--theme-text-color, white);">
    <div class="w-full max-w-[1000px] mx-auto z-10 flex flex-col gap-6">
      
      <!-- Header Pizarra -->
      <div class="bg-[#1e3f20] p-6 border-[12px] border-[#8b5a2b] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_20px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <!-- Textura de Pizarra (Ruido/Tiza) -->
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E'); mix-blend-mode: overlay;"></div>
        
        <div class="text-center sm:text-left relative z-10">
          <h2 class="text-2xl sm:text-3xl font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase font-['Comic_Sans_MS',_cursive,sans-serif]">Fase de Revisión</h2>
          <p class="text-[#e2e8f0] mt-1 uppercase font-bold tracking-widest text-xs font-['Comic_Sans_MS',_cursive,sans-serif]">
            Letra Activa: <span class="text-3xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ml-2">{{ letter }}</span>
          </p>
        </div>
        <button 
          v-if="isHost"
          class="relative z-10 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-[#2d1b11] font-black rounded border-b-4 border-yellow-700 active:translate-y-1 active:border-b-0 shadow-[0_5px_15px_rgba(0,0,0,0.4)] tracking-widest uppercase text-sm font-['Comic_Sans_MS',_cursive,sans-serif]"
          @click="finishVerification"
        >
          Confirmar Votos y Puntuar
        </button>
      </div>

      <!-- Scrollable Matrix Pizarra -->
      <div class="w-full bg-[#1e3f20] rounded-lg border-[12px] border-[#8b5a2b] overflow-x-auto custom-scrollbar shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] relative">
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E'); mix-blend-mode: overlay;"></div>

        <table class="w-full text-left border-collapse min-w-[800px] relative z-10">
          <thead>
            <tr>
              <th class="p-5 bg-[#173119] border-b border-r border-white/20 sticky left-0 z-20 font-black tracking-widest uppercase text-white shadow-[4px_0_10px_rgba(0,0,0,0.5)] font-['Comic_Sans_MS',_cursive,sans-serif]">
                Jugador
              </th>
              <th 
                v-for="catData in verifyingData" 
                :key="catData.category"
                class="p-5 bg-[#173119] border-b border-r border-white/20 font-black tracking-widest uppercase text-yellow-300 whitespace-nowrap text-center drop-shadow-md font-['Comic_Sans_MS',_cursive,sans-serif]"
              >
                {{ catData.category }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player.userId" class="group hover:bg-[#254b27] transition-colors">
              <td class="p-5 border-b border-r border-white/20 sticky left-0 bg-[#1e3f20] group-hover:bg-[#254b27] z-10 font-bold shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <img :src="`/avatars/avatar-${player.avatarId}.svg`" class="w-10 h-10 rounded-full bg-[#1a0f08] p-1 border-2 shadow-inner" :style="{ borderColor: player.color }" />
                  </div>
                  <span class="tracking-wider uppercase text-xs font-['Comic_Sans_MS',_cursive,sans-serif]" :class="player.userId === myUserId ? 'text-yellow-300' : 'text-white'">
                    {{ player.nickname }}
                  </span>
                </div>
              </td>
              
              <td 
                v-for="catData in verifyingData" 
                :key="catData.category"
                class="p-5 border-b border-r border-white/20 relative text-center bg-[#1e3f20] group-hover:bg-[#254b27]"
              >
                <div class="flex flex-col items-center gap-2">
                  <span 
                    class="text-xl font-black tracking-wider uppercase transition-colors duration-300 relative font-['Comic_Sans_MS',_cursive,sans-serif]"
                    :class="[
                      !getAnswerObj(catData, player.userId)?.answer ? 'text-white/30 italic' : 'text-white',
                      isVetoed(catData, player.userId) ? 'text-red-400 opacity-50' : ''
                    ]"
                  >
                    {{ getAnswerObj(catData, player.userId)?.answer || '---' }}
                    
                    <!-- Strikethrough line 2D style (Chalk-like) -->
                    <div 
                      class="absolute top-1/2 left-[-10%] h-2 bg-red-500 origin-left rounded rotate-[-2deg] transition-transform duration-500 ease-out"
                      :class="isVetoed(catData, player.userId) ? 'scale-x-100' : 'scale-x-0'"
                      style="width: 120%; margin-top: -4px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"
                    ></div>
                  </span>
                  
                  <button 
                    v-if="player.userId !== myUserId && getAnswerObj(catData, player.userId)?.answer && !isAutoInvalid(catData, player.userId)"
                    @click="toggleVeto(player.userId, catData.category)"
                    class="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded transition-all border-2 font-['Comic_Sans_MS',_cursive,sans-serif]"
                    :class="hasMyVeto(catData, player.userId) ? 'bg-[#991b1b] text-white border-[#7f1d1d] shadow-inner' : 'bg-[#173119] text-gray-300 border-white/20 hover:bg-[#254b27] hover:text-white shadow-sm'"
                  >
                    INVALIDAR ({{ getVetoCount(catData, player.userId) }})
                  </button>
                  <div v-else-if="getAnswerObj(catData, player.userId)?.answer && !isAutoInvalid(catData, player.userId)" class="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 px-2 py-1 rounded border border-white/10 font-['Comic_Sans_MS',_cursive,sans-serif]">
                    INVÁLIDOS: {{ getVetoCount(catData, player.userId) }}
                  </div>
                  <div v-if="getAnswerObj(catData, player.userId)?.answer && isAutoInvalid(catData, player.userId)" class="text-[10px] font-black uppercase tracking-widest text-red-400 mt-1 font-['Comic_Sans_MS',_cursive,sans-serif]">
                    (Letra Incorrecta)
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  players: any[]
  verifyingData: any[] // CategoryVerification[]
  letter: string
  myUserId: string
  isHost: boolean
}>()

const emit = defineEmits(['veto', 'finish_verification'])

const totalPlayers = computed(() => props.players.length)
const vetoThreshold = computed(() => Math.floor(totalPlayers.value / 2))

const getAnswerObj = (catData: any, userId: string) => {
  return catData.answers.find((a: any) => a.userId === userId)
}

const getVetoCount = (catData: any, userId: string) => {
  const ans = getAnswerObj(catData, userId)
  return ans ? ans.vetos.length : 0
}

const isAutoInvalid = (catData: any, userId: string) => {
  const ans = getAnswerObj(catData, userId)
  if (!ans || !ans.answer) return false
  return !ans.answer.toLowerCase().startsWith(props.letter.toLowerCase())
}

const isVetoed = (catData: any, userId: string) => {
  const ans = getAnswerObj(catData, userId)
  if (!ans || !ans.answer) return false
  return getVetoCount(catData, userId) > vetoThreshold.value || isAutoInvalid(catData, userId)
}

const hasMyVeto = (catData: any, userId: string) => {
  const ans = getAnswerObj(catData, userId)
  return ans ? ans.vetos.includes(props.myUserId) : false
}

const toggleVeto = (targetId: string, cat: string) => {
  emit('veto', { targetId, category: cat })
}

const finishVerification = () => {
  emit('finish_verification')
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
