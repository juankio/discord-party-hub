<template>
  <!-- Player HUD (Fijo abajo en mobile, Panel Izquierdo en Desktop) -->
  <div class="w-full sm:max-w-[800px] xl:max-w-[280px] shrink-0 z-50 pointer-events-auto px-2 sm:px-4 fixed bottom-4 left-0 right-0 mx-auto xl:absolute xl:bottom-auto xl:left-4 xl:top-1/2 xl:-translate-y-1/2 xl:right-auto">
    <div class="flex flex-col sm:flex-row xl:flex-col items-center justify-between xl:justify-center gap-3 sm:gap-4 xl:gap-8 bg-[#1a0f08]/95 backdrop-blur-2xl px-4 py-3 sm:px-6 sm:py-4 xl:py-8 rounded-[1.5rem] border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative overflow-hidden ring-1 ring-white/5">
      
      <!-- Glow ambiental -->
      <div class="absolute -top-10 -left-10 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full pointer-events-none"></div>
      <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>

      <!-- Avatares de Jugadores -->
      <div class="flex items-center gap-1 sm:gap-3 relative z-10 w-full sm:w-auto xl:w-full justify-center flex-wrap xl:grid xl:grid-cols-4 xl:gap-3">
        <div 
          v-for="(player, idx) in parchisStore.players" 
          :key="player.userId"
          :class="['w-8 h-8 sm:w-12 sm:h-12 shrink-0 rounded-full border-[2px] shadow-inner bg-cover bg-center transition-all duration-300 relative mx-auto', 
            idx === parchisStore.currentTurnIndex ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10' : 'border-white/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
          ]"
          :style="{ backgroundColor: getColor(player.color), backgroundImage: player.avatar ? `url(/avatars/avatar-${player.avatar}.svg)` : 'none' }"
        >
          <!-- Turn Indicator Dot -->
          <div v-if="idx === parchisStore.currentTurnIndex" class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-[#1a0f08] shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse"></div>
        </div>
      </div>
      
      <!-- Separator Desktop/Tablet -->
      <div class="hidden sm:block xl:hidden h-10 w-[1px] bg-white/10 relative z-10"></div>
      <div class="hidden xl:block w-full h-[1px] bg-white/10 relative z-10"></div>
      
      <!-- Mobile Bottom Row / Desktop Vertical Stack: Dice + Button -->
      <div class="flex w-full sm:w-auto xl:w-full flex-row sm:flex-row xl:flex-col items-center justify-between sm:justify-center xl:justify-center gap-3 sm:gap-4 xl:gap-6">
        
        <!-- Indicator: Tu Color -->
        <div v-if="myPlayer" class="hidden xl:flex items-center gap-2 relative z-10 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 w-full justify-center">
          <span class="text-xs font-bold text-white/50 tracking-wider">TU COLOR</span>
          <div class="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" :style="{ backgroundColor: getColor(myPlayer.color), color: getColor(myPlayer.color) }"></div>
          <span class="text-xs font-black uppercase" :style="{ color: getColor(myPlayer.color) }">{{ colorNameEs(myPlayer.color) }}</span>
        </div>

        <!-- Zona Central: Dados y Move Text -->
        <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 relative z-10 min-h-[50px] flex-1 sm:flex-none xl:w-full">
          <ParchisDice :diceValues="parchisStore.diceValue.length ? parchisStore.diceValue : []" />
          
          <div class="h-[20px] sm:h-[24px] flex items-center justify-center"> <!-- Espacio fijo UI -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div v-if="parchisStore.availableMoves.length > 0 && parchisStore.isMyTurn" class="text-[9px] sm:text-xs font-bold tracking-wider text-green-300 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-md shadow-[0_0_15px_rgba(74,222,128,0.15)] whitespace-nowrap">
                MUEVE: {{ parchisStore.availableMoves.join(', ') }}
              </div>
            </Transition>
          </div>
        </div>

        <div class="hidden sm:block xl:hidden h-10 w-[1px] bg-white/10 relative z-10"></div>
        
        <!-- Indicator: Tu Color (Mobile) -->
        <div v-if="myPlayer" class="xl:hidden flex items-center gap-1.5 relative z-10 px-2">
          <div class="w-2.5 h-2.5 rounded-full shadow-[0_0_5px_currentColor]" :style="{ backgroundColor: getColor(myPlayer.color), color: getColor(myPlayer.color) }"></div>
        </div>

        <!-- Botón de Tirar Dados -->
        <button 
          @click="rollDice"
          :disabled="!parchisStore.isMyTurn || parchisStore.availableMoves.length > 0"
          :class="[
            'flex-1 sm:flex-none xl:w-full px-4 py-2 sm:px-6 sm:py-3 xl:py-4 text-[11px] sm:text-base font-black tracking-wide rounded-xl sm:rounded-2xl transition-all duration-300 relative z-10 overflow-hidden group',
            parchisStore.isMyTurn && parchisStore.availableMoves.length === 0 
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_5px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-orange-400/50 cursor-pointer' 
              : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
          ]"
        >
          <div v-if="parchisStore.isMyTurn && parchisStore.availableMoves.length === 0" class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
          <span class="relative flex items-center justify-center gap-1 sm:gap-2 drop-shadow-md whitespace-nowrap">
            <UIcon v-if="parchisStore.isMyTurn && parchisStore.availableMoves.length === 0" name="i-heroicons-sparkles" class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-200" />
            TIRAR DADOS
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ParchisDice from "./ParchisDice.vue";
import { useParchisStore } from "~/stores/games/parchisStore";
import { useSocket } from "~/composables/useSocket";
import { usePlayerStore } from "~/stores/playerStore";

const parchisStore = useParchisStore();
const playerStore = usePlayerStore();
const { socket } = useSocket();

const myPlayer = computed(() => parchisStore.players.find(p => p.userId === playerStore.userId));

const colorNameEs = (colorStr: string) => {
	const map: Record<string, string> = {
		green: "Verde",
		blue: "Azul",
		red: "Rojo",
		yellow: "Amarillo",
		purple: "Morado",
		orange: "Naranja",
		cyan: "Cian",
		pink: "Rosa"
	};
	return map[colorStr] || colorStr;
};

const getColor = (colorStr: string) => {
	const map: Record<string, string> = {
		green: "#4ade80",
		blue: "#3b82f6",
		red: "#ef4444",
		yellow: "#eab308",
		purple: "#a855f7",
		orange: "#f97316",
	};
	return map[colorStr] || colorStr;
};

const rollDice = () => {
	if (parchisStore.isMyTurn) {
		socket.value?.emit("parchis:roll_dice");
	}
};
</script>