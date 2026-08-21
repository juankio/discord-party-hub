<template>
  <div class="flex-1 flex flex-col items-center justify-center z-10 relative pointer-events-none">
    
    <!-- WAITING -->
    <div v-if="gameState === 'WAITING'" class="bg-[#25160d]/90 text-amber-100 px-8 py-6 rounded-lg border-2 border-[#4a2e19] shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-center backdrop-blur-md">
      <h2 class="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2 text-[#d8a872] drop-shadow-md">Esperando Jugadores</h2>
      <p class="text-amber-100/60 uppercase text-sm tracking-widest font-bold">La partida comenzará pronto</p>
    </div>

    <!-- ROLLING -->
    <div v-else-if="gameState === 'ROLLING'" class="text-center animate-pulse drop-shadow-[0_5px_15px_rgba(0,0,0,1)]">
      <h2 class="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#d8a872]">Mezclando...</h2>
    </div>

    <!-- BETTING -->
    <div v-else-if="gameState === 'BETTING'" class="text-center">
      <div v-if="currentBet" class="bg-[#25160d]/95 p-6 md:p-8 rounded-xl border-4 border-[#4a2e19] shadow-[0_15px_50px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.5)] transform md:scale-110">
        <p class="text-[#d8a872]/80 uppercase text-xs md:text-sm tracking-widest mb-3 font-bold border-b border-[#d8a872]/20 pb-2">
          Apuesta Actual ({{ betPlayerName }})
        </p>
        <div class="flex items-center justify-center gap-4 md:gap-6">
           <span class="text-5xl md:text-6xl font-black text-amber-50 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">{{ currentBet.amount }}</span>
           <span class="text-3xl font-bold text-[#d8a872]">X</span>
           <!-- Simple dice representation -->
           <div class="w-14 h-14 md:w-16 md:h-16 bg-[#e8e4d9] rounded shadow-[2px_5px_0px_#8a7f6c,inset_-2px_-3px_5px_rgba(0,0,0,0.3)] flex items-center justify-center border border-[#d3cebe]">
             <span class="text-3xl md:text-4xl font-black text-[#2c2620] drop-shadow-sm">{{ currentBet.face }}</span>
           </div>
        </div>
      </div>
      <div v-else class="text-center text-amber-100/50 uppercase tracking-widest font-bold bg-black/40 border border-white/5 px-8 py-3 rounded-full shadow-inner">
        Primera Apuesta
      </div>
    </div>

    <!-- RESOLUTION -->
    <div v-else-if="gameState === 'RESOLUTION'" class="bg-[#8b2323]/95 text-red-50 p-6 md:p-10 rounded-xl border-4 border-[#4a1212] shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(0,0,0,0.5)] text-center animate-in zoom-in duration-300">
      <h2 class="text-3xl md:text-6xl font-black uppercase tracking-widest mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)] text-red-100">¡RESULTADO!</h2>
      
      <div class="bg-black/30 rounded p-4 mb-4 border border-red-950 shadow-inner">
        <p class="text-xl md:text-3xl font-bold text-red-200 uppercase tracking-wide">
          Había <span class="text-white text-3xl md:text-4xl mx-1 font-black">{{ totalDiceFaceCount }}</span> dados con cara 
          <span class="inline-block bg-[#e8e4d9] text-[#2c2620] px-2 py-0.5 rounded shadow-sm mx-1 text-2xl font-black">{{ currentBet?.face }}</span>
        </p>
        <p class="text-sm mt-2 text-red-200/70 font-bold tracking-widest uppercase">
          (Contando comodines "1")
        </p>
      </div>

      <p class="text-xl md:text-2xl font-black text-white bg-red-950/50 inline-block px-6 py-2 rounded-full border border-red-900 shadow-md">
        {{ loserName }} pierde un dado
      </p>
    </div>
    
    <!-- FINISHED -->
    <div v-else-if="gameState === 'FINISHED'" class="bg-[#d8a872] text-[#25160d] p-8 md:p-12 rounded-xl border-8 border-[#25160d] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-[#e3ba8f] transform -skew-y-12 translate-y-1/2 opacity-20"></div>
      <h2 class="text-4xl md:text-5xl font-black uppercase tracking-widest mb-4 relative z-10 drop-shadow-md">Fin de Partida</h2>
      <p class="text-2xl md:text-3xl font-bold relative z-10">¡<span class="text-[#8b2323] font-black">{{ winnerName }}</span> sobrevive!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiarsState, Bet } from './LiarsBoard.vue';

defineProps<{
  gameState?: LiarsState;
  currentBet?: Bet | null;
  betPlayerName?: string;
  totalDiceFaceCount?: number;
  loserName?: string;
  winnerName?: string;
}>();
</script>
