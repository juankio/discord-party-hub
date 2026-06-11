<template>
  <tr class="group hover:bg-[#254b27] transition-colors">
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
          (Letra Incorrecta / Muy Corta)
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
const props = defineProps<{
  player: any
  verifyingData: any[]
  myUserId: string
  letter: string
  vetoThreshold: number
}>()

const emit = defineEmits(['veto'])

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
  const answer = ans.answer.trim().toLowerCase()
  return !answer.startsWith(props.letter.toLowerCase()) || answer.length < 2
}

const isVetoed = (catData: any, userId: string) => {
  const ans = getAnswerObj(catData, userId)
  if (!ans || !ans.answer) return false
  return getVetoCount(catData, userId) > props.vetoThreshold || isAutoInvalid(catData, userId)
}

const hasMyVeto = (catData: any, userId: string) => {
  const ans = getAnswerObj(catData, userId)
  return ans ? ans.vetos.includes(props.myUserId) : false
}

const toggleVeto = (targetId: string, cat: string) => {
  emit('veto', { targetId, category: cat })
}
</script>
