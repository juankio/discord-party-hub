<template>
  <!-- Quité el padding inferior y ajusté el alignment para que las cajas reposen sobre la línea de madera (repisa) -->
  <div class="w-full flex gap-6 overflow-x-auto pt-8 pb-8 custom-scrollbar px-4 snap-x items-end justify-start md:justify-center relative z-10">
    <button
      v-for="game in games"
      :key="game.id"
      class="relative group outline-none focus:outline-none transition-all duration-500 snap-center shrink-0"
      :class="[
        game.disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer',
        selectedGame === game.id ? 'z-20 -translate-y-4' : 'z-10 hover:-translate-y-1'
      ]"
      :disabled="game.disabled"
      @click="$emit('select', game.id)"
    >
      <!-- Halo de selección (Mágico) -->
      <div v-if="selectedGame === game.id" 
           class="absolute inset-0 blur-xl opacity-60 transition-opacity duration-300"
           :style="{ backgroundColor: 'var(--theme-color)' }"></div>

      <!-- Caja del Juego de Mesa (Rectángulo 3D) -->
      <div 
        class="w-[120px] h-[160px] md:w-[140px] md:h-[190px] rounded-sm relative flex flex-col items-center justify-center border-[3px] border-black/40 overflow-hidden transform-gpu"
        :class="[game.color]"
        style="box-shadow: inset 0 0 20px rgba(0,0,0,0.5), -5px 10px 15px rgba(0,0,0,0.8);"
      >
        <!-- Borde "tapa" de la caja (Efecto de cartón) -->
        <div class="absolute inset-0 border-[4px] border-white/10 rounded-sm pointer-events-none"></div>
        <div class="absolute top-0 w-full h-[2px] bg-white/30"></div>
        <div class="absolute left-0 h-full w-[2px] bg-white/20"></div>

        <!-- Decoración central de la caja -->
        <div class="w-16 h-16 md:w-20 md:h-20 bg-black/30 rounded-full flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-sm z-10 group-hover:scale-110 transition-transform duration-300">
           <span class="font-black text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" :class="game.textSize">{{ game.number }}</span>
        </div>
        
        <!-- Nombre impreso en la caja -->
        <span class="absolute bottom-4 font-black text-[11px] md:text-xs tracking-[0.2em] text-white/90 drop-shadow-md uppercase z-10">{{ game.name }}</span>
        
        <!-- Marca de agua de textura (Simulando impresión) -->
        <div class="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none"></div>
      </div>
      
      <!-- Sombra proyectada en la repisa -->
      <div class="absolute -bottom-2 left-2 right-2 h-4 bg-black/80 rounded-[100%] blur-[4px] -z-10"
           :class="selectedGame === game.id ? 'opacity-30 scale-x-90 translate-y-4 blur-[8px]' : 'opacity-100 scale-x-100'"></div>
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
