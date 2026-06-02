<template>
  <div class="w-full flex justify-center gap-12 overflow-x-auto pt-8 pb-12 custom-scrollbar px-10 snap-x items-end relative z-10">
    <!-- Repisa única inferior -->
    <div class="absolute bottom-6 left-0 right-0 h-4 bg-[#4a2e1b] border-y border-[#3a2212] shadow-[0_15px_15px_rgba(0,0,0,0.7)] z-0"></div>

    <button
      v-for="game in games"
      :key="game.id"
      class="relative group outline-none focus:outline-none transition-all duration-500 snap-center shrink-0 z-10"
      :class="[
        game.disabled ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer',
        selectedGame === game.id ? 'z-20 -translate-y-6 scale-110' : 'hover:-translate-y-2'
      ]"
      :disabled="game.disabled"
      @click="$emit('select', game.id)"
    >
      <!-- Flecha indicadora -->
      <div v-if="selectedGame === game.id" class="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce z-30">
        <svg class="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-7-7h14l-7 7z" /></svg>
      </div>

      <!-- CAJA 3D ISOMÉTRICA -->
      <div class="game-box-container w-[140px] h-[100px] relative preserve-3d"
           :class="{ 'glow-selected': selectedGame === game.id }">
        
        <!-- Cara Frontal (El lomo grueso inferior) -->
        <div class="absolute bottom-0 left-0 right-[-20px] h-[40px] bg-[#1a1a1a] origin-bottom skew-x-[-30deg] border-b-2 border-l-2 border-black flex items-center justify-center overflow-hidden shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)]">
           <span class="text-gray-600 font-black text-xl tracking-[0.3em] uppercase opacity-40 select-none transform skew-x-[30deg]" 
                 style="text-shadow: -1px -1px 0 #000, 1px 1px 0 #333;">
             {{ game.name }}
           </span>
        </div>

        <!-- Cara Derecha (El grosor lateral oscuro) -->
        <div class="absolute top-[20px] bottom-0 right-[-20px] w-[20px] bg-black origin-right skew-y-[-60deg] border-r-2 border-b-2 border-[#0a0a0a]"></div>

        <!-- Cara Superior (La Tapa Principal de la Caja) -->
        <div class="absolute top-0 left-0 w-full h-[100px] origin-bottom-left skew-x-[-30deg] border-2 border-black flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]"
             :class="game.color">
             
           <!-- Diseño específico de la tapa según el juego -->
           
           <!-- Diseño UNO -->
           <div v-if="game.id === 'uno'" class="w-[90%] h-[85%] bg-black border-[3px] border-white rounded-md flex items-center justify-center relative overflow-hidden transform skew-x-[30deg]">
             <div class="w-[85%] h-[80%] bg-red-600 rounded-[50%_50%/65%_65%] transform rotate-[-20deg] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]">
               <span class="text-yellow-400 font-black text-3xl tracking-tighter drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]" style="-webkit-text-stroke: 1px black;">UNO</span>
             </div>
             <!-- Texturita sutil -->
             <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
           </div>

           <!-- Diseño Parchis -->
           <div v-if="game.id === 'parchis'" class="w-[90%] h-[85%] bg-[#eab308] border-[3px] border-white rounded-md flex items-center justify-center relative transform skew-x-[30deg]">
             <div class="grid grid-cols-2 grid-rows-2 w-[70%] h-[80%] gap-1 p-1">
               <div class="bg-red-500 rounded-sm"></div>
               <div class="bg-blue-500 rounded-sm"></div>
               <div class="bg-green-500 rounded-sm"></div>
               <div class="bg-yellow-200 rounded-sm"></div>
             </div>
             <div class="absolute w-8 h-8 bg-white border border-black rounded-md flex items-center justify-center shadow-lg transform rotate-12">
               <div class="w-1.5 h-1.5 bg-black rounded-full"></div>
             </div>
           </div>

           <!-- Diseño Generico para otros -->
           <div v-if="!['uno', 'parchis'].includes(game.id)" class="w-[90%] h-[85%] bg-gray-800 border-[3px] border-gray-600 rounded-md flex items-center justify-center transform skew-x-[30deg]">
             <UIcon v-if="game.id === 'liars'" name="i-lucide-skull" class="w-12 h-12 text-gray-500" />
             <UIcon v-if="game.id === 'stop'" name="i-lucide-hand" class="w-12 h-12 text-blue-500" />
             <UIcon v-if="game.id === 'pinturillo'" name="i-lucide-paintbrush" class="w-12 h-12 text-purple-500" />
           </div>

        </div>
      </div>
      
      <!-- Sombra en la repisa -->
      <div class="absolute -bottom-8 left-4 right-0 h-8 bg-black/80 rounded-[100%] blur-[8px] -z-10 transition-all duration-500"
           :class="selectedGame === game.id ? 'opacity-30 scale-x-90 translate-y-6 blur-[12px]' : 'opacity-100 scale-x-100'"></div>
           
      <!-- Indicador "Próximamente" -->
      <div v-if="game.disabled" class="absolute top-0 right-[-10px] bg-red-600/90 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-lg transform rotate-[15deg] z-40 border border-red-800 uppercase">
        En obras
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

<style scoped>
.preserve-3d {
  transform-style: preserve-3d;
}

.glow-selected .absolute.top-0.left-0 {
  box-shadow: inset 0 0 20px rgba(0,0,0,0.6), 0 0 30px var(--theme-color);
  border-color: var(--theme-color);
}
.glow-selected .absolute.bottom-0.left-0 {
  border-color: var(--theme-color);
}
</style>
