<template>
  <div class="relative flex flex-col items-center">
    <div 
      class="font-bold mb-2 uppercase tracking-widest drop-shadow-md text-sm md:text-base px-3 py-1 rounded-sm border-2 transition-all duration-300"
      :class="isCurrentTurn ? 'bg-green-100 text-green-900 border-green-500 ring-4 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-110' : 'bg-[#2a170b] text-amber-100 border-[#4a2e19]'"
    >
      {{ playerName }} <span v-if="diceCount > 0" class="opacity-80">({{ diceCount }})</span>
    </div>

    <!-- The game area for this player -->
    <div 
      class="relative w-28 h-32 md:w-36 md:h-40 group cursor-pointer"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @click="toggleReveal"
    >
      <!-- Base Shadow (stays on table) -->
      <div class="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-[80%] h-6 bg-black/40 blur-md rounded-[50%]"></div>

      <!-- Dice inside (revealed when cup is lifted) -->
      <div class="absolute bottom-0 left-0 w-full h-full flex flex-wrap justify-center items-center content-center gap-1.5 md:gap-2 p-2">
        <template v-if="diceValues && diceValues.length > 0">
          <div 
            v-for="(val, idx) in diceValues" 
            :key="idx"
            class="w-7 h-7 md:w-10 md:h-10 bg-[#e8e4d9] rounded-md shadow-[2px_3px_0px_#8a7f6c,inset_-1px_-2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center relative border border-[#d3cebe]"
          >
            <!-- Dot rendering based on value -->
            <div v-if="val === 1" class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
            <div v-else-if="val === 2" class="w-full h-full p-1.5 md:p-2 flex flex-col justify-between items-center">
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full self-end shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full self-start shadow-inner"></div>
            </div>
            <div v-else-if="val === 3" class="w-full h-full p-1.5 md:p-2 flex flex-col justify-between items-center">
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full self-end shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full self-start shadow-inner"></div>
            </div>
            <div v-else-if="val === 4" class="w-full h-full p-1.5 md:p-2 grid grid-cols-2 gap-1 place-items-center">
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
            </div>
            <div v-else-if="val === 5" class="w-full h-full p-1.5 md:p-2 grid grid-cols-2 gap-1 place-items-center relative">
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
            </div>
            <div v-else-if="val === 6" class="w-full h-full p-1 md:p-1.5 grid grid-cols-2 gap-0.5 place-items-center">
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
              <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2c2620] rounded-full shadow-inner"></div>
            </div>
          </div>
        </template>
        <!-- Placeholder for hidden dice -->
        <template v-else-if="diceCount > 0">
           <div 
            v-for="n in diceCount" 
            :key="'hidden-'+n"
            class="w-7 h-7 md:w-10 md:h-10 bg-[#e8e4d9] rounded-md shadow-[2px_3px_0px_#8a7f6c,inset_-1px_-2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center opacity-80 border border-[#d3cebe]"
          >
            <span class="text-slate-500 font-black text-xs md:text-sm drop-shadow-sm">?</span>
          </div>
        </template>
        <template v-else>
           <div class="bg-red-900/90 text-red-200 border-2 border-red-950 font-bold px-3 py-1 rounded-sm shadow-[0_4px_0px_#450a0a] transform -rotate-12">
             ELIMINADO
           </div>
        </template>
      </div>

      <!-- The Leather Cup -->
      <div 
        v-if="diceCount > 0"
        class="absolute bottom-0 left-0 w-full h-full transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] z-10 origin-bottom"
        :class="{ 
          '-translate-y-20 md:-translate-y-28 rotate-[-8deg]': (isLocal && (isHovered || isRevealed)) || forceReveal,
          'border-x-4 border-t-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]': isCurrentTurn
        }"
        style="
          background: linear-gradient(160deg, #6e4324 0%, #4a2b15 60%, #2f1a0b 100%);
          border-radius: 8px 8px 30px 30px;
          box-shadow: 
            inset -6px -6px 20px rgba(0,0,0,0.7),
            inset 6px 6px 12px rgba(255,255,255,0.05),
            -5px 15px 25px rgba(0,0,0,0.5),
            -2px 5px 10px rgba(0,0,0,0.4);
        "
      >
        <!-- Cup rim -->
        <div class="absolute top-0 left-0 w-full h-3 md:h-4 bg-[#2a170b] rounded-t-md border-b border-[#4a2e19] shadow-inner"></div>
        <!-- Leather stitching decorative lines -->
        <div class="absolute top-8 left-3 right-3 h-0 border-t-2 border-dotted border-[#9c6a46] opacity-40"></div>
        <div class="absolute bottom-10 left-5 right-5 h-0 border-t-2 border-dotted border-[#9c6a46] opacity-40"></div>
        <!-- Scratch mark detail -->
        <div class="absolute top-1/2 left-1/4 w-1/4 h-0.5 bg-black/30 transform rotate-12 rounded"></div>
        <div class="absolute top-1/2 left-1/4 w-1/6 h-0.5 bg-[#8a5f3e]/20 transform rotate-12 -translate-y-0.5 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  playerName: string;
  diceCount: number;
  diceValues?: number[];
  isLocal?: boolean;
  isCurrentTurn?: boolean;
  forceReveal?: boolean;
}>();

const isHovered = ref(false);
const isRevealed = ref(false);

const toggleReveal = () => {
  if (props.isLocal) {
    isRevealed.value = !isRevealed.value;
  }
};
</script>
