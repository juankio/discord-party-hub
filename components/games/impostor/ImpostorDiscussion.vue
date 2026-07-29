<script setup lang="ts">
defineProps<{
  timeRemaining: number;
  players: any[];
}>();
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Corkboard/Note Paper aesthetic -->
    <div class="bg-[#f4e4bc] w-full max-w-3xl border-4 border-[#3e2723] border-b-[8px] rounded-sm p-8 shadow-[12px_12px_0_rgba(0,0,0,0.6)] relative overflow-hidden">
      
      <!-- Lined paper background -->
      <div class="absolute inset-0 pointer-events-none" style="background-image: linear-gradient(transparent 95%, #cbd5e1 95%); background-size: 100% 2rem;"></div>

      <div class="relative z-10 flex justify-between items-end border-b-4 border-[#3e2723] pb-4 mb-6">
        <div>
          <h2 class="text-4xl font-black uppercase tracking-tight">Fase de Discusión</h2>
          <p class="font-bold text-gray-600">Interrogue a los sospechosos.</p>
        </div>
        
        <div class="bg-[#e3c18b] border-4 border-[#3e2723] border-b-[6px] px-6 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transform rotate-2">
          <span class="text-sm font-bold uppercase block mb-1">Tiempo Restante</span>
          <span class="text-4xl font-black text-red-700 font-mono">{{ timeRemaining }}s</span>
        </div>
      </div>

      <div class="relative z-10 flex flex-wrap gap-6 justify-center mt-8">
        <div v-for="p in players || []" :key="p.userId || p.id" 
             class="flex flex-col items-center bg-[#fdfbf3] border-2 border-[#3e2723] border-b-4 p-4 shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1 hover:rotate-1"
             :class="{ 'opacity-50 grayscale': !p.isAlive }">
          
          <!-- Polaroid style -->
          <div class="w-24 h-24 border-2 border-[#3e2723] mb-3 flex items-center justify-center text-4xl shadow-inner relative" :style="{ backgroundColor: p.color }">
            🧑‍✈️
            <div v-if="!p.isAlive" class="absolute inset-0 flex items-center justify-center bg-black/60">
              <span class="text-red-500 text-6xl font-black transform -rotate-12">X</span>
            </div>
          </div>
          
          <span class="font-bold text-lg uppercase bg-yellow-200 px-2 transform -rotate-2 border border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
            {{ p.nickname }}
          </span>
          <span v-if="!p.isAlive" class="text-xs font-bold text-red-600 mt-2 uppercase">Eliminado</span>
        </div>
      </div>

    </div>
  </div>
</template>