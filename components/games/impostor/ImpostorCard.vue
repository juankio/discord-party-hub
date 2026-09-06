<script setup lang="ts">
defineProps<{
  word: string;
  isImpostor: boolean;
}>();

defineEmits<{
  (e: 'ready'): void;
}>();
</script>

<template>
  <div class="flex justify-center w-full px-2 sm:px-0">
    <!-- Manilla Folder -->
    <div class="relative w-full max-w-lg bg-[#e3c18b] border-4 border-[#8b6130] border-b-[8px] sm:border-b-[12px] border-r-[6px] sm:border-r-[8px] rounded-sm p-4 sm:p-8 shadow-[8px_8px_0_rgba(0,0,0,0.6)] sm:shadow-[12px_12px_0_rgba(0,0,0,0.6)] transform rotate-1">
      
      <!-- Top Secret Stamp -->
      <div v-if="isImpostor" class="absolute top-3 sm:top-4 right-3 sm:right-4 border-2 sm:border-4 border-red-600 text-red-600 font-black text-xl sm:text-3xl uppercase tracking-widest p-1.5 sm:p-2 transform rotate-12 opacity-80 mix-blend-multiply">
        CONFIDENCIAL
      </div>

      <!-- Paper inside -->
      <div class="bg-[#fdfbf3] border-2 border-[#d3c5a8] p-4 sm:p-6 shadow-inner mt-4 sm:mt-6 min-h-[260px] sm:min-h-[300px] flex flex-col justify-between">
        
        <div class="border-b-2 border-dashed border-[#a6977a] pb-3 sm:pb-4 mb-3 sm:mb-4">
          <h3 class="text-base sm:text-lg font-bold uppercase tracking-wider text-gray-500">Expediente Asignado</h3>
          <p class="text-xs sm:text-sm font-mono text-gray-400">ID: {{ Math.random().toString(36).substr(2, 8).toUpperCase() }}</p>
        </div>

        <div class="flex-grow flex flex-col items-center justify-center min-w-0">
          <p class="text-lg sm:text-xl font-bold mb-2 text-center">
            {{ isImpostor ? 'ATENCIÓN: ERES EL INFILTRADO' : 'PALABRA CLAVE:' }}
          </p>
          <div class="bg-[#3e2723] text-[#f4e4bc] px-4 sm:px-6 py-3 sm:py-4 text-2xl sm:text-3xl font-black uppercase tracking-wider sm:tracking-widest border-b-4 border-black shadow-[4px_4px_0_rgba(0,0,0,0.3)] max-w-full text-center truncate">
            {{ word }}
          </div>
          <p class="mt-4 sm:mt-6 text-center text-xs sm:text-sm font-bold max-w-xs leading-relaxed text-[#5c3a21]">
            {{ isImpostor 
              ? 'Mézclate con los demás. No dejes que descubran que no conoces la palabra real.' 
              : 'Encuentra al impostor antes de que termine el tiempo. No confíes en nadie.' 
            }}
          </p>
        </div>

        <div class="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-dashed border-[#a6977a] flex justify-end">
          <button 
            class="bg-[#8b3a3a] hover:bg-[#a54a4a] text-white font-black uppercase px-6 py-3 border-2 border-[#3e2723] border-b-[6px] active:border-b-2 active:translate-y-[4px] transition-all min-h-[44px]"
            @click="$emit('ready')"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>