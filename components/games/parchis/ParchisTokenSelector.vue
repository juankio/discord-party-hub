<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import anime from 'animejs';

interface ParchisPlayer {
  userId: string;
  nickname: string;
  color: string;
  selectedFigure?: string;
  hasChosenFigure: boolean;
}

const props = defineProps<{
  players: ParchisPlayer[];
  myUserId: string;
}>();

const emit = defineEmits<{
  (e: 'select_figure', figureId: string): void;
}>();

const figures = [
  { id: 'dog', icon: 'i-lucide-dog', label: 'Perro', theme: 'from-orange-500 to-amber-500' },
  { id: 'car', icon: 'i-lucide-car', label: 'Auto', theme: 'from-blue-500 to-cyan-500' },
  { id: 'hat', icon: 'i-lucide-hard-hat', label: 'Casco', theme: 'from-yellow-400 to-yellow-600' },
  { id: 'boat', icon: 'i-lucide-sailboat', label: 'Barco', theme: 'from-sky-400 to-blue-600' },
  { id: 'gem', icon: 'i-lucide-gem', label: 'Gema', theme: 'from-purple-500 to-fuchsia-500' },
  { id: 'wood', icon: 'i-lucide-trees', label: 'Madera', theme: 'from-emerald-500 to-green-600' },
  { id: 'ghost', icon: 'i-lucide-ghost', label: 'Fantasma', theme: 'from-slate-300 to-slate-500' },
  { id: 'rocket', icon: 'i-lucide-rocket', label: 'Cohete', theme: 'from-rose-500 to-pink-600' },
  { id: 'crown', icon: 'i-lucide-crown', label: 'Corona', theme: 'from-yellow-300 to-amber-500' },
  { id: 'sword', icon: 'i-lucide-sword', label: 'Espada', theme: 'from-zinc-400 to-zinc-600' }
];

const modalRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (modalRef.value) {
    // Backdrop blur & modal container in
    anime({
      targets: modalRef.value,
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 800,
      easing: 'easeOutExpo'
    });
    
    // Header elements
    anime({
      targets: '.anim-header',
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(150),
      duration: 800,
      easing: 'easeOutCirc'
    });
    
    // Tokens entrance - Elastic stagger
    anime({
      targets: '.figure-card',
      translateY: [40, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      delay: anime.stagger(100, { start: 300 }),
      duration: 1000,
      easing: 'easeOutElastic(1.2, 0.7)'
    });
  }
});

const myPlayerInfo = computed(() => {
  return props.players.find(p => p.userId === props.myUserId);
});

const getPlayerWhoChose = (figureId: string) => {
  return props.players.find(p => p.selectedFigure === figureId);
};

