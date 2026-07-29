<template>
  <div class="flex flex-col items-center w-full max-w-3xl relative">
    <div :class="{ 'pointer-events-none opacity-80': !isHost }" class="w-full flex flex-col items-center">
      <h3 class="text-white/30 mb-2 lg:mb-4 font-black uppercase tracking-[0.4em] text-xs">Selector de Juegos</h3>
      
      <!-- Estante de Billar -->
      <div class="relative w-full bg-[#8b5a2b] rounded-2xl border-4 border-[#5c3a21] py-4 px-2 sm:px-4 shadow-xl z-20 flex flex-col justify-center">
        <div class="absolute inset-2 bg-[#2a1a0f] rounded-xl shadow-inner"/>
        <GameSelector :games="games" :selected-game="selectedGame" @select="$emit('update:selectedGame', $event)" />
      </div>

      <div class="flex flex-row justify-center items-start -mt-2 relative z-10 mx-auto w-full max-w-lg px-8 sm:px-12">
        <button 
          @click="$emit('toggle-general')"
          class="flex-1 w-full bg-[#6d4621] hover:bg-[#7d512a] text-[#f4d0a4] font-black text-[9px] sm:text-[10px] md:text-xs tracking-wider sm:tracking-[0.1em] uppercase py-2 sm:py-3 px-2 sm:px-3 rounded-bl-lg sm:rounded-bl-xl border-l-2 border-b-2 border-r-[1px] sm:border-l-4 sm:border-b-4 sm:border-r-2 border-t-0 border-[#5c3a21] transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer relative shadow-lg"
        >
          <span class="mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">⚙️ AJUSTES GENERALES</span>
          <UIcon :name="isGeneralRulesOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-3 h-3 sm:w-4 sm:h-4 text-[#e6a15c] shrink-0" />
        </button>

        <button 
          @click="$emit('toggle-table')"
          class="flex-1 w-full bg-[#6d4621] hover:bg-[#7d512a] text-[#f4d0a4] font-black text-[9px] sm:text-[10px] md:text-xs tracking-wider sm:tracking-[0.1em] uppercase py-2 sm:py-3 px-2 sm:px-3 rounded-br-lg sm:rounded-br-xl border-r-2 border-b-2 border-l-[1px] sm:border-r-4 sm:border-b-4 sm:border-l-2 border-t-0 border-[#5c3a21] transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer relative shadow-lg"
        >
          <span class="mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">⚙️ REGLAS DE LA MESA</span>
          <UIcon :name="isTableRulesOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-3 h-3 sm:w-4 sm:h-4 text-[#e6a15c] shrink-0" />
        </button>
      </div>
      
      <!-- Panel de Reglas Inyectado -->
      <slot name="rules" />
    </div>
    
    <!-- Botón Arcade 2D Macizo -->
    <button 
      v-if="isHost"
      class="mt-12 w-[280px] h-[60px] rounded-2xl text-lg font-black uppercase tracking-widest transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative border-t-2 border-white/20"
      :disabled="isStarting || playersCount < 2 || !['uno', 'stop', 'parchis', 'liars', 'pinturillo', 'impostor'].includes(selectedGame) || isMissingStopCategories"
      style="
        background-color: var(--theme-color); 
        color: var(--theme-text-color, white);
        box-shadow: 0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4);
      "
      onmousedown="if(!this.disabled) { this.style.transform='translateY(8px)'; this.style.boxShadow='0 0px 0 rgba(0,0,0,0.6), 0 5px 10px rgba(0,0,0,0.4)'; }"
      onmouseup="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4)'; }"
      onmouseleave="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4)'; }"
      @click="$emit('start-game')"
    >
      <template v-if="isStarting">
        <UIcon name="i-lucide-loader-2" class="animate-spin w-5 h-5" />
        Iniciando...
      </template>
      <template v-else>
        Empezar Partida
      </template>
    </button>
    
    <button 
      v-else
      class="mt-12 w-[280px] h-[60px] rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-100 opacity-60 cursor-not-allowed flex items-center justify-center gap-3 relative border-t-2 border-white/10 bg-gray-800 text-gray-300 shadow-[0_4px_0_rgba(0,0,0,0.6),_0_8px_10px_rgba(0,0,0,0.4)]"
      disabled
    >
      <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
      Esperando al Host...
    </button>
    
    <p v-if="playersCount < 2" class="text-xs text-gray-500 mt-6 font-bold tracking-[0.2em] uppercase">Esperando más jugadores...</p>
    <p v-else-if="!['uno', 'stop', 'parchis', 'liars', 'pinturillo', 'impostor'].includes(selectedGame)" class="text-xs text-red-500/80 mt-6 font-bold tracking-[0.2em] uppercase">Juego no disponible aún</p>
    <p v-else-if="isMissingStopCategories" class="text-xs text-red-500/80 mt-6 font-bold tracking-[0.2em] uppercase">Faltan categorías para Stop</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isHost: boolean;
  isStarting: boolean;
  playersCount: number;
  selectedGame: string;
  roomRules: any;
  games: any[];
  isGeneralRulesOpen: boolean;
  isTableRulesOpen: boolean;
}>();

defineEmits(['update:selectedGame', 'toggle-general', 'toggle-table', 'start-game']);

const isMissingStopCategories = computed(() => {
  return props.selectedGame === 'stop' && (!props.roomRules?.stopCategories || props.roomRules.stopCategories.length < 3);
});
</script>
