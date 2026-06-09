<template>
  <div class="min-h-screen p-4 sm:p-8 relative flex flex-col items-center" style="color: var(--theme-text-color, white);">
    <div class="w-full max-w-[1000px] mx-auto z-10 flex flex-col gap-6">
      
      <!-- Header 2D Madera -->
      <div class="bg-[#3a2212] p-6 border-4 border-[#2a180c] rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_20px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px);"></div>
        <div class="text-center sm:text-left relative z-10">
          <h2 class="text-2xl sm:text-3xl font-black tracking-widest text-[#f97316] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase">Fase de Votación</h2>
          <p class="text-[#cdab84] mt-1 uppercase font-bold tracking-widest text-xs">
            Letra Activa: <span class="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ml-2">{{ letter }}</span>
          </p>
        </div>
        <button 
          v-if="isHost"
          class="relative z-10 px-8 py-4 bg-[#f97316] hover:bg-[#ea580c] text-white font-black rounded-xl transition-all active:translate-y-1 border-b-4 border-[#c2410c] active:border-b-0 shadow-[0_5px_15px_rgba(0,0,0,0.4)] tracking-widest uppercase text-sm"
          @click="finishVerification"
        >
          Confirmar Votos y Puntuar
        </button>
      </div>

      <!-- Scrollable Matrix 2D Madera -->
      <div class="w-full bg-[#4a2e1b] rounded-3xl border-8 border-[#7d512a] overflow-x-auto custom-scrollbar shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] relative">
        <div class="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px);"></div>

        <table class="w-full text-left border-collapse min-w-[800px] relative z-10">
          <thead>
            <tr>
              <th class="p-5 bg-[#2a180c] border-b-4 border-r-4 border-[#1a0f08] sticky left-0 z-20 font-black tracking-widest uppercase text-white shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                Jugador
              </th>
              <th 
                v-for="catData in verifyingData" 
                :key="catData.category"
                class="p-5 bg-[#3a2212] border-b-4 border-r-4 border-[#1a0f08] font-black tracking-widest uppercase text-[#f97316] whitespace-nowrap text-center drop-shadow-md"
              >
                {{ catData.category }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player.userId" class="group hover:bg-[#5c3a21] transition-colors">
              <td class="p-5 border-b-4 border-r-4 border-[#2a180c] sticky left-0 bg-[#3a2212] group-hover:bg-[#4a2e1b] z-10 font-bold shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <img :src="`/avatars/avatar-${player.avatarId}.svg`" class="w-10 h-10 rounded-full bg-[#1a0f08] p-1 border-2 shadow-inner" :style="{ borderColor: player.color }" />
                  </div>
                  <span class="tracking-wider uppercase text-xs" :class="player.userId === myUserId ? 'text-[#f97316]' : 'text-[#e5e7eb]'">
                    {{ player.nickname }}
                  </span>
                </div>
              </td>
              
              <td 
                v-for="catData in verifyingData" 
                :key="catData.category"
                class="p-5 border-b-4 border-r-4 border-[#2a180c] relative text-center bg-[#4a2e1b] group-hover:bg-[#5c3a21]"
              >
                <div class="flex flex-col items-center gap-2">
                  <span 
                    class="text-xl font-black tracking-wider uppercase transition-colors duration-300 relative"
                    :class="[
                      !getAnswerObj(catData, player.userId)?.answer ? 'text-[#cdab84] opacity-50' : 'text-white',
                      isVetoed(catData, player.userId) ? 'text-red-500 opacity-50' : ''
                    ]"
                  >
                    {{ getAnswerObj(catData, player.userId)?.answer || '---' }}
                    
                    <!-- Strikethrough line 2D style -->
                    <div 
                      class="absolute top-1/2 left-[-10%] h-2 bg-red-600 border border-red-900 origin-left scale-x-0 rounded"
                      :class="`strikethrough-${player.userId}-${catData.category.replace(/[^a-zA-Z0-9]/g, '')}`"
                      style="width: 120%; margin-top: -4px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"
                    ></div>
                  </span>
                  
                  <button 
                    v-if="player.userId !== myUserId && getAnswerObj(catData, player.userId)?.answer"
                    @click="toggleVeto(player.userId, catData.category)"
                    class="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all border-2"
                    :class="hasMyVeto(catData, player.userId) ? 'bg-[#991b1b] text-white border-[#7f1d1d] shadow-inner' : 'bg-[#2a1a0f] text-[#cdab84] border-[#1a0f08] hover:bg-[#3a2212] hover:text-white shadow-sm'"
                  >
                    VETO ({{ getVetoCount(catData, player.userId) }})
                  </button>
                  <div v-else-if="getAnswerObj(catData, player.userId)?.answer" class="text-[10px] font-black uppercase tracking-widest text-[#cdab84] mt-1 bg-[#2a1a0f] px-2 py-1 rounded border border-[#1a0f08]">
                    VETOS: {{ getVetoCount(catData, player.userId) }}
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
import { computed, watch, nextTick } from 'vue'
import anime from 'animejs'

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

const isVetoed = (catData: any, userId: string) => {
  return getVetoCount(catData, userId) > vetoThreshold.value
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

// Watch for vetos reaching threshold to trigger strikethrough animation
watch(() => props.verifyingData, (newData) => {
  nextTick(() => {
    props.players.forEach(p => {
      newData.forEach(catData => {
        const catSafe = catData.category.replace(/[^a-zA-Z0-9]/g, '')
        const targetClass = `.strikethrough-${p.userId}-${catSafe}`
        
        if (isVetoed(catData, p.userId)) {
          anime({
            targets: targetClass,
            scaleX: [0, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
          })
        } else {
          anime({
            targets: targetClass,
            scaleX: 0,
            duration: 200,
            easing: 'easeInQuad'
          })
        }
      })
    })
  })
}, { deep: true })
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
