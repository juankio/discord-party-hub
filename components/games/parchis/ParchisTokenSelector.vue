<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import anime from 'animejs';
import ParchisTokenCard from './ParchisTokenCard.vue';

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
    anime({ targets: modalRef.value, opacity: [0, 1], scale: [0.95, 1], duration: 800, easing: 'easeOutExpo' });
    anime({ targets: '.anim-header', translateY: [-20, 0], opacity: [0, 1], delay: anime.stagger(150), duration: 800, easing: 'easeOutCirc' });
    anime({ targets: '.figure-card', translateY: [40, 0], opacity: [0, 1], scale: [0.8, 1], delay: anime.stagger(100, { start: 300 }), duration: 1000, easing: 'easeOutElastic(1.2, 0.7)' });
  }
});

const myPlayerInfo = computed(() => props.players.find(p => p.userId === props.myUserId));
const getPlayerWhoChose = (figureId: string) => props.players.find(p => p.selectedFigure === figureId);

const handleSelect = (figureId: string) => {
  if (getPlayerWhoChose(figureId)) return;
  if (myPlayerInfo.value?.hasChosenFigure) return;
  
  anime({ targets: `#fig-${figureId}`, scale: [0.9, 1.05, 1], duration: 600, easing: 'easeOutElastic(1.5, 0.5)' });
  emit('select_figure', figureId);
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
    <div class="absolute inset-0 bg-[#0f0805]/80 backdrop-blur-md animate-pulse-slow pointer-events-none"></div>
    
    <div ref="modalRef" class="relative w-full max-w-5xl rounded-[2.5rem] bg-[#8b5a2b] border-4 border-[#5c3a21] shadow-[0_20px_0_rgba(26,15,8,0.8),0_40px_80px_rgba(0,0,0,0.8)] p-2 sm:p-3">
      <div class="relative w-full h-full bg-[#2a1a0f] rounded-2xl sm:rounded-[2rem] overflow-hidden flex flex-col items-center p-6 sm:p-10 md:p-16 shadow-inner">
      
        <!-- Top Neon Glows & Wood screws -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[4px] bg-gradient-to-r from-transparent via-[#e6a15c]/50 to-transparent rounded-b-full"></div>
        <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#e6a15c]/10 blur-[100px] rounded-full pointer-events-none"></div>
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

        <!-- Token Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 md:gap-8 w-full max-w-5xl relative z-10">
          <ParchisTokenCard
            v-for="fig in figures"
            :key="fig.id"
            :fig="fig"
            :isChosenByMe="!!myPlayerInfo?.hasChosenFigure"
            :chosenByPlayer="getPlayerWhoChose(fig.id) as any"
            @select="handleSelect(fig.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>
