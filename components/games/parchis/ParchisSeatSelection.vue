<script setup lang="ts">
import { computed } from 'vue';
import { useParchisStore } from '~/stores/games/parchisStore';
import { usePlayerStore } from '~/stores/playerStore';

const parchisStore = useParchisStore();
const playerStore = usePlayerStore();

const isMyTurn = computed(() => {
  return playerStore.userId === parchisStore.firstPickerUserId;
});

const pickerPlayer = computed(() => {
  return parchisStore.players.find(p => p.userId === parchisStore.firstPickerUserId);
});
</script>

<template>
  <div class="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-lg px-4">
    <div class="relative bg-[#2c1810]/95 backdrop-blur-xl border-t-[3px] border-b-[4px] border-l-[2px] border-r-[2px] border-[#6b4226] rounded-2xl py-3 px-6 shadow-[0_15px_50px_rgba(0,0,0,0.9)] flex flex-col items-center overflow-hidden ring-[1px] ring-black/50">
      
      <!-- Wood grain effect / Glow -->
      <div class="absolute inset-0 bg-amber-500/10 blur-[30px] pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-50"></div>
      
      <div class="flex flex-col items-center relative z-10 w-full">
        <div class="flex items-center justify-center gap-2 mb-1.5">
          <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <h2 class="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-orange-400 tracking-widest text-center drop-shadow-[0_2px_2px_rgba(0,0,0,1)] uppercase">
            Selección de Asiento
          </h2>
          <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
        </div>
        
        <div class="h-[1px] w-full max-w-[200px] bg-gradient-to-r from-transparent via-amber-700/80 to-transparent mb-2"></div>
        
        <p v-if="isMyTurn" class="text-green-300 text-sm md:text-base font-bold text-center tracking-wide flex items-center gap-2 drop-shadow-md">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          ¡Es tu turno! Elige un nido libre para sentarte.
        </p>
        <div v-else class="flex flex-col items-center">
          <p class="text-amber-100/70 text-sm md:text-base font-medium text-center flex items-center justify-center gap-2">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-amber-500" />
            <span>Esperando a que <span class="font-black text-amber-400 drop-shadow-sm">{{ pickerPlayer?.nickname }}</span> elija su nido...</span>
          </p>
          <p class="text-white/40 text-xs mt-1">Faltan {{ parchisStore.pickersQueue?.length || 0 }} jugadores por elegir.</p>
        </div>
      </div>

    </div>
  </div>
</template>