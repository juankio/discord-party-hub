<script setup lang="ts">
import { computed } from 'vue';
import { useParchisStore } from '~/stores/games/parchisStore';
import { usePlayerStore } from '~/stores/playerStore';
import { useSocket } from '~/composables/useSocket';

const parchisStore = useParchisStore();
const playerStore = usePlayerStore();
const { socket } = useSocket();

const isMyTurn = computed(() => {
  return playerStore.userId === parchisStore.firstPickerUserId;
});

const pickerPlayer = computed(() => {
  return parchisStore.players.find(p => p.userId === parchisStore.firstPickerUserId);
});

const sides = computed(() => {
  return parchisStore.rules?.parchisBoardSize || 4;
});

const standardColors = ['green', 'yellow', 'blue', 'red', 'purple', 'orange', 'cyan', 'pink'];

const chooseSeat = (colorIndex: number) => {
  if (socket.value && isMyTurn.value) {
    socket.value.emit("parchis:choose_seat", { targetColorIndex: colorIndex });
  }
};

const getColorClass = (colorName: string) => {
  const map: Record<string, string> = {
    'green': 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]',
    'yellow': 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]',
    'blue': 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]',
    'red': 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]',
    'purple': 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]',
    'orange': 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]',
    'cyan': 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]',
    'pink': 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.6)]',
  };
  return map[colorName] || 'bg-gray-500 shadow-lg';
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="relative w-full max-w-3xl bg-gray-900/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center overflow-hidden">
      <!-- Glow -->
      <div class="absolute inset-0 bg-amber-500/5 blur-[100px] pointer-events-none"></div>
      
      <div class="flex flex-col items-center mb-8">
        <UIcon name="i-heroicons-sparkles" class="w-12 h-12 text-amber-400 mb-2 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
        <h2 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 mb-2 text-center drop-shadow-lg">
          SELECCIÓN DE ASIENTO
        </h2>
        
        <p v-if="isMyTurn" class="text-gray-300 text-lg text-center max-w-lg">
          ¡Has ganado la iniciativa! Elige en qué color quieres empezar a jugar.
        </p>
        <p v-else class="text-gray-400 text-lg text-center max-w-lg flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
          <span>Esperando a que <span class="font-bold text-white">{{ pickerPlayer?.nickname }}</span> escoja su asiento...</span>
        </p>
      </div>

      <!-- Color choices -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full mb-4">
        <button 
          v-for="i in sides" 
          :key="i - 1"
          @click="chooseSeat(i - 1)"
          :disabled="!isMyTurn"
          class="relative group aspect-square rounded-3xl border-4 flex flex-col items-center justify-center gap-2 transition-all duration-300"
          :class="[
            isMyTurn ? 'hover:scale-105 cursor-pointer border-transparent hover:border-white' : 'cursor-default border-transparent opacity-70 grayscale-[0.3]',
            'bg-gray-800/50'
          ]"
        >
          <!-- Internal Glow/Color -->
          <div class="absolute inset-2 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity" :class="getColorClass(standardColors[i - 1])"></div>
          
          <div class="relative z-10 font-black text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
            {{ standardColors[i - 1] }}
          </div>
          
          <div v-if="isMyTurn" class="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-colors"></div>
        </button>
      </div>

    </div>
  </div>
</template>