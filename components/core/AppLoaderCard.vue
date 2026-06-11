<template>
  <div class="traveling-card w-14 h-20 sm:w-20 sm:h-28 absolute top-0 left-0 preserve-3d will-change-transform" style="transform-origin: center center;">
    <div class="uno-card absolute inset-0 rounded-xl border-4 border-white flex flex-col items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.8)] will-change-transform backface-hidden"
         :class="currentCardClass"
         :style="{ boxShadow: `0 0 30px ${currentCardColor}` }">
      
      <div class="w-full h-full p-1.5 flex items-center justify-center">
         <div class="inner-oval w-full h-full rounded-full bg-white flex items-center justify-center transform -rotate-12 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <span class="text-lg sm:text-2xl font-black italic tracking-tighter" :class="currentTextClass">UNO</span>
         </div>
      </div>
      
      <div class="absolute top-1 left-1.5 text-white font-black text-[10px] italic">O</div>
      <div class="absolute bottom-1 right-1.5 text-white font-black text-[10px] italic rotate-180">O</div>
    </div>

    <!-- Reverso de la carta -->
    <div class="absolute inset-0 bg-[#111] rounded-xl border-4 border-white flex flex-col items-center justify-center rotate-y-180 backface-hidden" style="transform: rotateY(180deg);">
      <div class="w-full h-full p-1.5 flex items-center justify-center">
         <div class="w-full h-full rounded-full bg-red-600 flex items-center justify-center transform -rotate-12 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] border-2 border-yellow-500">
            <span class="text-sm font-black italic tracking-tighter text-yellow-400 drop-shadow-md">UNO</span>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  currentCardClass: { type: String, required: true },
  currentTextClass: { type: String, required: true },
  currentCardColor: { type: String, required: true }
})
</script>

<style scoped>
.preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.traveling-card {
  margin-top: -3.5rem; 
  margin-left: -2.5rem;
}

@media (max-width: 639px) {
  .traveling-card {
    margin-top: -3rem; 
    margin-left: -2rem; 
  }
}
</style>