const handleSelect = (figureId: string) => {
  if (getPlayerWhoChose(figureId)) return;
  if (myPlayerInfo.value?.hasChosenFigure) return;
  
  // Micro-interaction on click
  anime({
    targets: `#fig-${figureId}`,
    scale: [0.9, 1.05, 1],
    duration: 600,
    easing: 'easeOutElastic(1.5, 0.5)'
  });
  
  emit('select_figure', figureId);
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
    <!-- Blurry dark overlay with subtle pulse -->
    <div class="absolute inset-0 bg-[#0f0805]/80 backdrop-blur-md animate-pulse-slow pointer-events-none"></div>
    
    <div ref="modalRef" class="relative w-full max-w-5xl rounded-[2.5rem] bg-[#8b5a2b] border-4 border-[#5c3a21] shadow-[0_20px_0_rgba(26,15,8,0.8),0_40px_80px_rgba(0,0,0,0.8)] p-2 sm:p-3">
      <div class="relative w-full h-full bg-[#2a1a0f] rounded-2xl sm:rounded-[2rem] overflow-hidden flex flex-col items-center p-6 sm:p-10 md:p-16 shadow-inner">
      
      <!-- Top Neon Glows -> Wooden accents -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[4px] bg-gradient-to-r from-transparent via-[#e6a15c]/50 to-transparent rounded-b-full"></div>
      <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#e6a15c]/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <!-- Wood screws in corners -->
      <div class="absolute top-6 left-6 w-4 h-4 rounded-full bg-[#1a0f08] border-2 border-[#3e2723] flex items-center justify-center shadow-inner hidden sm:flex"><div class="w-full h-[2px] bg-[#3e2723] rotate-45"></div></div>
      <div class="absolute top-6 right-6 w-4 h-4 rounded-full bg-[#1a0f08] border-2 border-[#3e2723] flex items-center justify-center shadow-inner hidden sm:flex"><div class="w-full h-[2px] bg-[#3e2723] -rotate-45"></div></div>
      <div class="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-[#1a0f08] border-2 border-[#3e2723] flex items-center justify-center shadow-inner hidden sm:flex"><div class="w-full h-[2px] bg-[#3e2723] rotate-12"></div></div>
      <div class="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-[#1a0f08] border-2 border-[#3e2723] flex items-center justify-center shadow-inner hidden sm:flex"><div class="w-full h-[2px] bg-[#3e2723] -rotate-12"></div></div>

      <!-- Header -->
      <div class="text-center mb-10 sm:mb-16 relative z-10 w-full">
        <h2 class="anim-header text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff4e6] to-[#e6a15c] tracking-tighter mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] uppercase">
          Selecciona tu ficha
        </h2>
        <p class="anim-header text-[#a88a70] text-base sm:text-lg md:text-xl font-bold tracking-wide">
          <span v-if="myPlayerInfo?.hasChosenFigure" class="text-emerald-400 font-black flex flex-col sm:flex-row items-center justify-center gap-2 drop-shadow-md bg-[#0a1a0f]/50 py-2 sm:py-2 px-4 sm:px-6 rounded-2xl sm:rounded-full inline-flex border border-emerald-500/20 shadow-[inset_0_2px_10px_rgba(16,185,129,0.1)] text-center text-sm sm:text-base max-w-full">
            <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span>¡Ficha asegurada! <br class="sm:hidden" />Esperando rivales...</span>
          </span>
          <span v-else class="bg-[#2a1a0f]/50 py-2 px-4 sm:px-6 rounded-2xl sm:rounded-full inline-flex border border-[#3e2723] shadow-inner text-center text-sm sm:text-base max-w-full">
            Escoge un avatar para dominar el tablero.
          </span>
        </p>
      </div>

      <!-- Token Grid - Fully Responsive -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 md:gap-8 w-full max-w-5xl relative z-10">
        <button
          v-for="fig in figures"
          :id="`fig-${fig.id}`"
          :key="fig.id"
          class="figure-card group relative h-36 sm:h-44 md:h-48 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 overflow-hidden outline-none focus:outline-none"
          :class="[
            getPlayerWhoChose(fig.id) 
              ? 'opacity-60 cursor-not-allowed scale-[0.98] grayscale-[20%] bg-[#8b5a2b] shadow-inner border-4 border-[#5c3a21]' 
              : 'hover:-translate-y-2 hover:scale-[1.02] cursor-pointer shadow-[0_8px_0_rgba(92,58,33,0.8)] hover:shadow-[0_12px_0_rgba(92,58,33,1)]',
            !getPlayerWhoChose(fig.id) && !myPlayerInfo?.hasChosenFigure 
              ? 'bg-[#b48554] border-4 border-[#d4a373] hover:border-[#fff4e6]' 
              : (!getPlayerWhoChose(fig.id) ? 'bg-[#b48554] border-4 border-[#d4a373]' : '')
          ]"
          @click="handleSelect(fig.id)"
        >
          <!-- Subtle wood texture overlay -->
          <div class="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none mix-blend-overlay"></div>

          <!-- Dynamic Glow per figure -->
          <div 
            class="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-gradient-to-b mix-blend-screen"
            :class="fig.theme"
            v-if="!getPlayerWhoChose(fig.id) && !myPlayerInfo?.hasChosenFigure"
          ></div>
          
          <!-- Background solid color when chosen -->
          <div 
            v-if="getPlayerWhoChose(fig.id)"
            class="absolute inset-0 opacity-20"
            :style="{ backgroundColor: getPlayerWhoChose(fig.id)?.color }"
          ></div>

          <!-- Pro Line sweep effect on hover -->
          <div class="pro-line hidden sm:block absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"></div>

          <!-- Icon container (Wood piece) -->
          <div class="relative mb-3 sm:mb-4 bg-gradient-to-b from-[#4a3222] to-[#2a1a0f] p-3 sm:p-4 rounded-full border border-[#5c3a21] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.05)] transition-transform duration-300 group-hover:scale-110">
            <UIcon 
              :name="fig.icon" 
              class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-2xl transition-colors duration-300"
              :class="getPlayerWhoChose(fig.id) ? 'text-white' : 'text-[#e6a15c] group-hover:text-white'"
              :style="getPlayerWhoChose(fig.id) ? { color: getPlayerWhoChose(fig.id)?.color, filter: `drop-shadow(0 0 12px ${getPlayerWhoChose(fig.id)?.color})` } : {}"
            />
          </div>
          
          <span 
            class="text-sm sm:text-base md:text-lg font-black tracking-widest transition-colors duration-300 uppercase z-10 drop-shadow-sm"
            :class="getPlayerWhoChose(fig.id) ? 'text-white' : 'text-[#4a2e1b] group-hover:text-[#2a1a0f]'"
            :style="getPlayerWhoChose(fig.id) ? { color: getPlayerWhoChose(fig.id)?.color, textShadow: `0 2px 4px rgba(0,0,0,0.8)` } : {}"
          >
            {{ fig.label }}
          </span>

          <!-- Badge for player who selected -->
          <div 
            v-if="getPlayerWhoChose(fig.id)"
            class="absolute bottom-0 inset-x-0 w-full h-8 sm:h-10 text-xs sm:text-sm font-black text-center px-2 sm:px-3 backdrop-blur-md border-t-2 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center overflow-hidden"
            :style="{ 
              backgroundColor: `${getPlayerWhoChose(fig.id)?.color}40`, 
              color: '#ffffff',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              borderColor: `${getPlayerWhoChose(fig.id)?.color}80`
            }"
          >
            <span class="max-w-full overflow-hidden truncate text-ellipsis block">{{ getPlayerWhoChose(fig.id)?.nickname }}</span>
          </div>
        </button>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Linear/Vercel style pro line sweep */
.pro-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: skewX(-25deg);
  transition: all 0.7s ease;
}

.figure-card:not(.cursor-not-allowed):hover .pro-line::after {
  left: 150%;
  transition: all 0.7s ease;
}
</style>
