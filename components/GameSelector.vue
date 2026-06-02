<template>
  <div class="w-full flex gap-4 overflow-x-auto pb-4 custom-scrollbar px-4 snap-x">
    <button
      v-for="game in games"
      :key="game.id"
      class="min-w-[140px] md:min-w-[160px] h-[200px] md:h-[240px] bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 relative group outline-none focus:outline-none snap-center overflow-hidden shadow-2xl"
      :class="[
        selectedGame === game.id ? 'scale-105 z-20' : 'hover:scale-105 opacity-50 hover:opacity-100',
        game.disabled ? 'cursor-not-allowed grayscale' : 'cursor-pointer'
      ]"
      :style="selectedGame === game.id ? { borderColor: 'var(--theme-color)', boxShadow: '0 0 40px rgba(var(--theme-color-rgb), 0.2)' } : {}"
      :disabled="game.disabled"
      @click="$emit('select', game.id)"
    >
      <div v-if="selectedGame === game.id" class="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21l-7-7h14l-7 7z" />
        </svg>
      </div>

      <div 
        class="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 border-black/80 shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.5),_0_8px_10px_rgba(0,0,0,0.6)]"
        :class="[game.color]"
      >
        <div class="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] border border-black/10">
          <span class="font-black text-black" :class="game.textSize">{{ game.number }}</span>
        </div>
        <div class="absolute top-1 right-2 w-3 h-2 bg-white/60 rounded-full rotate-[45deg]"/>
      </div>

      <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/60 rounded-full blur-[2px] -z-10"/>
      
      <div
class="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-300"
           :class="selectedGame === game.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'">
        <span class="text-[10px] font-black tracking-widest text-amber-100 bg-black/80 px-2 py-1 rounded border border-white/10 uppercase">{{ game.name }}</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  games: { type: Array as () => any[], required: true },
  selectedGame: { type: String, required: true }
})
defineEmits(['select'])
</script>
