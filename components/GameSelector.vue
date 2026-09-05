<template>
  <div class="w-full max-w-2xl mx-auto border-[6px] sm:border-[10px] border-[#a06d40] bg-[#4a2e1b] rounded-xl sm:rounded-2xl shadow-xl overflow-x-auto flex flex-col shadow-inner custom-scrollbar relative z-10">
    <div class="min-w-[320px] flex flex-col">
      <div
        v-for="(row, idx) in [games.slice(0,3), games.slice(3,6)]" 
        :key="idx" 
        class="relative w-full flex justify-center gap-3 sm:gap-6 items-end pb-3 sm:pb-4 pt-10 sm:pt-14 bg-[#382012]"
      >
        <!-- Soga -->
        <div class="absolute left-0 right-0 h-2 sm:h-2.5 z-[25] pointer-events-none bottom-[26px] sm:bottom-[30px]">
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <pattern id="rope" width="12" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
              <rect width="12" height="10" fill="#a47c50" />
              <line x1="6" y1="0" x2="6" y2="10" stroke="#715233" stroke-width="3" />
              <line x1="8" y1="0" x2="8" y2="10" stroke="#cdab84" stroke-width="1.5" />
            </pattern>
            <rect width="100%" height="10" fill="url(#rope)" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.6))" />
          </svg>
        </div>
        
        <!-- Repisa -->
        <div class="absolute bottom-0 left-0 w-full h-3 sm:h-3.5 bg-[#a06d40] border-b-[4px] sm:border-b-[5px] border-[#7d512a] z-0 shadow-md"/>

        <!-- Items -->
        <button
          v-for="game in row"
          :key="game.id"
          class="relative group outline-none focus:outline-none transition-none duration-0 shrink-0 w-[65px] sm:w-[85px] h-[85px] sm:h-[105px] flex flex-col justify-end"
          :class="[
            game.disabled ? 'opacity-60 grayscale cursor-not-allowed' : (isReadOnly ? 'cursor-default' : 'cursor-pointer hover:z-[30]'),
            selectedGame === game.id ? 'z-[30]' : 'z-10'
          ]"
          :disabled="game.disabled || isReadOnly"
          @click="selectGame(game.id)"
        >
          <div
            class="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 bg-black/80 rounded-[50%] transition-all duration-300 pointer-events-none z-0"
            :class="selectedGame === game.id ? 'w-14 sm:w-16 opacity-30' : 'w-10 sm:w-12 opacity-80 group-hover:w-14 group-hover:opacity-50'"
          />

          <div
            class="relative w-full flex flex-col items-center justify-end transition-all duration-300 ease-out z-30"
            :class="[
              game.disabled || isReadOnly ? '' : 'group-hover:-translate-y-2 sm:group-hover:-translate-y-3',
              selectedGame === game.id ? '-translate-y-3 sm:-translate-y-4 scale-105 drop-shadow-[3px_3px_0_rgba(0,0,0,0.7)]' : 'drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]'
            ]"
          >
            <div
              class="absolute -top-5 sm:-top-6 text-white font-bold text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider whitespace-nowrap opacity-60 transition-opacity"
              :class="{'opacity-100 text-yellow-400 drop-shadow-md font-black': selectedGame === game.id}"
            >
              {{ game.name }}
            </div>

            <div v-if="selectedGame === game.id" class="absolute -top-9 sm:-top-11 left-1/2 -translate-x-1/2 animate-bounce z-40 text-yellow-400 drop-shadow-md">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-7-7h14l-7 7z" /></svg>
            </div>

            <div class="relative z-10 w-full flex items-end justify-center origin-bottom scale-[0.72] sm:scale-[0.85] group-hover:drop-shadow-[2px_2px_0_var(--theme-color)] transition-all duration-300" :style="{ '--theme-color': playerStore.color }">
              <IconGameUno v-if="game.id === 'uno'" />
              <IconGameParchis v-else-if="game.id === 'parchis'" />
              <IconGameLiars v-else-if="game.id === 'liars'" />
              <IconGameStop v-else-if="game.id === 'stop'" />
              <IconGamePinturillo v-else-if="game.id === 'pinturillo'" />
              <IconGameImpostor v-else-if="game.id === 'impostor'" />
              <div v-else class="w-12 h-12 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center shadow-md">
                <span class="text-base font-black text-white opacity-50">{{ game.name.substring(0, 2) }}</span>
              </div>
            </div>
          </div>

          <!-- Tag En obras -->
          <div v-if="game.disabled" class="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[7px] sm:text-[8px] font-bold px-1 rounded shadow rotate-[15deg] z-40 border border-red-800 uppercase">
            En obras
          </div>

          <!-- Tooltip de Información -->
          <div v-if="!game.disabled" class="absolute -top-20 sm:-top-24 left-1/2 -translate-x-1/2 w-36 sm:w-44 bg-[#3a2212] border-2 border-[#7d512a] p-1.5 sm:p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 flex flex-col gap-0.5 sm:gap-1 shadow-[0_4px_0_rgba(0,0,0,0.5)] translate-y-2 group-hover:translate-y-0">
            <div class="flex justify-between items-center border-b border-[#7d512a] pb-0.5">
              <span class="font-bold text-[10px] sm:text-[11px]">{{ game.name }}</span>
              <UIcon v-if="game.botSupport" name="i-lucide-bot" class="w-3.5 h-3.5 text-green-400" title="Soporta Bots" />
              <UIcon v-else name="i-lucide-bot-off" class="w-3.5 h-3.5 text-gray-500" title="Sin Bots" />
            </div>
            <p class="text-[9px] sm:text-[10px] text-gray-300 leading-tight text-left whitespace-normal break-words">{{ game.description }}</p>
            <div class="text-[9px] sm:text-[10px] text-yellow-500 font-semibold text-left">{{ game.playersText }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppAudio } from '~/composables/useAppAudio';
import { usePlayerStore } from '~/stores/playerStore';

const playerStore = usePlayerStore();
const { 
  playSelectUno, stopSelectUno, 
  playSelectParchis, stopSelectParchis, 
  playSelectStop, stopSelectStop, 
  playSelectImpostor, stopSelectImpostor,
  playSelectLiars, stopSelectLiars,
  playSelectPinturillo, stopSelectPinturillo,
  playUiClick 
} = useAppAudio();

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
    stopSelectImpostor();
    stopSelectLiars();
    stopSelectPinturillo();

    if (gameId === 'uno') {
      playSelectUno();
    } else if (gameId === 'parchis') {
      playSelectParchis();
    } else if (gameId === 'stop') {
      playSelectStop();
    } else if (gameId === 'impostor') {
      playSelectImpostor();
    } else if (gameId === 'liars') {
      playSelectLiars();
    } else if (gameId === 'pinturillo') {
      playSelectPinturillo();
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