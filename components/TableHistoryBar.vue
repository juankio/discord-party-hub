<template>
  <div class="w-full bg-[#2a1a0f] border-8 border-[#5c3a21] rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,0.8)] overflow-hidden">
    <div class="bg-[#1a0f0a] py-3 border-b-4 border-[#111]">
      <h3 class="text-center text-[#f59e0b] font-black tracking-widest uppercase text-sm drop-shadow-md">
        Clasificación
      </h3>
    </div>
    
    <div class="p-4 flex flex-col gap-3">
      <div 
        v-for="(player, index) in sortedPlayers" 
        :key="player.userId"
        class="flex items-center gap-4 p-3 rounded-xl border-2 transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.6)]"
        :class="[
          index === 0 
            ? 'bg-[#4a2e1b] border-[#f59e0b]' 
            : 'bg-[#382012] border-[#2c190d]'
        ]"
      >
        <!-- Rango -->
        <div class="w-6 font-black text-lg text-center"
             :class="index === 0 ? 'text-[#f59e0b]' : 'text-gray-500'">
          #{{ index + 1 }}
        </div>
        
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full border-2 bg-black flex-shrink-0"
             :style="{ borderColor: player.color || '#f97316' }">
          <img :src="`/avatars/avatar-${player.avatarId}.svg`" class="w-full h-full object-contain rounded-full">
        </div>
        
        <!-- Info -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <span class="font-bold text-sm truncate"
                :class="index === 0 ? 'text-[#f59e0b] drop-shadow-[1px_1px_0_#000]' : 'text-white'">
            {{ player.nickname }}
          </span>
          <span class="text-xs font-black text-green-400 mt-1">
            {{ player.totalWins || 0 }} Victorias
          </span>
        </div>
      </div>
      
      <div v-if="players.length === 0" class="text-center text-gray-500 text-xs py-4 font-bold">
        Sin jugadores
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  players: {
    type: Array as () => any[],
    required: true
  }
})

const sortedPlayers = computed(() => {
  return [...props.players].sort((a, b) => (b.totalWins || 0) - (a.totalWins || 0))
})
</script>
