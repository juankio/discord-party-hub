<script setup lang="ts">
defineProps<{
  fig: { id: string; icon: string; label: string; theme: string };
  isChosenByMe: boolean;
  chosenByPlayer?: { color: string; nickname: string };
}>();

defineEmits<{
  (e: 'select'): void;
}>();
</script>

<template>
  <button
    :id="`fig-${fig.id}`"
    class="figure-card group relative h-36 sm:h-44 md:h-48 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 overflow-hidden outline-none focus:outline-none"
    :class="[
      chosenByPlayer
        ? 'opacity-60 cursor-not-allowed scale-[0.98] grayscale-[20%] bg-[#8b5a2b] shadow-inner border-4 border-[#5c3a21]' 
        : 'hover:-translate-y-2 hover:scale-[1.02] cursor-pointer shadow-[0_8px_0_rgba(92,58,33,0.8)] hover:shadow-[0_12px_0_rgba(92,58,33,1)]',
      !chosenByPlayer && !isChosenByMe 
        ? 'bg-[#b48554] border-4 border-[#d4a373] hover:border-[#fff4e6]' 
        : (!chosenByPlayer ? 'bg-[#b48554] border-4 border-[#d4a373]' : '')
    ]"
    @click="$emit('select')"
  >
    <!-- Subtle wood texture overlay -->
    <div class="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none mix-blend-overlay"></div>

    <!-- Dynamic Glow per figure -->
    <div 
      v-if="!chosenByPlayer && !isChosenByMe"
      class="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-gradient-to-b mix-blend-screen"
      :class="fig.theme"
    ></div>
    
    <!-- Background solid color when chosen -->
    <div 
      v-if="chosenByPlayer"
      class="absolute inset-0 opacity-20"
      :style="{ backgroundColor: chosenByPlayer.color }"
    ></div>

    <!-- Pro Line sweep effect on hover -->
    <div class="pro-line hidden sm:block absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"></div>

    <!-- Icon container (Wood piece) -->
    <div class="relative mb-3 sm:mb-4 bg-gradient-to-b from-[#4a3222] to-[#2a1a0f] p-3 sm:p-4 rounded-full border border-[#5c3a21] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.05)] transition-transform duration-300 group-hover:scale-110">
      <UIcon 
        :name="fig.icon" 
        class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-2xl transition-colors duration-300"
        :class="chosenByPlayer ? 'text-white' : 'text-[#e6a15c] group-hover:text-white'"
        :style="chosenByPlayer ? { color: chosenByPlayer.color, filter: `drop-shadow(0 0 12px ${chosenByPlayer.color})` } : {}"
      />
    </div>
    
    <span 
      class="text-sm sm:text-base md:text-lg font-black tracking-widest transition-colors duration-300 uppercase z-10 drop-shadow-sm"
      :class="chosenByPlayer ? 'text-white' : 'text-[#4a2e1b] group-hover:text-[#2a1a0f]'"
      :style="chosenByPlayer ? { color: chosenByPlayer.color, textShadow: `0 2px 4px rgba(0,0,0,0.8)` } : {}"
    >
      {{ fig.label }}
    </span>

    <!-- Badge for player who selected -->
    <div 
      v-if="chosenByPlayer"
      class="absolute bottom-0 inset-x-0 w-full h-8 sm:h-10 text-xs sm:text-sm font-black text-center px-2 sm:px-3 backdrop-blur-md border-t-2 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center overflow-hidden"
      :style="{ 
        backgroundColor: `${chosenByPlayer.color}40`, 
        color: '#ffffff',
        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        borderColor: `${chosenByPlayer.color}80`
      }"
    >
      <span class="max-w-full overflow-hidden truncate text-ellipsis block">{{ chosenByPlayer.nickname }}</span>
    </div>
  </button>
</template>

<style scoped>
.pro-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: skewX(-25deg);
  transition: all 0.7s ease;
}

.figure-card:not(.cursor-not-allowed):hover .pro-line::after {
  left: 150%;
  transition: all 0.7s ease;
}
</style>
