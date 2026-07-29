<template>
  <div class="flex items-center justify-center gap-3 md:gap-5 w-full">
    <!-- Amount Selection -->
    <div class="flex items-center bg-[#1f120a] rounded-md p-1.5 border-2 border-[#150c07] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]">
      <button 
        @click="emitDecrementAmount"
        class="w-10 h-10 md:w-12 md:h-12 bg-[#4a2e1b] hover:bg-[#5c3a21] active:bg-[#382214] border-b-[5px] border-[#25160d] active:border-b-0 active:translate-y-[5px] rounded text-2xl font-bold flex justify-center items-center transition-all select-none"
        :disabled="!canDecrement"
        :class="{ 'opacity-50 cursor-not-allowed hover:bg-[#4a2e1b]': !canDecrement }"
      >
        <span class="drop-shadow-md">-</span>
      </button>
      <div class="w-14 md:w-16 text-center font-black text-2xl md:text-3xl text-amber-100 font-mono drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
        {{ amount }}
      </div>
      <button 
        @click="emitIncrementAmount"
        class="w-10 h-10 md:w-12 md:h-12 bg-[#4a2e1b] hover:bg-[#5c3a21] active:bg-[#382214] border-b-[5px] border-[#25160d] active:border-b-0 active:translate-y-[5px] rounded text-2xl font-bold flex justify-center items-center transition-all select-none"
        :disabled="!canIncrement"
        :class="{ 'opacity-50 cursor-not-allowed hover:bg-[#4a2e1b]': !canIncrement }"
      >
        <span class="drop-shadow-md">+</span>
      </button>
    </div>

    <div class="text-[#d8a872] font-black text-xl md:text-2xl drop-shadow-md px-1">X</div>

    <!-- Face Selection -->
    <div class="flex items-center bg-[#1f120a] rounded-md p-1.5 border-2 border-[#150c07] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]">
      <button 
        @click="emitDecrementFace"
        class="w-10 h-10 md:w-12 md:h-12 bg-[#4a2e1b] hover:bg-[#5c3a21] active:bg-[#382214] border-b-[5px] border-[#25160d] active:border-b-0 active:translate-y-[5px] rounded text-xl font-bold flex justify-center items-center transition-all select-none"
        :disabled="face <= 1"
        :class="{ 'opacity-50 cursor-not-allowed hover:bg-[#4a2e1b]': face <= 1 }"
      >
        <span class="drop-shadow-md">&lt;</span>
      </button>
      <div class="w-14 md:w-16 h-12 flex justify-center items-center">
        <!-- Small Dice Face -->
        <div class="w-8 h-8 md:w-10 md:h-10 bg-[#e8e4d9] rounded shadow-[1px_3px_0px_#8a7f6c,inset_-1px_-2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center relative border border-[#d3cebe]">
          <div v-if="face === 1" class="w-2 h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
          <div v-else-if="face === 2" class="w-full h-full p-2 flex flex-col justify-between items-center">
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full self-end shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full self-start shadow-inner"></div>
          </div>
          <div v-else-if="face === 3" class="w-full h-full p-1.5 flex flex-col justify-between items-center">
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full self-end shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full self-start shadow-inner"></div>
          </div>
          <div v-else-if="face === 4" class="w-full h-full p-2 grid grid-cols-2 gap-1 place-items-center">
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
          </div>
          <div v-else-if="face === 5" class="w-full h-full p-1.5 grid grid-cols-2 gap-1 place-items-center relative">
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
          </div>
          <div v-else-if="face === 6" class="w-full h-full p-1.5 grid grid-cols-2 gap-0.5 place-items-center">
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div class="w-1.5 h-1.5 bg-[#2c2620] rounded-full shadow-inner"></div>
          </div>
        </div>
      </div>
      <button 
        @click="emitIncrementFace"
        class="w-10 h-10 md:w-12 md:h-12 bg-[#4a2e1b] hover:bg-[#5c3a21] active:bg-[#382214] border-b-[5px] border-[#25160d] active:border-b-0 active:translate-y-[5px] rounded text-xl font-bold flex justify-center items-center transition-all select-none"
        :disabled="face >= 6"
        :class="{ 'opacity-50 cursor-not-allowed hover:bg-[#4a2e1b]': face >= 6 }"
      >
        <span class="drop-shadow-md">&gt;</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  amount: number;
  face: number;
  canDecrement: boolean;
  canIncrement: boolean;
}>();

const emit = defineEmits<{
  (e: 'decrementAmount'): void;
  (e: 'incrementAmount'): void;
  (e: 'decrementFace'): void;
  (e: 'incrementFace'): void;
}>();

const emitDecrementAmount = () => emit('decrementAmount');
const emitIncrementAmount = () => emit('incrementAmount');
const emitDecrementFace = () => emit('decrementFace');
const emitIncrementFace = () => emit('incrementFace');
</script>
