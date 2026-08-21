<template>
  <Transition name="slide-panel">
    <div v-show="isOpen" class="w-full max-w-[800px] mx-auto relative z-10 -mt-2 px-4 sm:px-8">
      <div class="bg-[#8b5a2b] rounded-b-3xl border-4 border-t-0 border-[#5c3a21] p-6 pt-8 shadow-sm relative flex flex-col gap-6">
        <h4 class="text-white/80 font-black text-[10px] tracking-[0.4em] uppercase text-center -mb-2">
          Reglas de la Mesa (Parchís)
        </h4>
        
        <!-- Fichas por Jugador -->
        <div class="flex flex-col items-center gap-4 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner relative z-10">
          <label class="text-[10px] font-black text-[#e5e7eb] tracking-[0.4em] uppercase flex items-center justify-between w-full">
            Fichas por Jugador
            <span class="text-[#f97316] text-xl drop-shadow-md">{{ rules.tokensPerPlayer }}</span>
          </label>
          <div class="flex items-center justify-center gap-2 sm:gap-4 w-full">
            <button 
              v-for="count in [3, 4]" :key="count"
              :disabled="!isHost"
              @click="rules.tokensPerPlayer = count; $emit('change')"
              class="flex-1 py-3 rounded-lg border-2 font-black text-sm sm:text-base flex items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :class="rules.tokensPerPlayer === count ? 'bg-[#991b1b] border-[#7f1d1d] text-white shadow-inner scale-105' : 'bg-[#b48554] border-[#d4a373] text-[#4a2e1b] hover:bg-[#c49564] hover:-translate-y-0.5'"
            >
              {{ count }} Fichas
            </button>
          </div>
        </div>

        <div class="h-1 w-full bg-[#5c3a21] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>

        <!-- Tamaño del Tablero -->
        <div class="flex flex-col items-center gap-4 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner relative z-10">
          <label class="text-[10px] font-black text-[#e5e7eb] tracking-[0.4em] uppercase flex items-center justify-between w-full">
            Tamaño del Tablero
            <span class="text-[#f97316] text-xl drop-shadow-md">{{ rules.parchisBoardSize }} Brazos</span>
          </label>
          <div class="flex items-center justify-center gap-2 sm:gap-4 w-full">
            <button 
              v-for="size in [4, 6, 8]" :key="size"
              :disabled="!isHost"
              @click="rules.parchisBoardSize = size; $emit('change')"
              class="flex-1 py-3 rounded-lg border-2 font-black text-sm sm:text-base flex items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :class="rules.parchisBoardSize === size ? 'bg-[#991b1b] border-[#7f1d1d] text-white shadow-inner scale-105' : 'bg-[#b48554] border-[#d4a373] text-[#4a2e1b] hover:bg-[#c49564] hover:-translate-y-0.5'"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <div class="h-1 w-full bg-[#5c3a21] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>

        <!-- Número de Dados -->
        <div class="flex flex-col items-center gap-4 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner relative z-10">
          <label class="text-[10px] font-black text-[#e5e7eb] tracking-[0.4em] uppercase flex items-center justify-between w-full">
            Número de Dados
            <span class="text-[#f97316] text-xl drop-shadow-md">{{ rules.diceCount }}</span>
          </label>
          <div class="flex items-center justify-center gap-2 sm:gap-4 w-full">
            <button 
              @click="rules.diceCount = 1; $emit('change')" :disabled="!isHost"
              class="flex-1 py-3 rounded-lg border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :class="rules.diceCount === 1 ? 'bg-[#991b1b] border-[#7f1d1d] text-white shadow-inner scale-105' : 'bg-[#b48554] border-[#d4a373] text-[#4a2e1b] hover:bg-[#c49564] hover:-translate-y-0.5'"
            >
              <span>1 Dado</span>
              <span class="text-[10px] opacity-70 font-bold mt-1 tracking-wider uppercase">(Clásico)</span>
            </button>
            <button 
              @click="rules.diceCount = 2; $emit('change')" :disabled="!isHost"
              class="flex-1 py-3 rounded-lg border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :class="rules.diceCount === 2 ? 'bg-[#991b1b] border-[#7f1d1d] text-white shadow-inner scale-105' : 'bg-[#b48554] border-[#d4a373] text-[#4a2e1b] hover:bg-[#c49564] hover:-translate-y-0.5'"
            >
              <span>2 Dados</span>
              <span class="text-[10px] opacity-70 font-bold mt-1 tracking-wider uppercase">(Estilo Colombiano)</span>
            </button>
          </div>
        </div>

        <div class="h-1 w-full bg-[#5c3a21] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>

        <!-- Toggles Extraídos -->
        <ParchisRuleToggle 
          v-model="rules.exactMeta" 
          label="Llegada Exacta a Meta" 
          :disabled="!isHost" 
          @change="$emit('change')" 
        />
        <ParchisRuleToggle 
          v-model="rules.autoSoplar" 
          label="Regla: Soplar (Automático)" 
          description="Si puedes comer y no lo haces, pierdes la ficha"
          :disabled="!isHost" 
          @change="$emit('change')" 
        />
        <ParchisRuleToggle 
          v-model="rules.safeBlocks" 
          label="Bloqueos (Barreras)" 
          description="Dos fichas juntas en pista no pueden ser comidas"
          :disabled="!isHost" 
          @change="$emit('change')" 
        />

        <div class="h-1 w-full bg-[#5c3a21] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>

        <!-- 3 Pares Seguidos -->
        <div v-if="rules.diceCount === 2" class="flex flex-col items-center gap-4 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner relative z-10">
          <label class="text-[10px] font-black text-[#e5e7eb] tracking-[0.4em] uppercase flex items-center justify-between w-full">
            Al sacar 3 Pares Seguidos
          </label>
          <div class="flex items-center justify-center gap-2 sm:gap-4 w-full">
            <button 
              @click="rules.threePairsRule = 'penalty'; $emit('change')" :disabled="!isHost"
              class="flex-1 py-3 rounded-lg border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :class="rules.threePairsRule === 'penalty' ? 'bg-[#991b1b] border-[#7f1d1d] text-white shadow-inner scale-105' : 'bg-[#b48554] border-[#d4a373] text-[#4a2e1b] hover:bg-[#c49564] hover:-translate-y-0.5'"
            >
              <span>Castigo</span>
              <span class="text-[10px] opacity-70 font-bold mt-1 tracking-wider uppercase text-center">Ficha a la cárcel</span>
            </button>
            <button 
              @click="rules.threePairsRule = 'reward'; $emit('change')" :disabled="!isHost"
              class="flex-1 py-3 rounded-lg border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :class="rules.threePairsRule === 'reward' ? 'bg-[#109041] border-[#065f29] text-white shadow-inner scale-105' : 'bg-[#b48554] border-[#d4a373] text-[#4a2e1b] hover:bg-[#c49564] hover:-translate-y-0.5'"
            >
              <span>Corona</span>
              <span class="text-[10px] opacity-70 font-bold mt-1 tracking-wider uppercase text-center">Una ficha al cielo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import ParchisRuleToggle from './games/parchis/ParchisRuleToggle.vue';

const rules = defineModel<any>("rules", { required: true });
const emit = defineEmits(['change']);

const props = defineProps({
  isHost: { type: Boolean, default: false },
  isOpen: { type: Boolean, default: false }
});

if (rules.value.diceCount === undefined) rules.value.diceCount = 2;
if (rules.value.tokensPerPlayer === undefined) rules.value.tokensPerPlayer = 4;
if (rules.value.exactMeta === undefined) rules.value.exactMeta = true;
if (rules.value.parchisBoardSize === undefined) rules.value.parchisBoardSize = 4;
</script>

<style scoped>
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: top;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.9);
}
</style>
