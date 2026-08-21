<script setup lang="ts">
import { useParchisStore } from '~/stores/games/parchisStore';
import { usePlayerStore } from '~/stores/playerStore';
import anime from 'animejs';

const parchisStore = useParchisStore();
const playerStore = usePlayerStore();

const props = defineProps<{
  player: any;
  index: number;
}>();

const hoverCard = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = ((y - centerY) / centerY) * -15;
  const rotateY = ((x - centerX) / centerX) * 15;
  
  anime({
    targets: el,
    rotateX: rotateX,
    rotateY: rotateY,
    scale: 1.05,
    duration: 300,
    easing: 'easeOutQuad'
  });
};

const leaveCard = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  anime({
    targets: el,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: 500,
    easing: 'easeOutElastic(1, .5)'
  });
};
</script>

<template>
  <div 
    class="player-card opacity-0 flex flex-col items-center gap-4 relative"
    @mousemove="hoverCard($event)"
    @mouseleave="leaveCard"
    style="transform-style: preserve-3d;"
  >
    <!-- "TÚ" Indicator -->
    <div 
      v-if="player.userId === playerStore.userId"
      class="absolute -top-5 z-20 px-4 py-1 bg-amber-700/80 backdrop-blur-md text-white text-[10px] font-bold tracking-widest rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-400/30 uppercase"
      style="transform: translateZ(30px);"
    >
      Tú
    </div>

    <div class="relative group" style="transform-style: preserve-3d;">
      <!-- Avatar Ring/Halo Effect -->
      <div 
        class="absolute inset-[-4px] rounded-[1.25rem] opacity-70 blur-[8px] transition-all duration-700"
        :class="[
          parchisStore.initiativeRolls[player.userId] ? 'bg-orange-500' : (player.userId === playerStore.userId ? 'bg-amber-500 animate-pulse' : 'bg-transparent')
        ]"
        style="transform: translateZ(-10px);"
      ></div>

      <!-- Avatar Container -->
      <div 
        class="relative w-24 h-24 md:w-28 md:h-28 rounded-[1.25rem] bg-[#3e2716]/60 backdrop-blur-md border border-amber-900/50 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-500"
        :class="[
          parchisStore.initiativeRolls[player.userId] ? 'border-orange-500/50' : 'group-hover:border-amber-500/30',
        ]"
        style="transform: translateZ(20px);"
      >
        <img v-if="player.avatarId" :src="`/avatars/avatar-${player.avatarId}.svg`" alt="Avatar" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
        <UIcon v-else name="i-heroicons-user" class="w-10 h-10 text-amber-500/30" />

        <!-- Dice result overlay -->
        <div 
          v-if="parchisStore.initiativeRolls[player.userId]"
          class="absolute inset-0 bg-black/40 backdrop-blur-[4px] flex flex-col items-center justify-center"
        >
          <div class="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" style="transform: translateZ(40px);">
            {{ parchisStore.initiativeRolls[player.userId] }}
          </div>
        </div>
      </div>
      
      <!-- Status Icon -->
      <div 
        class="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center bg-[#2a1a0f]/90 backdrop-blur-md border border-amber-900/50 shadow-xl"
        style="transform: translateZ(35px);"
      >
        <UIcon v-if="parchisStore.initiativeRolls[player.userId]" name="i-heroicons-check" class="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
        <UIcon v-else name="i-heroicons-arrow-path" class="w-5 h-5 text-white/40 animate-spin-slow" />
      </div>
    </div>
    
    <div 
      class="text-center font-medium truncate w-full px-2 tracking-wide text-sm" 
      :class="player.userId === playerStore.userId ? 'text-amber-200' : 'text-amber-100/60'"
      style="transform: translateZ(20px);"
    >
      {{ player.nickname }}
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
