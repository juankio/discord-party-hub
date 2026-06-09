<template>
  <div class="w-full max-w-3xl mx-auto border-[8px] sm:border-[16px] border-[#a06d40] bg-[#4a2e1b] rounded-2xl shadow-xl overflow-x-auto flex flex-col shadow-inner custom-scrollbar relative z-10">
    <div class="min-w-[340px] flex flex-col">
      <div
  v-for="(row, idx) in [games.slice(0,3), games.slice(3,5)]" :key="idx" 
           class="relative w-full flex justify-center gap-4 sm:gap-8 items-end pb-[24px] pt-12 sm:pt-16 bg-[#382012]">
        
        <!-- Soga -->
        <div class="absolute left-0 right-0 h-[10px] z-[25] pointer-events-none" style="bottom: 50px;">
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <pattern id="rope" width="12" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
              <rect width="12" height="10" fill="#a47c50" />
              <line x1="6" y1="0" x2="6" y2="10" stroke="#715233" stroke-width="3" />
              <line x1="8" y1="0" x2="8" y2="10" stroke="#cdab84" stroke-width="1.5" />
            </pattern>
            <rect width="100%" height="10" fill="url(#rope)" filter="drop-shadow(0px 3px 2px rgba(0,0,0,0.6))" />
          </svg>
        </div>
        
        <!-- Repisa -->
        <div class="absolute bottom-0 left-0 w-full h-[24px] bg-[#a06d40] border-b-[8px] border-[#7d512a] z-0 shadow-lg"/>

        <!-- Items -->
        <button
          v-for="game in row"
          :key="game.id"
          class="relative group outline-none focus:outline-none transition-none duration-0 shrink-0 w-[80px] sm:w-[120px] h-[120px] sm:h-[140px] flex flex-col justify-end"
        :class="[
          game.disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:z-[30]',
          selectedGame === game.id ? 'z-[30]' : 'z-10'
        ]"
        :disabled="game.disabled"
        @click="$emit('select', game.id)"
      >
        <div
class="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 bg-black/80 blur-[3px] rounded-[50%] transition-all duration-300 pointer-events-none z-0"
             :class="selectedGame === game.id ? 'w-24 opacity-30' : 'w-16 opacity-80 group-hover:w-20 group-hover:opacity-50'"/>

        <div
class="relative w-full flex flex-col items-center justify-end transition-transform duration-300 ease-out z-30"
             :class="[
               game.disabled ? '' : 'group-hover:-translate-y-4',
               selectedGame === game.id ? '-translate-y-6 scale-110 drop-shadow-[0_25px_25px_rgba(0,0,0,0.7)]' : 'drop-shadow-lg'
             ]">
            
            <div
class="absolute -top-6 text-white font-bold text-[10px] uppercase tracking-widest whitespace-nowrap opacity-60 transition-opacity"
                 :class="{'opacity-100 text-yellow-400 drop-shadow-md': selectedGame === game.id}">
              {{ game.name }}
            </div>

            <div v-if="selectedGame === game.id" class="absolute -top-14 left-1/2 -translate-x-1/2 animate-bounce z-40 text-white drop-shadow-md">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-7-7h14l-7 7z" /></svg>
            </div>

            <div
