<template>
  <div class="relative w-full">
    <!-- Doble repisa visual estática -->
    <div class="absolute inset-0 pointer-events-none z-0 flex flex-col justify-evenly">
      <div class="w-full h-5 bg-[#4a2e1b] border-y-2 border-[#2c190d] shadow-[0_15px_20px_rgba(0,0,0,0.6)] translate-y-4"></div>
      <div class="w-full h-5 bg-[#4a2e1b] border-y-2 border-[#2c190d] shadow-[0_15px_20px_rgba(0,0,0,0.6)] translate-y-4"></div>
    </div>

    <!-- Contenedor de juegos (Grid 2 filas) -->
    <div class="w-full grid grid-rows-2 grid-flow-col auto-cols-max gap-x-12 gap-y-16 overflow-x-auto pt-12 pb-16 custom-scrollbar px-12 snap-x relative z-10 justify-start">
      <button
        v-for="game in games"
        :key="game.id"
        class="box-wrapper outline-none snap-center relative"
        :class="[
          game.disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer',
          selectedGame === game.id ? 'selected z-30' : 'z-10 hover:z-20'
        ]"
        :disabled="game.disabled"
        @click="$emit('select', game.id)"
        :style="{ '--theme': game.color || '#334155' }"
      >
        <!-- Sombra base -->
        <div class="absolute bottom-[-5px] left-0 w-[120px] h-[30px] bg-black/80 blur-[8px] rounded-[100%] shadow-anim z-0"></div>
        
        <!-- Caja 3D -->
        <div class="box-3d z-10">
          <div class="face top rounded-sm overflow-hidden flex items-center justify-center">
             <!-- Diseño UNO -->
             <div v-if="game.id === 'uno'" class="w-full h-full bg-[#111] border-[4px] border-white p-2 flex items-center justify-center relative">
               <div class="w-[120%] h-[75%] bg-red-600 rounded-[50%] transform -rotate-[25deg] flex items-center justify-center border-2 border-red-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                 <span class="text-yellow-400 font-black text-4xl tracking-tighter" style="-webkit-text-stroke: 1.5px black; text-shadow: 3px 3px 0 #000;">UNO</span>
               </div>
             </div>
             
             <!-- Diseño PARCHIS -->
             <div v-else-if="game.id === 'parchis'" class="w-full h-full bg-[#eab308] border-[4px] border-white p-2 relative flex items-center justify-center">
               <div class="grid grid-cols-2 grid-rows-2 w-full h-full gap-1 p-1">
                 <div class="bg-red-500 rounded-tl shadow-[inset_0_0_8px_rgba(0,0,0,0.3)]"></div>
                 <div class="bg-blue-500 rounded-tr shadow-[inset_0_0_8px_rgba(0,0,0,0.3)]"></div>
                 <div class="bg-green-500 rounded-bl shadow-[inset_0_0_8px_rgba(0,0,0,0.3)]"></div>
                 <div class="bg-yellow-400 rounded-br shadow-[inset_0_0_8px_rgba(0,0,0,0.3)]"></div>
               </div>
               <div class="absolute w-12 h-12 bg-white border-2 border-gray-800 flex items-center justify-center transform rotate-12 shadow-lg">
                  <div class="w-3 h-3 bg-black rounded-full"></div>
               </div>
             </div>
             
             <!-- Diseño GENÉRICO -->
             <div v-else class="w-full h-full bg-gray-800 border-[3px] border-gray-600 flex items-center justify-center relative">
               <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
               <UIcon v-if="game.id === 'liars'" name="i-lucide-skull" class="w-14 h-14 text-gray-300 drop-shadow-md z-10" />
               <UIcon v-else-if="game.id === 'stop'" name="i-lucide-hand" class="w-14 h-14 text-blue-400 drop-shadow-md z-10" />
               <UIcon v-else-if="game.id === 'pinturillo'" name="i-lucide-paintbrush" class="w-14 h-14 text-purple-400 drop-shadow-md z-10" />
               <span v-else class="text-2xl font-black text-white opacity-50 z-10">{{ game.name.substring(0, 2) }}</span>
             </div>
          </div>
          
          <div class="face front flex items-center justify-center">
             <span class="text-white font-bold text-[10px] uppercase tracking-[0.2em] opacity-80" style="text-shadow: 1px 1px 0 #000;">{{ game.name }}</span>
          </div>
          
          <!-- Lomo lateral (Ahora lado Izquierdo) -->
          <div class="face left"></div>
        </div>
        
        <div v-if="game.disabled" class="absolute -top-4 -right-4 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg rotate-[15deg] z-40 border border-red-800 uppercase">
          En obras
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

<style scoped>
.box-wrapper {
  perspective: 1200px;
  width: 120px;
  height: 160px;
}
.box-3d {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(60deg) rotateZ(-35deg) translateZ(0);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.box-wrapper:hover:not(:disabled) .box-3d {
  transform: rotateX(60deg) rotateZ(-35deg) translateZ(20px);
}
.box-wrapper.selected .box-3d {
  transform: rotateX(60deg) rotateZ(-35deg) translateZ(50px) scale3d(1.05, 1.05, 1.05);
}

.face {
  position: absolute;
  border: 2px solid #111;
  background-color: var(--theme);
}
.top {
  width: 120px;
  height: 160px;
  transform: translateZ(24px);
}
.front {
  width: 120px;
  height: 24px;
  bottom: 0;
  transform-origin: bottom;
  transform: rotateX(-90deg);
}
.front::after {
  content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.4); z-index: -1;
}
.left {
  width: 24px;
  height: 160px;
  left: 0;
  transform-origin: left;
  transform: rotateY(-90deg);
}
.left::after {
  content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.6);
}

.shadow-anim {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.box-wrapper:hover:not(:disabled) .shadow-anim {
  transform: translateY(10px) scale(0.9);
  opacity: 0.5;
}
.box-wrapper.selected .shadow-anim {
  transform: translateY(30px) scale(0.7);
  opacity: 0.2;
}

.custom-scrollbar::-webkit-scrollbar { height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
</style>
