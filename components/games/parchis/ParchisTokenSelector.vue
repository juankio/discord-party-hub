<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import anime from 'animejs';

interface ParchisPlayer {
  userId: string;
  username: string;
  color: string;
  figureId?: string;
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
  { id: 'dog', icon: 'i-lucide-dog', label: 'Perro' },
  { id: 'car', icon: 'i-lucide-car', label: 'Auto' },
  { id: 'hat', icon: 'i-lucide-hard-hat', label: 'Sombrero' },
  { id: 'boat', icon: 'i-lucide-sailboat', label: 'Barco' },
  { id: 'gem', icon: 'i-lucide-gem', label: 'Gema' },
  { id: 'wood', icon: 'i-lucide-trees', label: 'Madera' },
];

const modalRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (modalRef.value) {
    anime({
      targets: modalRef.value,
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    });
    
    anime({
      targets: '.figure-btn',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100, { start: 200 }),
      duration: 600,
      easing: 'easeOutQuint'
    });
  }
});

const myPlayerInfo = computed(() => {
  return props.players.find(p => p.userId === props.myUserId);
});

const getPlayerWhoChose = (figureId: string) => {
  return props.players.find(p => p.figureId === figureId);
};

const handleSelect = (figureId: string) => {
  if (getPlayerWhoChose(figureId)) return; // Already taken
  if (myPlayerInfo.value?.hasChosenFigure) return; // I already chose
  emit('select_figure', figureId);
};
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div ref="modalRef" class="bg-gray-900/60 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-hidden relative">
      <!-- Glow effect behind -->
      <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none rounded-3xl"></div>
      
      <div class="relative z-10">
        <div class="text-center mb-10">
          <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 tracking-wider">
            ELIGE TU FICHA
          </h2>
          <p class="text-gray-400 mt-2">
            Selecciona tu token para la partida. 
            <span v-if="myPlayerInfo?.hasChosenFigure" class="text-orange-400 font-bold block mt-1">
              ¡Ya estás listo para jugar!
            </span>
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <button
            v-for="fig in figures"
            :key="fig.id"
            class="figure-btn group relative h-32 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden"
            :class="[
              getPlayerWhoChose(fig.id) 
                ? 'opacity-50 cursor-not-allowed grayscale' 
                : 'hover:-translate-y-2 hover:shadow-xl cursor-pointer',
              !getPlayerWhoChose(fig.id) && !myPlayerInfo?.hasChosenFigure 
                ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20' 
                : 'bg-black/40 border border-transparent'
            ]"
            @click="handleSelect(fig.id)"
          >
            <!-- Background glow for the chosen figure based on player color -->
            <div 
              v-if="getPlayerWhoChose(fig.id)"
              class="absolute inset-0 opacity-20"
              :style="{ backgroundColor: getPlayerWhoChose(fig.id)?.color }"
            ></div>

            <UIcon 
              :name="fig.icon" 
              class="w-12 h-12 mb-3 transition-transform duration-300 group-hover:scale-110"
              :class="getPlayerWhoChose(fig.id) ? 'text-white' : 'text-gray-300 group-hover:text-white'"
              :style="getPlayerWhoChose(fig.id) ? { color: getPlayerWhoChose(fig.id)?.color } : {}"
            />
            
            <span 
              class="text-sm font-semibold tracking-wide transition-colors duration-300"
              :class="getPlayerWhoChose(fig.id) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'"
              :style="getPlayerWhoChose(fig.id) ? { color: getPlayerWhoChose(fig.id)?.color } : {}"
            >
              {{ fig.label }}
            </span>

            <!-- Badge for who chose it -->
            <div 
              v-if="getPlayerWhoChose(fig.id)"
              class="absolute bottom-2 inset-x-2 rounded-lg py-1 text-xs font-bold text-center truncate px-2 border"
              :style="{ 
                backgroundColor: `${getPlayerWhoChose(fig.id)?.color}20`, 
                color: getPlayerWhoChose(fig.id)?.color,
                borderColor: `${getPlayerWhoChose(fig.id)?.color}40`
              }"
            >
              {{ getPlayerWhoChose(fig.id)?.username }}
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Pro lines and premium glow */
.figure-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transform: skewX(-20deg);
  transition: 0.5s;
}

.figure-btn:not(.cursor-not-allowed):hover::before {
  left: 200%;
}
</style>
