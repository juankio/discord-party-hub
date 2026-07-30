<script setup lang="ts">
import { computed, watch } from 'vue';
import type { ImpostorPrivateState } from '../../../../discord-party-hub-backend/src/games/impostor/ImpostorTypes';
import ImpostorCard from './ImpostorCard.vue';
import ImpostorDiscussion from './ImpostorDiscussion.vue';
import ImpostorVoting from './ImpostorVoting.vue';
import ImpostorResults from './ImpostorResults.vue';
import { useImpostorAudio } from '@/composables/useImpostorAudio';

const props = defineProps<{
  gameState: ImpostorPrivateState;
  currentPlayerId: string;
}>();

const emit = defineEmits<{
  (e: 'vote', targetId: string): void;
  (e: 'ready'): void;
  (e: 'leave'): void;
}>();

const currentState = computed(() => props.gameState?.state || 'WAITING');

const { playReveal, playVote, playResults } = useImpostorAudio();

watch(() => props.gameState?.state, (newState) => {
  if (newState === 'WORDS_REVEALED') {
    playReveal();
  } else if (newState === 'VOTING') {
    playVote();
  } else if (newState === 'RESULTS') {
    playResults();
  }
});
</script>

<template>
  <div class="relative w-full h-full flex-1 flex flex-col items-center justify-center bg-[#8b5a2b] p-6 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] overflow-hidden font-mono text-[#3e2723]">
    <!-- Wooden Table Background Texture (CSS grid/stripes) -->
    <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 42px);"></div>
    
    <div class="relative z-10 w-full max-w-4xl overflow-y-auto max-h-full">
      <!-- State Routing -->
      <transition name="fade-slide" mode="out-in">
        <!-- WAITING -->
        <div v-if="currentState === 'WAITING'" key="waiting" class="bg-[#f4e4bc] border-4 border-[#3e2723] border-b-[8px] p-8 rounded-sm shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col items-center">
          <h2 class="text-2xl md:text-4xl font-black mb-6 uppercase tracking-widest border-b-4 border-[#3e2723] pb-2">Investigación Pendiente</h2>
          <p class="text-xl mb-8 font-bold">Esperando que el director del buró inicie el caso...</p>
          <div class="flex flex-wrap gap-4 justify-center">
            <div v-for="p in gameState?.players || []" :key="p.userId || p.id" class="flex flex-col items-center p-3 border-2 border-[#3e2723] border-b-4 bg-[#e8d5a5] shadow-[4px_4px_0_rgba(0,0,0,0.3)] transform -rotate-2">
              <div class="w-16 h-16 bg-gray-300 border-2 border-[#3e2723] mb-2 overflow-hidden flex items-center justify-center text-2xl" :style="{ backgroundColor: p.color }">
                🧑‍✈️
              </div>
              <span class="font-bold uppercase">{{ p.nickname }}</span>
            </div>
          </div>
        </div>

        <!-- WORDS_REVEALED -->
        <ImpostorCard 
          v-else-if="currentState === 'WORDS_REVEALED'" 
          key="words_revealed"
          :word="gameState.myWord"
          :is-impostor="gameState.amImpostor"
          @ready="emit('ready')"
        />

        <!-- DISCUSSION -->
        <ImpostorDiscussion
          v-else-if="currentState === 'DISCUSSION'"
          key="discussion"
          :time-remaining="gameState.timeRemaining"
          :players="gameState.players"
        />

        <!-- VOTING -->
        <ImpostorVoting
          v-else-if="currentState === 'VOTING'"
          key="voting"
          :players="gameState.players"
          :time-remaining="gameState.timeRemaining"
          :current-player-id="currentPlayerId"
          @vote="(id) => emit('vote', id)"
        />

        <!-- RESULTS / FINISHED -->
        <ImpostorResults
          v-else-if="currentState === 'RESULTS' || currentState === 'FINISHED'"
          key="results"
          :game-state="gameState"
          @ready="emit('ready')"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) rotate(-1deg);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) rotate(1deg);
}
</style>