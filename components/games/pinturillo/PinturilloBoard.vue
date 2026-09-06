<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PinturilloPublicState, DrawEvent } from './types';
import PinturilloCanvas from './PinturilloCanvas.vue';
import PinturilloTools from './PinturilloTools.vue';
import { usePinturilloAudio } from '@/composables/usePinturilloAudio';

// Accept the state from the room orchestrator
const props = defineProps<{
  gameState: PinturilloPublicState;
  myUserId: string;
  strokesToRender?: DrawEvent[];
  chatMessages?: any[];
}>();

const emit = defineEmits<{
  (e: 'draw', event: DrawEvent): void;
  (e: 'guess', word: string): void;
  (e: 'clear'): void;
  (e: 'chooseWord', wordIndex: number): void;
}>();

// Local UI State
const currentColor = ref('#000000');
const currentThickness = ref(5);
const clearCanvasSignal = ref(0);
const guessInput = ref('');

const isDrawer = computed(() => props.gameState?.currentDrawerId === props.myUserId);

function handleDraw(event: DrawEvent) {
  emit('draw', event);
}

function handleClear() {
  clearCanvasSignal.value++;
  emit('clear');
}

function submitGuess() {
  if (!guessInput.value.trim() || isDrawer.value) return;
  emit('guess', guessInput.value.trim());
  guessInput.value = '';
}

// Display logic for the word
const displayWord = computed(() => {
  if (isDrawer.value && props.gameState?.wordToDraw) {
    return props.gameState.wordToDraw;
  }
  if (props.gameState?.state === 'ROUND_RESULTS' || props.gameState?.state === 'FINISHED') {
    return props.gameState?.wordToDraw || '???';
  }
  // If guessing, show underscores
  return Array(props.gameState?.currentWordLength || 0).fill('_').join(' ');
});

const wordOptions = computed(() => props.gameState?.wordOptions || []);

const { playCorrect } = usePinturilloAudio();

watch(() => props.gameState?.scores?.[props.myUserId], (newScore, oldScore) => {
  if (newScore !== undefined && oldScore !== undefined && newScore > oldScore && !isDrawer.value) {
    playCorrect();
  }
});
</script>

