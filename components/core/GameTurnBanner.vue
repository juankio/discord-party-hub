<script setup lang="ts">
defineProps<{
  isMyTurn: boolean
  playerName: string
}>()
</script>

<template>
  <div class="absolute top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 pointer-events-none">
    <div 
      v-if="isMyTurn" 
      class="px-8 py-2.5 rounded-full bg-yellow-500/20 border-2 border-yellow-400 text-yellow-400 font-black tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse uppercase backdrop-blur-md text-lg"
    >
      ¡Es tu turno!
    </div>
    <div 
      v-else 
      class="px-5 py-2 rounded-full bg-zinc-900/60 border border-zinc-700/50 text-zinc-300 text-sm font-semibold backdrop-blur-sm shadow-md"
    >
      Turno de: <span class="text-white font-bold">{{ playerName }}</span>
    </div>
  </div>
</template>
