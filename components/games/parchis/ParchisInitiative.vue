<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useParchisStore } from '~/stores/games/parchisStore';
import { usePlayerStore } from '~/stores/playerStore';
import { useSocket } from '~/composables/useSocket';
import anime from 'animejs';

const parchisStore = useParchisStore();
const playerStore = usePlayerStore();
const { socket } = useSocket();

const props = defineProps<{
  players: any[]
}>();

const hasRolled = computed(() => {
  return parchisStore.initiativeRolls[playerStore.userId] !== undefined;
});

const myRoll = computed(() => {
  return parchisStore.initiativeRolls[playerStore.userId];
});

let introTimeline: anime.AnimeTimelineInstance | null = null;

const rollInitiative = () => {
  if (socket.value && !hasRolled.value) {
    // Adding a subtle click animation to the button
    anime({
      targets: '.roll-btn',
      scale: [0.95, 1],
      duration: 300,
      easing: 'easeOutElastic(1, .6)'
    });
    socket.value.emit("parchis:roll_initiative");
  }
};

const hoverCard = (e: MouseEvent, index: number) => {
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

onMounted(() => {
  // Modal Entrance Animation (Accelerated & Snappy)
  introTimeline = anime.timeline()
    .add({
      targets: '.initiative-overlay',
      opacity: [0, 1],
      duration: 300,
      easing: 'linear'
    })
    .add({
      targets: '.initiative-modal',
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.95, 1],
      duration: 400,
      easing: 'easeOutExpo'
    }, '-=200')
    .add({
      targets: '.initiative-title',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 300,
      easing: 'easeOutExpo'
    }, '-=300')
    .add({
      targets: '.player-card',
      opacity: [0, 1],
      translateY: [15, 0],
      delay: anime.stagger(50),
      duration: 400,
      easing: 'easeOutBack(1.2)'
    }, '-=300')
    .add({
      targets: '.roll-action',
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 300,
      easing: 'easeOutBack(1.2)'
    }, '-=300');
});

onUnmounted(() => {
  if (introTimeline) introTimeline.pause();
  anime.remove('.initiative-overlay');
  anime.remove('.initiative-modal');
  anime.remove('.initiative-title');
  anime.remove('.player-card');
  anime.remove('.roll-action');
  anime.remove('.roll-btn');
});
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 initiative-overlay bg-[#1a0f0a]/80 backdrop-blur-2xl opacity-0">
    <!-- Main Modal (Glassmorphism Pro Max) -->
    <div 
      class="initiative-modal opacity-0 relative w-full max-w-3xl bg-[#2a1a0f]/80 border border-amber-900/50 rounded-[2rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(245,158,11,0.05)] flex flex-col items-center overflow-hidden"
      style="perspective: 1500px;"
    >
      
      <!-- Ambient Glows -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full"></div>
      <div class="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] pointer-events-none rounded-full"></div>
      <div class="absolute top-0 right-0 w-[500px] h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      
      <div class="initiative-title opacity-0 w-full flex flex-col items-center">
        <h2 class="relative z-10 text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-orange-500 mb-2 text-center drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] uppercase">
          Iniciativa
        </h2>
        <p class="relative z-10 text-amber-200/70 mb-10 text-center text-sm md:text-base font-light tracking-wide max-w-md">
          El azar decidirá tu destino. Lanza los dados para establecer el orden de selección de asientos.
        </p>
      </div>

      <!-- Grid of players -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full mb-12 relative z-10 perspective-[1000px]">
        <div 
          v-for="(player, index) in players" 
          :key="player.userId"
          class="player-card opacity-0 flex flex-col items-center gap-4 relative"
          @mousemove="hoverCard($event, index)"
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
      </div>

      <!-- Action Button -->
      <div class="roll-action opacity-0 relative z-10 w-full flex justify-center mt-4">
        <button 
          v-if="!hasRolled"
          @click="rollInitiative"
          class="roll-btn group relative px-12 py-5 bg-amber-700/20 hover:bg-amber-600/30 rounded-2xl font-black text-lg text-white transition-all duration-300 overflow-hidden border border-amber-500/50 hover:border-amber-400 backdrop-blur-md"
        >
          <!-- Button Glows -->
          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-400/20 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
          
          <div class="flex items-center gap-3 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            <UIcon name="i-game-icons-dice-six-faces-three" class="w-7 h-7 text-amber-300 group-hover:text-white transition-colors duration-300" />
            <span class="tracking-widest uppercase">Tirar Dados</span>
          </div>
          
          <!-- Outer Glow -->
          <div class="absolute -inset-1 bg-amber-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10"></div>
        </button>
        
        <div v-else class="px-10 py-5 bg-orange-900/20 border border-orange-500/20 backdrop-blur-md rounded-2xl flex flex-col items-center shadow-[inset_0_0_20px_rgba(249,115,22,0.1)] relative">
          <div class="absolute top-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
          <span class="text-orange-300 font-bold text-lg mb-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">¡Sacaste un {{ myRoll }}!</span>
          <span class="text-amber-100/40 text-xs tracking-wider uppercase font-medium">Esperando al resto...</span>
        </div>
      </div>
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