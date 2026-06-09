<template>
  <div class="min-h-screen bg-[#0A0A0A] p-4 sm:p-8 text-white relative flex flex-col items-center">
    <div class="w-full max-w-7xl mx-auto z-10 flex flex-col gap-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-center sm:text-left">
          <h2 class="text-3xl sm:text-4xl font-black tracking-widest text-orange-500 drop-shadow-md uppercase">Votación</h2>
          <p class="text-gray-400 mt-1 uppercase font-bold tracking-widest">
            Letra Activa: <span class="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] ml-2">{{ letter }}</span>
          </p>
        </div>
        <button 
          v-if="isHost"
          class="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.4)] tracking-widest uppercase"
          @click="finishVerification"
        >
          Confirmar Votos y Puntuar
        </button>
      </div>

      <!-- Scrollable Matrix -->
      <div class="w-full bg-[#1A1A1A] rounded-3xl border border-white/10 overflow-x-auto custom-scrollbar shadow-2xl relative">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th class="p-5 bg-[#151515] border-b border-r border-white/5 sticky left-0 z-20 font-black tracking-widest uppercase text-white shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                Jugador
              </th>
              <th 
                v-for="catData in verifyingData" 
                :key="catData.category"
                class="p-5 bg-[#151515] border-b border-r border-white/5 font-black tracking-widest uppercase text-orange-400 whitespace-nowrap text-center"
              >
                {{ catData.category }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player.userId" class="group hover:bg-white/5 transition-colors">
              <td class="p-5 border-b border-r border-white/5 sticky left-0 bg-[#1A1A1A] group-hover:bg-[#202020] z-10 font-bold shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <img :src="`/avatars/avatar-${player.avatarId}.svg`" class="w-10 h-10 rounded-full bg-white/10 p-1 border-2" :style="{ borderColor: player.color }" />
                  </div>
                  <span class="tracking-wider uppercase" :class="player.userId === myUserId ? 'text-orange-400' : 'text-white'">
                    {{ player.nickname }}
                  </span>
                </div>
              </td>
              
              <td 
                v-for="catData in verifyingData" 
                :key="catData.category"
                class="p-5 border-b border-r border-white/5 relative text-center"
              >
                <div class="flex flex-col items-center gap-2">
                  <span 
                    class="text-xl font-black tracking-wider uppercase transition-colors duration-300 relative"
                    :class="[
                      !getAnswerObj(catData, player.userId)?.answer ? 'text-gray-600' : 'text-white',
                      isVetoed(catData, player.userId) ? 'text-red-500 opacity-50' : ''
                    ]"
                  >
                    {{ getAnswerObj(catData, player.userId)?.answer || '---' }}
                    
                    <!-- Strikethrough line -->
                    <div 
                      class="absolute top-1/2 left-[-10%] h-1 bg-red-500 origin-left scale-x-0"
                      :class="`strikethrough-${player.userId}-${catData.category.replace(/[^a-zA-Z0-9]/g, '')}`"
                      style="width: 120%; margin-top: -2px; box-shadow: 0 0 10px rgba(239,68,68,0.8);"
                    ></div>
                  </span>
                  
                  <button 
                    v-if="player.userId !== myUserId && getAnswerObj(catData, player.userId)?.answer"
                    @click="toggleVeto(player.userId, catData.category)"
                    class="text-xs font-bold uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded-full transition-all"
                    :class="hasMyVeto(catData, player.userId) ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'"
                  >
                    VETO ({{ getVetoCount(catData, player.userId) }})
                  </button>
                  <div v-else-if="getAnswerObj(catData, player.userId)?.answer" class="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
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
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