<template>
  <div class="flex-1 flex flex-col lg:flex-row h-full w-full gap-3 sm:gap-4 p-2 sm:p-4 bg-[#f0e6d2] font-sans selection:bg-[#ffb0b0] overflow-y-auto lg:overflow-hidden">
    
    <!-- Left Column: Players / Scores (Horizontal compacto en mobile, Columna en Desktop) -->
    <div class="w-full lg:w-64 flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 shrink-0">
      <div class="bg-[#e4d5b7] p-3 sm:p-4 rounded-xl border-b-4 sm:border-b-[6px] border-[#cbbca0] shadow-sm flex flex-col gap-2 flex-1 min-w-0">
        <h2 class="text-sm sm:text-base lg:text-xl font-bold text-[#5c3a21] uppercase tracking-wider drop-shadow-sm">Jugadores</h2>
        <ul class="flex flex-row sm:flex-row lg:flex-col gap-1.5 sm:gap-2 overflow-x-auto lg:overflow-y-auto max-h-24 sm:max-h-32 lg:max-h-none py-1 scrollbar-hide">
          <!-- Mocking players based on scores map -->
          <li
            v-for="(score, userId) in gameState?.scores || {}" :key="userId" 
            class="flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-white rounded border-b-2 border-gray-300 shrink-0 lg:shrink min-w-[140px] lg:min-w-0"
          >
            <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 rounded-full border-2 border-[#5c3a21] shadow-inner shrink-0"/>
              <span class="font-bold text-xs sm:text-sm text-gray-800 truncate" :class="{ 'text-green-600': gameState?.guessedPlayers?.includes(userId) }">
                Player {{ userId.substring(0, 4) }}
              </span>
            </div>
            <span class="font-bold text-xs sm:text-sm text-[#8b5a2b] shrink-0">{{ score }} pts</span>
            <span v-if="gameState?.currentDrawerId === userId" class="text-base sm:text-xl shrink-0" title="Dibujando">🖌️</span>
          </li>
        </ul>
      </div>

      <!-- Game Status Board -->
      <div class="bg-[#3e2723] p-2.5 sm:p-4 rounded-xl border-b-4 sm:border-b-[6px] border-[#271815] shadow-lg text-white flex flex-row lg:flex-col justify-around lg:justify-start gap-2">
        <div class="flex items-center lg:justify-between gap-2">
          <span class="text-xs sm:text-sm text-gray-300 font-semibold uppercase">Ronda</span>
          <span class="font-bold text-sm sm:text-xl">{{ gameState?.round }} / {{ gameState?.maxRounds }}</span>
        </div>
        <div class="flex items-center lg:justify-between gap-2">
          <span class="text-xs sm:text-sm text-gray-300 font-semibold uppercase">Tiempo</span>
          <span class="font-bold text-base sm:text-2xl text-yellow-400 drop-shadow-sm">{{ gameState?.timeRemaining }}s</span>
        </div>
      </div>
    </div>

    <!-- Center Column: Canvas & Tools -->
    <div class="flex-1 flex flex-col gap-2 sm:gap-4 min-w-0 min-h-0">
      
      <!-- Top Bar: Word to draw/guess -->
      <div class="bg-white p-2.5 sm:p-4 rounded-xl border-b-4 sm:border-b-[6px] border-gray-300 shadow-sm flex flex-col items-center justify-center relative min-h-[3.5rem] sm:min-h-[5rem]">
        
        <template v-if="gameState?.state === 'WAITING'">
          <h2 class="text-lg sm:text-2xl font-bold text-gray-700">Esperando jugadores...</h2>
        </template>
        
        <template v-else-if="gameState?.state === 'CHOOSING_WORD'">
          <div v-if="isDrawer" class="flex flex-col items-center gap-2 w-full">
            <h2 class="text-sm sm:text-xl font-bold text-gray-700">Elige una palabra:</h2>
            <div class="flex gap-2 sm:gap-4 justify-center flex-wrap">
              <button 
                v-for="(w, index) in wordOptions" :key="w" 
                class="px-3 sm:px-6 py-1.5 sm:py-2 bg-yellow-400 font-bold text-xs sm:text-sm md:text-base text-[#5c3a21] rounded-lg border-b-2 sm:border-b-4 border-yellow-600 hover:-translate-y-0.5 active:translate-y-0 transition-transform shadow-md uppercase min-h-[44px]"
                @click="emit('chooseWord', index)"
              >
                {{ w }}
              </button>
            </div>
          </div>
          <div v-else>
            <h2 class="text-base sm:text-2xl font-bold text-gray-700">El pintor está eligiendo palabra...</h2>
          </div>
        </template>
        
        <template v-else>
          <span class="text-xs sm:text-sm text-gray-500 font-bold uppercase mb-0.5">
            {{ isDrawer ? 'Dibuja esto:' : 'Adivina la palabra:' }}
          </span>
          <h2 class="text-2xl sm:text-4xl tracking-[0.15em] sm:tracking-[0.2em] font-mono font-extrabold text-[#5c3a21] drop-shadow-sm text-center truncate max-w-full">
            {{ displayWord }}
          </h2>
        </template>

      </div>

      <!-- The Canvas -->
      <div class="flex-1 min-h-[200px] sm:min-h-[320px] relative">
        <PinturilloCanvas
          :is-drawer="isDrawer && gameState?.state === 'DRAWING'"
          :current-color="currentColor"
          :current-thickness="currentThickness"
          :strokes-to-render="props.strokesToRender || []"
          :clear-canvas-signal="clearCanvasSignal"
          @draw="handleDraw"
        />
      </div>

      <!-- Tools (Only enabled if drawer) -->
      <div :class="{ 'opacity-50 pointer-events-none': !isDrawer || gameState?.state !== 'DRAWING' }">
        <PinturilloTools
          :current-color="currentColor"
          :current-thickness="currentThickness"
          @update:color="currentColor = $event"
          @update:thickness="currentThickness = $event"
          @clear="handleClear"
        />
      </div>
    </div>

    <!-- Right Column: Chat / Guesses (Adaptable en mobile) -->
    <div class="w-full lg:w-72 flex flex-col bg-[#fff8eb] rounded-xl border-b-4 sm:border-b-[6px] border-[#d8cbb0] shadow-sm overflow-hidden h-48 sm:h-64 lg:h-auto shrink-0">
      <div class="bg-[#d2b48c] p-2 sm:p-3 border-b-2 sm:border-b-4 border-[#bca17d]">
        <h2 class="text-sm sm:text-lg font-bold text-[#5c3a21] uppercase drop-shadow-sm">Adivinanzas</h2>
      </div>
      
      <div class="flex-1 p-2 sm:p-3 overflow-y-auto overscroll-contain flex flex-col gap-1.5 sm:gap-2 min-h-0">
        <div v-for="(msg, i) in chatMessages" :key="i" class="flex flex-col gap-1">
          <template v-if="msg.isSystem">
            <div class="bg-green-100 border border-green-300 p-1.5 sm:p-2 rounded text-xs sm:text-sm text-green-800 font-bold shadow-sm">
              {{ msg.text }}
            </div>
          </template>
          <template v-else>
            <div class="p-1.5 sm:p-2 text-xs sm:text-sm bg-white border border-gray-200 rounded shadow-sm">
              <span class="font-bold text-gray-700">{{ msg.playerName }}: </span>
              <span>{{ msg.text }}</span>
            </div>
          </template>
        </div>
      </div>

      <div class="p-2 sm:p-3 bg-[#e4d5b7] border-t-2 sm:border-t-4 border-[#cbbca0]">
        <form class="flex gap-2" @submit.prevent="submitGuess">
          <input 
            v-model="guessInput"
            type="text" 
            placeholder="Escribe aquí..." 
            class="flex-1 min-w-0 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded border-2 border-[#bca17d] focus:outline-none focus:border-[#8b5a2b] shadow-inner font-bold text-xs sm:text-sm text-gray-700 min-h-[40px]"
            :disabled="isDrawer || gameState?.state !== 'DRAWING'"
          >
          <button 
            type="submit"
            class="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white font-bold rounded border-b-2 sm:border-b-4 border-green-700 hover:-translate-y-0.5 active:translate-y-0 transition-transform shadow-md text-xs sm:text-sm min-h-[40px]"
            :disabled="isDrawer || gameState?.state !== 'DRAWING'"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>

  </div>
</template>
