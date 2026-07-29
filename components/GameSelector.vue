<template>
  <div class="w-full max-w-3xl mx-auto border-[8px] sm:border-[16px] border-[#a06d40] bg-[#4a2e1b] rounded-2xl shadow-xl overflow-x-auto flex flex-col shadow-inner custom-scrollbar relative z-10">
    <div class="min-w-[340px] flex flex-col">
      <div
  v-for="(row, idx) in [games.slice(0,3), games.slice(3,6)]" :key="idx" 
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
          game.disabled ? 'opacity-60 grayscale cursor-not-allowed' : (isReadOnly ? 'cursor-default' : 'cursor-pointer hover:z-[30]'),
          selectedGame === game.id ? 'z-[30]' : 'z-10'
        ]"
        :disabled="game.disabled || isReadOnly"
        @click="selectGame(game.id)"
      >
        <div
class="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 bg-black/80 blur-[3px] rounded-[50%] transition-all duration-300 pointer-events-none z-0"
             :class="selectedGame === game.id ? 'w-24 opacity-30' : 'w-16 opacity-80 group-hover:w-20 group-hover:opacity-50'"/>

        <div
class="relative w-full flex flex-col items-center justify-end transition-transform duration-300 ease-out z-30"
             :class="[
               game.disabled || isReadOnly ? '' : 'group-hover:-translate-y-4',
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
               <IconGameUno v-if="game.id === 'uno'" />
               <IconGameParchis v-else-if="game.id === 'parchis'" />
               <IconGameLiars v-else-if="game.id === 'liars'" />
               <IconGameStop v-else-if="game.id === 'stop'" />
               <IconGamePinturillo v-else-if="game.id === 'pinturillo'" />
               <IconGameImpostor v-else-if="game.id === 'impostor'" />

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
import { useAppAudio } from '~/composables/useAppAudio';

const { playSelectUno, stopSelectUno, playSelectParchis, stopSelectParchis, playSelectStop, stopSelectStop, playUiClick } = useAppAudio();

const props = defineProps({
  games: { type: Array as () => any[], required: true },
  selectedGame: { type: String, required: true },
  isReadOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

const selectGame = (gameId: string) => {
  if (!props.isReadOnly) {
    stopSelectUno();
    stopSelectParchis();
    stopSelectStop();

    if (gameId === 'uno') {
      playSelectUno();
    } else if (gameId === 'parchis') {
      playSelectParchis();
    } else if (gameId === 'stop') {
      playSelectStop();
    } else {
      playUiClick();
    }
  }
  emit('select', gameId);
}
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