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
const strokesToRender = ref<DrawEvent[]>([]); // Normally fed from WS

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
  <div class="flex-1 flex flex-col lg:flex-row h-full w-full gap-4 p-4 bg-[#f0e6d2] font-sans selection:bg-[#ffb0b0] overflow-hidden">
    
    <!-- Left Column: Players / Scores -->
    <div class="w-full lg:w-64 flex flex-col gap-3 overflow-y-auto overscroll-contain min-h-0">
      <div class="bg-[#e4d5b7] p-4 rounded-xl border-b-[6px] border-[#cbbca0] shadow-sm flex flex-col gap-2">
        <h2 class="text-xl font-bold text-[#5c3a21] uppercase tracking-wider drop-shadow-sm">Jugadores</h2>
        <ul class="flex flex-col gap-2">
          <!-- Mocking players based on scores map -->
          <li v-for="(score, userId) in gameState?.scores || {}" :key="userId" 
              class="flex items-center justify-between p-2 bg-white rounded border-b-2 border-gray-300">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-400 rounded-full border-2 border-[#5c3a21] shadow-inner"></div>
              <span class="font-bold text-gray-800" :class="{ 'text-green-600': gameState?.guessedPlayers?.includes(userId) }">
                Player {{ userId.substring(0, 4) }}
              </span>
            </div>
            <span class="font-bold text-[#8b5a2b]">{{ score }} pts</span>
            <span v-if="gameState?.currentDrawerId === userId" class="text-xl" title="Dibujando">🖌️</span>
          </li>
        </ul>
      </div>

      <!-- Game Status Board -->
      <div class="bg-[#3e2723] p-4 rounded-xl border-b-[6px] border-[#271815] shadow-lg text-white">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-300 font-semibold uppercase">Ronda</span>
          <span class="font-bold text-xl">{{ gameState?.round }} / {{ gameState?.maxRounds }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-300 font-semibold uppercase">Tiempo</span>
          <span class="font-bold text-2xl text-yellow-400 drop-shadow-sm">{{ gameState?.timeRemaining }}s</span>
        </div>
      </div>
    </div>

    <!-- Center Column: Canvas & Tools -->
    <div class="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto overscroll-contain min-h-0">
      
      <!-- Top Bar: Word to draw/guess -->
      <div class="bg-white p-4 rounded-xl border-b-[6px] border-gray-300 shadow-sm flex flex-col items-center justify-center relative min-h-[5rem]">
        
        <template v-if="gameState?.state === 'WAITING'">
          <h2 class="text-2xl font-bold text-gray-700">Esperando jugadores...</h2>
        </template>
        
        <template v-else-if="gameState?.state === 'CHOOSING_WORD'">
          <div v-if="isDrawer" class="flex flex-col items-center gap-2 w-full">
            <h2 class="text-xl font-bold text-gray-700">Elige una palabra:</h2>
            <div class="flex gap-4 justify-center flex-wrap">
              <button 
                v-for="(w, index) in wordOptions" :key="w" 
                @click="emit('chooseWord', index)"
                class="px-6 py-2 bg-yellow-400 font-bold text-[#5c3a21] rounded-lg border-b-4 border-yellow-600 hover:-translate-y-1 active:translate-y-0 active:border-b-0 transition-transform shadow-md uppercase"
              >
                {{ w }}
              </button>
            </div>
          </div>
          <div v-else>
            <h2 class="text-2xl font-bold text-gray-700">El pintor está eligiendo palabra...</h2>
          </div>
        </template>
        
        <template v-else>
          <span class="text-sm text-gray-500 font-bold uppercase mb-1">
            {{ isDrawer ? 'Dibuja esto:' : 'Adivina la palabra:' }}
          </span>
          <h2 class="text-4xl tracking-[0.2em] font-mono font-extrabold text-[#5c3a21] drop-shadow-sm">
            {{ displayWord }}
          </h2>
        </template>

      </div>

      <!-- The Canvas -->
      <div class="flex-1 min-h-[150px]">
        <PinturilloCanvas
          :isDrawer="isDrawer && gameState?.state === 'DRAWING'"
          :currentColor="currentColor"
          :currentThickness="currentThickness"
          :strokesToRender="strokesToRender"
          :clearCanvasSignal="clearCanvasSignal"
          @draw="handleDraw"
        />
      </div>

      <!-- Tools (Only enabled if drawer) -->
      <div :class="{ 'opacity-50 pointer-events-none': !isDrawer || gameState?.state !== 'DRAWING' }">
        <PinturilloTools
          :currentColor="currentColor"
          :currentThickness="currentThickness"
          @update:color="currentColor = $event"
          @update:thickness="currentThickness = $event"
          @clear="handleClear"
        />
      </div>
    </div>

    <!-- Right Column: Chat / Guesses -->
    <div class="w-full lg:w-72 flex flex-col bg-[#fff8eb] rounded-xl border-b-[6px] border-[#d8cbb0] shadow-sm overflow-hidden h-[400px] lg:h-auto">
      <div class="bg-[#d2b48c] p-3 border-b-4 border-[#bca17d]">
        <h2 class="text-lg font-bold text-[#5c3a21] uppercase drop-shadow-sm">Adivinanzas</h2>
      </div>
      
      <div class="flex-1 p-3 overflow-y-auto overscroll-contain flex flex-col gap-2">
        <div v-for="(msg, i) in chatMessages" :key="i" class="flex flex-col gap-1">
          <template v-if="msg.isSystem">
            <div class="bg-green-100 border border-green-300 p-2 rounded text-sm text-green-800 font-bold shadow-sm">
              {{ msg.text }}
            </div>
          </template>
          <template v-else>
            <div class="p-2 text-sm bg-white border border-gray-200 rounded shadow-sm">
              <span class="font-bold text-gray-700">{{ msg.playerName }}: </span>
              <span>{{ msg.text }}</span>
            </div>
          </template>
        </div>
      </div>

      <div class="p-3 bg-[#e4d5b7] border-t-4 border-[#cbbca0]">
        <form @submit.prevent="submitGuess" class="flex gap-2">
          <input 
            v-model="guessInput"
            type="text" 
            placeholder="Escribe aquí..." 
            class="flex-1 min-w-0 px-3 py-2 rounded border-2 border-[#bca17d] focus:outline-none focus:border-[#8b5a2b] shadow-inner font-bold text-gray-700"
            :disabled="isDrawer || gameState?.state !== 'DRAWING'"
          />
          <button 
            type="submit"
            class="shrink-0 px-4 py-2 bg-green-500 text-white font-bold rounded border-b-4 border-green-700 hover:-translate-y-1 active:translate-y-0 active:border-b-0 transition-transform shadow-md"
            :disabled="isDrawer || gameState?.state !== 'DRAWING'"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>

  </div>
</template>
