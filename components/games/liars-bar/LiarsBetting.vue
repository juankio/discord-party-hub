<template>
  <div class="bg-[#3a2516] p-4 md:p-6 rounded-lg border-4 border-[#25160d] shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(0,0,0,0.6)] flex flex-col md:flex-row gap-6 items-center text-amber-50 mx-auto max-w-3xl relative z-20">
    
    <!-- Bet Controls -->
    <div class="flex flex-col gap-4 items-center flex-1 w-full">
      <div class="text-[#d8a872] font-black uppercase tracking-widest text-sm border-b-2 border-[#d8a872]/20 pb-1 w-full text-center">
        Tu Apuesta
      </div>
      
      <LiarsBettingControls 
        :amount="amount"
        :face="face"
        :can-decrement="canDecrement"
        :can-increment="canIncrement"
        @decrementAmount="decrementAmount"
        @incrementAmount="incrementAmount"
        @decrementFace="decrementFace"
        @incrementFace="incrementFace"
      />

      <button 
        @click="onPlaceBet"
        class="w-full py-3 md:py-4 mt-2 bg-[#2d5a27] hover:bg-[#3a7033] active:bg-[#1f401b] border-b-[6px] border-[#152e12] active:border-b-0 active:translate-y-[6px] rounded-md font-black text-xl md:text-2xl tracking-widest uppercase text-green-50 shadow-[0_6px_15px_rgba(0,0,0,0.6)] transition-all"
        :disabled="!isValidBet"
        :class="{ 'opacity-50 cursor-not-allowed hover:bg-[#2d5a27] grayscale': !isValidBet }"
      >
        <span class="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Apostar</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="w-full h-1 md:w-1 md:h-40 bg-[#150c07] rounded-full shadow-[1px_0_0_rgba(255,255,255,0.1)] opacity-70"></div>

    <!-- Liar Button -->
    <div class="flex flex-col items-center justify-center w-full md:w-auto h-full mt-2 md:mt-0">
      <div v-if="!currentBet" class="absolute -top-3 text-xs bg-black/80 px-2 py-1 rounded text-[#d8a872] border border-[#d8a872]/30 whitespace-nowrap hidden md:block">
        Necesitas una apuesta previa
      </div>
      <button 
        @click="onCallLiar"
        class="group relative px-6 py-6 md:py-8 bg-[#8b2323] hover:bg-[#a52a2a] active:bg-[#6b1b1b] border-b-[8px] border-[#4a1212] active:border-b-0 active:translate-y-[8px] rounded-lg font-black text-2xl md:text-3xl lg:text-4xl tracking-widest text-red-50 shadow-[0_10px_25px_rgba(0,0,0,0.8)] transition-all w-full md:w-72"
        :disabled="!canCallLiar"
        :class="{ 'opacity-50 cursor-not-allowed hover:bg-[#8b2323] grayscale': !canCallLiar }"
      >
        <span class="block text-center drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)]">¡MENTIROSO!</span>
        <span class="block text-xs font-bold text-red-200/50 text-center mt-2 md:mt-3 uppercase tracking-widest group-active:opacity-0 transition-opacity">Llamar Dudo</span>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import LiarsBettingControls from './LiarsBettingControls.vue';
import { useLiarsAudio } from '@/composables/useLiarsAudio';

const props = defineProps<{
  currentBet?: { amount: number, face: number } | null;
  totalDiceCount?: number;
}>();

const emit = defineEmits<{
  (e: 'place-bet', bet: { amount: number, face: number }): void;
  (e: 'call-liar'): void;
}>();

// Initialize states
const amount = ref(1);
const face = ref(2); // In Liar's dice usually 1 is wild, so start at 2 or 1. Let's start at 2 for visual.

// Update local state when currentBet changes (from backend)
watch(() => props.currentBet, (newVal) => {
  if (newVal) {
    if (newVal.face < 6) {
      amount.value = newVal.amount;
      face.value = newVal.face + 1;
    } else {
      amount.value = newVal.amount + 1;
      face.value = 2; // wrap around to non-wild face
    }
  } else {
    amount.value = 1;
    face.value = 2;
  }
}, { immediate: true });

// Validations
const canDecrement = computed(() => {
  if (!props.currentBet) return amount.value > 1;
  
  if (amount.value > props.currentBet.amount + 1) return true;
  if (amount.value === props.currentBet.amount + 1 && face.value <= props.currentBet.face) return true;
  if (amount.value === props.currentBet.amount) return false;
  
  return true; // fallback
});

const canIncrement = computed(() => amount.value < (props.totalDiceCount || 30));

const isValidBet = computed(() => {
  if (!props.currentBet) return amount.value >= 1;
  
  if (amount.value > props.currentBet.amount) return true;
  if (amount.value === props.currentBet.amount && face.value > props.currentBet.face) return true;
  
  return false;
});

const canCallLiar = computed(() => !!props.currentBet);

// Actions
const incrementAmount = () => { if (canIncrement.value) amount.value++; };
const decrementAmount = () => { 
  if (amount.value > 1) { // Basic sanity
    amount.value--; 
    // If decrementing makes the bet invalid due to face, fix face
    if (props.currentBet && amount.value === props.currentBet.amount && face.value <= props.currentBet.face) {
      face.value = Math.min(6, props.currentBet.face + 1);
    }
  }
};
const incrementFace = () => { if (face.value < 6) face.value++; };
const decrementFace = () => { 
  if (face.value > 1) {
    // Basic sanity
    face.value--; 
    // If decrementing makes the bet invalid, bump amount
    if (props.currentBet && amount.value === props.currentBet.amount && face.value <= props.currentBet.face) {
      if (canIncrement.value) amount.value++;
      else face.value++; // revert if we can't increment amount
    }
  }
};

const { playBet, playCall } = useLiarsAudio();

const onPlaceBet = () => {
  if (isValidBet.value) {
    playBet();
    emit('place-bet', { amount: amount.value, face: face.value });
  }
};

const onCallLiar = () => {
  if (canCallLiar.value) {
    playCall();
    emit('call-liar');
  }
};
</script>
