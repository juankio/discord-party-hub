<template>
  <div class="relative w-full h-[280px] flex flex-col justify-end">
    <!-- Repisa base visual estática -->
    <div class="absolute bottom-0 left-0 w-full h-[16px] bg-[#4a2e1b] border-t border-[#704629] border-b-4 border-[#2c190d] shadow-[0_15px_20px_rgba(0,0,0,0.8)] pointer-events-none z-0"></div>

    <!-- Contenedor scroll -->
    <div class="w-full overflow-x-auto custom-scrollbar relative z-10 flex items-end pb-[16px] px-8 snap-x">
       
       <!-- Hilo/Cuerda Sticky -->
       <div class="sticky left-0 flex-none w-0 h-[2px] z-[15] pointer-events-none mb-[40px]">
          <!-- Usa 200vw para asegurar que cubra todo, aunque se haga scroll -->
          <div class="absolute left-0 w-[200vw] h-full bg-black/60 shadow-[0_1px_1px_rgba(255,255,255,0.2)]"></div>
       </div>

       <!-- Contenedor de Items (sin context de apilamiento extra para que z-index de botones funcione con el hilo) -->
       <div class="flex gap-x-12 px-4 items-end pt-20 w-max">
          <button
            v-for="game in games"
            :key="game.id"
            class="group outline-none snap-center relative transition-all duration-300 ease-out flex items-end justify-center w-28 h-32"
            :class="[
              game.disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer',
              selectedGame === game.id ? 'z-[20]' : 'z-10 hover:z-[20]'
            ]"
            :disabled="game.disabled"
            @click="$emit('select', game.id)"
          >
            <!-- Sombra anclada a la repisa -->
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 bg-black/60 blur-[3px] rounded-[50%] transition-all duration-300 pointer-events-none z-0"
                 :class="selectedGame === game.id ? 'w-24 opacity-40' : 'w-16 opacity-70 group-hover:w-20 group-hover:opacity-50'"></div>

            <!-- Objeto animado (se mueve verticalmente pero la sombra se queda) -->
            <div class="relative w-full flex flex-col items-center justify-end transition-transform duration-300 ease-out z-10"
                 :class="[
                   game.disabled ? '' : 'group-hover:-translate-y-4',
                   selectedGame === game.id ? '-translate-y-6 scale-110 drop-shadow-[0_25px_25px_rgba(0,0,0,0.7)]' : 'drop-shadow-lg'
                 ]">
                
                <!-- Etiqueta Nombre -->
                <div class="absolute -top-8 text-white font-bold text-[10px] uppercase tracking-widest whitespace-nowrap opacity-60 transition-opacity"
                     :class="{'opacity-100 text-yellow-400 drop-shadow-md': selectedGame === game.id}">
                  {{ game.name }}
                </div>

                <!-- Flecha Bouncing -->
                <div v-if="selectedGame === game.id" class="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce z-40 text-white drop-shadow-md">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-7-7h14l-7 7z" /></svg>
                </div>

                <!-- Glow trasero al seleccionar -->
                <div class="absolute inset-0 rounded-full blur-2xl opacity-0 transition-opacity duration-300 z-0 pointer-events-none"
                     :style="{ backgroundColor: game.color || '#ffffff' }"
                     :class="{ 'opacity-30': selectedGame === game.id }"></div>
                
                <!-- 2D Game Graphic -->
                <div class="relative z-10 w-full flex items-end justify-center">
                   <!-- UNO -->
                   <div v-if="game.id === 'uno'" class="relative w-20 h-28 flex items-center justify-center">
                     <div class="absolute w-20 h-28 bg-gray-900 border-2 border-white rounded-md rotate-12 shadow-md"></div>
                     <div class="absolute w-20 h-28 bg-red-600 border-2 border-white rounded-md -rotate-6 shadow-lg flex items-center justify-center overflow-hidden">
                       <div class="w-[110%] h-[60%] bg-white rounded-[50%] -rotate-[25deg] flex items-center justify-center">
                         <span class="text-red-600 font-black text-2xl tracking-tighter" style="text-shadow: 1px 1px 0 #000;">UNO</span>
                       </div>
                     </div>
                   </div>
                   
                   <!-- PARCHÍS -->
                   <div v-else-if="game.id === 'parchis'" class="w-24 h-24 bg-[#eab308] border-2 border-white p-1 rounded-sm relative shadow-md">
                     <div class="grid grid-cols-2 grid-rows-2 w-full h-full gap-1">
                       <div class="bg-red-500 rounded-tl-sm"></div>
                       <div class="bg-blue-500 rounded-tr-sm"></div>
                       <div class="bg-green-500 rounded-bl-sm"></div>
                       <div class="bg-yellow-400 rounded-br-sm"></div>
                     </div>
                     <div class="absolute inset-0 m-auto w-6 h-6 bg-white border border-gray-800 rounded-sm shadow-md flex items-center justify-center rotate-3">
                       <div class="w-1.5 h-1.5 bg-black rounded-full"></div>
                     </div>
                   </div>

                   <!-- LIAR'S BAR -->
                   <div v-else-if="game.id === 'liars'" class="flex items-end justify-center w-24 h-24 relative">
                     <div class="w-16 h-20 bg-[#2d1b11] border-2 border-[#1a0f0a] shadow-lg flex items-center justify-center relative z-10" style="clip-path: polygon(15% 0, 85% 0, 100% 100%, 0% 100%)">
                        <UIcon name="i-lucide-skull" class="w-8 h-8 text-gray-400 opacity-60" />
                     </div>
                     <div class="absolute bottom-1 -right-2 w-5 h-5 bg-red-700 border border-red-900 rounded-sm shadow-md flex items-center justify-center rotate-12 z-20">
                       <div class="w-1 h-1 bg-white rounded-full"></div>
                     </div>
                     <div class="absolute bottom-3 -left-3 w-5 h-5 bg-white border border-gray-300 rounded-sm shadow-md flex items-center justify-center -rotate-12 z-20">
                       <div class="grid grid-cols-2 grid-rows-2 gap-[2px]">
                         <div class="w-1 h-1 bg-black rounded-full"></div><div class="w-1 h-1 bg-black rounded-full"></div>
                         <div class="w-1 h-1 bg-black rounded-full"></div><div class="w-1 h-1 bg-black rounded-full"></div>
                       </div>
                     </div>
                   </div>

                   <!-- STOP -->
                   <div v-else-if="game.id === 'stop'" class="w-20 h-24 bg-yellow-300 border border-yellow-500 rounded-sm shadow-md flex flex-col overflow-hidden relative rotate-3">
                     <div class="h-4 w-full bg-red-600 border-b-2 border-red-800 flex justify-evenly items-center">
                        <div class="w-1 h-1 bg-black rounded-full opacity-40" v-for="i in 4" :key="i"></div>
                     </div>
                     <div class="flex-1 w-full" style="background-image: repeating-linear-gradient(transparent, transparent 6px, rgba(0,0,0,0.1) 6px, rgba(0,0,0,0.1) 7px);"></div>
                     <div class="absolute inset-0 flex items-center justify-center pt-2">
                        <span class="text-red-600 font-black text-xl tracking-tight -rotate-12 bg-yellow-300 px-1 border-2 border-red-600 rounded">STOP</span>
                     </div>
                   </div>

                   <!-- PINTURILLO -->
                   <div v-else-if="game.id === 'pinturillo'" class="w-24 h-24 relative flex flex-col items-center justify-end">
                     <div class="w-16 h-14 bg-white border-4 border-[#a37648] rounded-sm shadow-md z-10 flex items-center justify-center relative">
                        <div class="w-6 h-6 rounded-full bg-blue-500 blur-[1px] absolute top-1 left-2"></div>
                        <div class="w-5 h-5 rounded-full bg-red-500 blur-[1px] absolute bottom-1 right-2"></div>
                        <div class="w-4 h-4 rounded-full bg-yellow-400 blur-[1px] absolute top-2 right-4"></div>
                     </div>
                     <div class="w-20 h-2 bg-[#a37648] rounded-sm mt-0 shadow-sm z-10"></div>
                     <div class="absolute bottom-0 w-full h-full flex justify-center z-0">
                       <div class="w-2 h-20 bg-[#6b4726] absolute -rotate-12 origin-top -translate-x-4"></div>
                       <div class="w-2 h-20 bg-[#6b4726] absolute rotate-12 origin-top translate-x-4"></div>
                       <div class="w-2 h-24 bg-[#57391e] absolute"></div>
                     </div>
                   </div>
                   
                   <!-- GENÉRICO -->
                   <div v-else class="w-20 h-20 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center shadow-md">
                     <span class="text-xl font-black text-white opacity-50">{{ game.name.substring(0, 2) }}</span>
                   </div>
                </div>
            </div>

            <!-- Tag En obras -->
            <div v-if="game.disabled" class="absolute -top-4 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow rotate-[15deg] z-40 border border-red-800 uppercase">
              En obras
            </div>
          </button>
       </div>
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
.custom-scrollbar::-webkit-scrollbar { height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
</style>