class="absolute inset-0 rounded-full blur-2xl opacity-0 transition-opacity duration-300 z-0 pointer-events-none"
                 :style="{ backgroundColor: game.color || '#ffffff' }"
                 :class="{ 'opacity-30': selectedGame === game.id }"/>
            
            <div class="relative z-10 w-full flex items-end justify-center">
               <!-- UNO -->
               <div v-if="game.id === 'uno'" class="relative w-16 h-24 flex items-center justify-center">
                 <div class="absolute w-16 h-24 bg-gray-900 border-2 border-white rounded-sm rotate-12 shadow-md"/>
                 <div class="absolute w-16 h-24 bg-red-600 border-2 border-white rounded-sm -rotate-6 shadow-lg flex items-center justify-center overflow-hidden">
                   <div class="w-[110%] h-[60%] bg-white rounded-[50%] -rotate-[25deg] flex items-center justify-center">
                     <span class="text-red-600 font-black text-xl tracking-tighter" style="text-shadow: 1px 1px 0 #000;">UNO</span>
                   </div>
                 </div>
               </div>
               
               <!-- PARCHÍS -->
               <div v-else-if="game.id === 'parchis'" class="w-20 h-20 bg-[#eab308] border-2 border-white p-1 rounded-sm relative shadow-md">
                 <div class="grid grid-cols-2 grid-rows-2 w-full h-full gap-1">
                   <div class="bg-red-500 rounded-tl-sm"/>
                   <div class="bg-blue-500 rounded-tr-sm"/>
                   <div class="bg-green-500 rounded-bl-sm"/>
                   <div class="bg-yellow-400 rounded-br-sm"/>
                 </div>
                 <div class="absolute inset-0 m-auto w-5 h-5 bg-white border border-gray-800 rounded-sm shadow-md flex items-center justify-center rotate-3">
                   <div class="w-1.5 h-1.5 bg-black rounded-full"/>
                 </div>
               </div>

               <!-- LIAR'S BAR -->
               <div v-else-if="game.id === 'liars'" class="flex items-end justify-center w-20 h-20 relative">
                 <div class="w-14 h-16 bg-[#2d1b11] border-2 border-[#1a0f0a] shadow-lg flex items-center justify-center relative z-10" style="clip-path: polygon(15% 0, 85% 0, 100% 100%, 0% 100%)">
                    <UIcon name="i-lucide-skull" class="w-6 h-6 text-gray-400 opacity-60" />
                 </div>
                 <div class="absolute bottom-1 -right-1 w-4 h-4 bg-red-700 border border-red-900 rounded-sm shadow-md flex items-center justify-center rotate-12 z-20">
                   <div class="w-1 h-1 bg-white rounded-full"/>
                 </div>
                 <div class="absolute bottom-2 -left-2 w-4 h-4 bg-white border border-gray-300 rounded-sm shadow-md flex items-center justify-center -rotate-12 z-20">
                   <div class="grid grid-cols-2 grid-rows-2 gap-[2px]">
                     <div class="w-0.5 h-0.5 bg-black rounded-full"/><div class="w-0.5 h-0.5 bg-black rounded-full"/>
                     <div class="w-0.5 h-0.5 bg-black rounded-full"/><div class="w-0.5 h-0.5 bg-black rounded-full"/>
                   </div>
                 </div>
               </div>

               <!-- STOP -->
               <div v-else-if="game.id === 'stop'" class="w-16 h-20 bg-yellow-300 border border-yellow-500 rounded-sm shadow-md flex flex-col overflow-hidden relative rotate-3">
                 <div class="h-3 w-full bg-red-600 border-b border-red-800 flex justify-evenly items-center">
                    <div v-for="i in 3" :key="i" class="w-1 h-1 bg-black rounded-full opacity-40"/>
                 </div>
                 <div class="flex-1 w-full" style="background-image: repeating-linear-gradient(transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 6px);"/>
                 <div class="absolute inset-0 flex items-center justify-center pt-2">
                    <span class="text-red-600 font-black text-sm tracking-tight -rotate-12 bg-yellow-300 px-1 border-2 border-red-600 rounded">STOP</span>
                 </div>
               </div>

               <!-- PINTURILLO -->
               <div v-else-if="game.id === 'pinturillo'" class="w-20 h-20 relative flex flex-col items-center justify-end">
                 <div class="w-14 h-12 bg-white border-[3px] border-[#a37648] rounded-sm shadow-md z-10 flex items-center justify-center relative">
                    <div class="w-4 h-4 rounded-full bg-blue-500 blur-[1px] absolute top-1 left-1"/>
                    <div class="w-4 h-4 rounded-full bg-red-500 blur-[1px] absolute bottom-1 right-1"/>
                 </div>
                 <div class="w-16 h-1.5 bg-[#a37648] rounded-sm mt-0 shadow-sm z-10"/>
                 <div class="absolute bottom-0 w-full h-full flex justify-center z-0">
                   <div class="w-1.5 h-16 bg-[#6b4726] absolute -rotate-12 origin-top -translate-x-3"/>
                   <div class="w-1.5 h-16 bg-[#6b4726] absolute rotate-12 origin-top translate-x-3"/>
                   <div class="w-1.5 h-20 bg-[#57391e] absolute"/>
                 </div>
               </div>
               
               <!-- GENÉRICO -->
               <div v-else class="w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center shadow-md">
                 <span class="text-lg font-black text-white opacity-50">{{ game.name.substring(0, 2) }}</span>
               </div>
            </div>
        </div>

        <!-- Tag En obras -->
        <div v-if="game.disabled" class="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold px-1 rounded shadow rotate-[15deg] z-40 border border-red-800 uppercase">
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
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #382012;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #7d512a;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a06d40;
}
</style>