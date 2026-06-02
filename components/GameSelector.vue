<template>
  <div class="w-full flex flex-col gap-8 relative z-10 py-4">
    <!-- Fila Superior (3 Juegos) -->
    <div class="flex justify-center gap-6 md:gap-12 relative pb-2 pt-2">
      <!-- Repisa 1 -->
      <div class="absolute bottom-0 left-[-2rem] right-[-2rem] h-4 bg-[#4a2e1b] border-y border-[#3a2212] shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-0"></div>
      
      <button
        v-for="game in games.slice(0, 3)"
        :key="game.id"
        class="relative group outline-none focus:outline-none transition-all duration-300 z-10"
        :class="[
          game.disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer',
          selectedGame === game.id ? 'z-20 -translate-y-4 scale-110' : 'hover:-translate-y-2'
        ]"
        :disabled="game.disabled"
        @click="$emit('select', game.id)"
      >
        <!-- Flecha indicadora flotante (Estilo Arcade) -->
        <div v-if="selectedGame === game.id" class="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce z-30">
          <svg class="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21l-7-7h14l-7 7z" />
          </svg>
        </div>

        <!-- Bola Flat 2D -->
        <div 
          class="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 border-black/80 shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.5),_0_8px_10px_rgba(0,0,0,0.6)]"
          :class="[game.color]"
        >
          <!-- Centro blanco de la bola -->
          <div class="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] border border-black/10">
            <span class="font-black text-black" :class="game.textSize">{{ game.number }}</span>
          </div>
          <!-- Brillo Blanco (Estilo Vector Flat) -->
          <div class="absolute top-1 right-2 w-3 h-2 bg-white/60 rounded-full rotate-[45deg]"></div>
        </div>

        <!-- Sombra en la repisa -->
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/60 rounded-full blur-[2px] -z-10"></div>
        
        <!-- Etiqueta del nombre -->
        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-300"
             :class="selectedGame === game.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'">
          <span class="text-[9px] md:text-[10px] font-black tracking-widest text-amber-100 bg-[#2a1a0f] px-2 py-1 rounded border border-white/5 uppercase shadow-md">{{ game.name }}</span>
        </div>
      </button>
    </div>

    <!-- Fila Inferior (2 Juegos) -->
    <div class="flex justify-center gap-6 md:gap-12 relative pb-2 pt-6">
      <!-- Repisa 2 -->
      <div class="absolute bottom-0 left-[-2rem] right-[-2rem] h-4 bg-[#4a2e1b] border-y border-[#3a2212] shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-0"></div>
      
      <button
        v-for="game in games.slice(3, 5)"
        :key="game.id"
        class="relative group outline-none focus:outline-none transition-all duration-300 z-10"
        :class="[
          game.disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer',
          selectedGame === game.id ? 'z-20 -translate-y-4 scale-110' : 'hover:-translate-y-2'
        ]"
        :disabled="game.disabled"
        @click="$emit('select', game.id)"
      >
        <!-- Flecha indicadora flotante -->
        <div v-if="selectedGame === game.id" class="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce z-30">
          <svg class="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21l-7-7h14l-7 7z" />
          </svg>
        </div>

        <!-- Bola Rayada Flat 2D (Para Pinturillo o especiales) -->
        <div 
          v-if="game.style === 'striped'"
          class="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex flex-col justify-center items-center shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.5),_0_8px_10px_rgba(0,0,0,0.6)] bg-[#f8f9fa] border-2 border-black/80"
        >
          <!-- Franja de color -->
          <div class="absolute w-full h-[55%] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.2)]" :class="game.color">
            <div class="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] border border-black/10 relative z-10">
              <span class="font-black text-black" :class="game.textSize">{{ game.number }}</span>
            </div>
          </div>
          <div class="absolute top-1 right-2 w-3 h-2 bg-white/60 rounded-full rotate-[45deg] z-20"></div>
        </div>

        <!-- Bola Sólida Flat 2D -->
        <div 
          v-else
          class="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 border-black/80 shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.5),_0_8px_10px_rgba(0,0,0,0.6)]"
          :class="[game.color]"
        >
          <div class="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] border border-black/10">
            <span class="font-black text-black" :class="game.textSize">{{ game.number }}</span>
          </div>
          <div class="absolute top-1 right-2 w-3 h-2 bg-white/60 rounded-full rotate-[45deg]"></div>
        </div>

        <!-- Sombra en la repisa -->
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/60 rounded-full blur-[2px] -z-10"></div>
        
        <!-- Etiqueta del nombre -->
        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-300"
             :class="selectedGame === game.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'">
          <span class="text-[9px] md:text-[10px] font-black tracking-widest text-amber-100 bg-[#2a1a0f] px-2 py-1 rounded border border-white/5 uppercase shadow-md">{{ game.name }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  games: { type: Array as () => any[], required: true },
  selectedGame: { type: String, required: true }
})
defineEmits(['select'])
</script>
