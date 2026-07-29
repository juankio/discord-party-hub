<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  gameState: any;
}>();

const emit = defineEmits<{
  (e: 'ready'): void;
}>();

const latestResult = computed(() => {
  if (!props.gameState?.roundResults || props.gameState.roundResults.length === 0) return null;
  return props.gameState.roundResults[props.gameState.roundResults.length - 1];
});

const isFinished = computed(() => props.gameState?.state === 'FINISHED');
</script>

<template>
  <div class="flex justify-center">
    <!-- Typewritten Telegram / Newspaper -->
    <div class="w-full max-w-3xl bg-[#dcd3b6] border-2 border-gray-400 p-2 shadow-[8px_8px_0_rgba(0,0,0,0.6)] transform rotate-1">
      <div class="border-2 border-double border-gray-600 p-8 min-h-[400px] flex flex-col items-center text-center relative">
        
        <!-- Paper texture overlay -->
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 4px 4px;"></div>

        <div class="border-b-2 border-gray-500 pb-2 mb-6 w-full relative z-10">
          <h1 class="text-4xl font-serif font-black uppercase tracking-widest text-[#2a1a17]">
            {{ isFinished ? 'CASO CERRADO' : 'REPORTE DEL DÍA' }}
          </h1>
          <p class="font-mono text-xs uppercase mt-2">Agencia de Inteligencia - Dept. {{ gameState.currentRound }}</p>
        </div>

        <div class="flex-grow flex flex-col justify-center items-center w-full max-w-lg relative z-10">
          <div v-if="isFinished">
            <h2 class="text-2xl font-bold uppercase mb-4">
              <span v-if="gameState.winner === 'impostor'" class="bg-red-600 text-white px-4 py-2 border-2 border-black inline-block transform -rotate-2 shadow-[4px_4px_0_rgba(0,0,0,1)]">EL IMPOSTOR HA ESCAPADO</span>
              <span v-else class="bg-green-700 text-white px-4 py-2 border-2 border-black inline-block transform rotate-2 shadow-[4px_4px_0_rgba(0,0,0,1)]">EL IMPOSTOR FUE CAPTURADO</span>
            </h2>
            
            <p class="text-xl font-serif mt-6">
              El infiltrado era: 
              <strong class="font-black border-b-4 border-red-600 inline-block px-2 transform rotate-1 bg-yellow-200">
                {{ gameState?.players?.find((p: any) => p.userId === gameState.impostorUserId || p.id === gameState.impostorUserId)?.nickname || 'Desconocido' }}
              </strong>
            </p>
          </div>

          <div v-else-if="latestResult">
            <p class="text-xl font-serif mb-6 leading-relaxed">
              Tras una intensa deliberación, el equipo ha decidido eliminar a:
            </p>
            <div v-if="latestResult.eliminatedUserId" class="inline-block bg-[#fdfbf3] border-4 border-black border-b-[8px] px-8 py-4 mb-6 transform -rotate-1">
              <span class="text-4xl font-black uppercase tracking-widest">
                {{ gameState?.players?.find((p: any) => p.userId === latestResult.eliminatedUserId || p.id === latestResult.eliminatedUserId)?.nickname || 'Desconocido' }}
              </span>
            </div>
            <div v-else class="inline-block bg-[#fdfbf3] border-4 border-black border-b-[8px] px-8 py-4 mb-6 transform rotate-1">
              <span class="text-2xl font-black uppercase tracking-widest text-gray-500">
                NADIE FUE ELIMINADO
              </span>
            </div>
            
            <div v-if="latestResult.eliminatedUserId" class="mt-4">
              <span class="font-black text-3xl px-4 py-2 border-4"
                    :class="latestResult.wasImpostor ? 'border-green-600 text-green-700 transform rotate-3 inline-block shadow-[4px_4px_0_rgba(0,0,0,0.5)] bg-green-100' : 'border-red-600 text-red-700 transform -rotate-2 inline-block shadow-[4px_4px_0_rgba(0,0,0,0.5)] bg-red-100'">
                {{ latestResult.wasImpostor ? 'ERA EL IMPOSTOR' : 'NO ERA EL IMPOSTOR' }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t-2 border-gray-500 w-full flex justify-center relative z-10">
          <button 
            @click="emit('ready')"
            class="bg-[#2a1a17] text-[#dcd3b6] font-mono font-bold uppercase px-8 py-3 border-2 border-black border-b-[6px] active:border-b-2 active:translate-y-[4px] hover:bg-[#3e2723] transition-all"
          >
            {{ isFinished ? 'Volver al Inicio' : 'Siguiente Fase' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>