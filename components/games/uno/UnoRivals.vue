<template>
  <!-- Absolute overlay for Rivals to use the whole screen width and height -->
  <div class="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-hidden">
    <div 
      v-for="(rival, index) in rivals" 
      :id="`rival-avatar-${rival.userId}`" 
      :key="rival.userId" 
      class="flex flex-col items-center pointer-events-auto transition-all duration-500"
      :style="getRivalPosition(index, rivals.length)"
    >
      <!-- Avatar -->
      <div
        class="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10 transition-colors"
        :style="{ borderColor: rival.color || '#f97316', color: rival.color || '#f97316' }"
        :class="{'neon-glow': currentTurnUserId === rival.userId}"
      >
        <!-- Overlay Offline -->
        <div v-if="rival.isOffline" class="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center z-30 backdrop-blur-[2px]">
          <UIcon name="i-lucide-wifi-off" class="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 animate-pulse" />
        </div>
        <span v-if="rival.isOffline" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-orange-400 bg-black/90 px-2 py-0.5 rounded border border-orange-500/50 whitespace-nowrap animate-pulse z-40">
          Desconectado
        </span>
        <img :src="`/avatars/avatar-${rival.avatarId}.svg?v=2`" class="w-full h-full object-cover rounded-full bg-[#151515]" :class="{'grayscale opacity-50': rival.isOffline}">
        
        <!-- Mini Cards Hand -->
        <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 flex justify-center w-max pointer-events-none">
          <div class="flex -space-x-2">
            <!-- Renderizamos las cartas y añadimos la clase de animación 'hover-bump' si coincide con el índice -->
            <div
              v-for="n in Math.min(rival.cardCount, 8)" :key="n" 
              class="w-3 h-5 sm:w-4 sm:h-6 bg-gray-800 border border-gray-500 rounded-[2px] shadow-md transform rotate-[-5deg] transition-transform duration-200"
              :class="{'translate-y-[-10px] scale-110 z-20': useUnoStore().rivalHoverIndex[rival.userId] === (n - 1)}"
            >
              <div
                class="w-full h-full bg-red-800 rounded-[2px] opacity-80" 
                style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 2px);"
              />
            </div>
            <div v-if="rival.cardCount > 8" class="w-3 h-5 sm:w-4 sm:h-6 bg-black border border-gray-500 rounded-[2px] flex items-center justify-center text-[8px] font-bold text-white z-10 -ml-1">
              +
            </div>
          </div>
        </div>
      </div>

      <span class="mt-5 text-xs sm:text-sm font-bold text-gray-300 drop-shadow-md whitespace-nowrap">{{ rival.nickname }}</span>
      
      <!-- Botón de Denuncia -->
      <UButton
        v-if="rival.cardCount === 1 && !rival.hasYelledUno" 
        size="2xs" color="red" class="absolute -bottom-6 whitespace-nowrap animate-bounce z-20"
        @click="$emit('challenge', rival.userId)"
      >
        ¡Denunciar!
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUnoStore } from '~/stores/games/unoStore'

defineProps({
  rivals: { type: Array as () => any[], required: true },
  currentTurnUserId: { type: String, required: true }
})

defineEmits(['challenge'])

const getRivalPosition = (index: number, total: number) => {
  if (total === 1) return { top: '15vh', left: '50vw', transform: 'translate(-50%, -50%)', position: 'absolute' };
  
  let startAngle = 180;
  let endAngle = 0;

  if (total === 2) {
    startAngle = 150;
    endAngle = 30;
  } else if (total === 3) {
    startAngle = 160;
    endAngle = 20;
  } else if (total === 4) {
    startAngle = 165;
    endAngle = 15;
  } else if (total === 5) {
    startAngle = 170;
    endAngle = 10;
  } else if (total === 6) {
    startAngle = 175;
    endAngle = 5;
  } else {
    // 7 rivales u otros
    startAngle = 200;
    endAngle = -20;
  }

  const angleDeg = startAngle - (index / (total - 1)) * (startAngle - endAngle);
  const angleRad = angleDeg * (Math.PI / 180);

  // Ampliamos un poco el radio X para usar más pantalla
  const radiusX = 46; 
  // Reducimos el Y y subimos el centro para no tapar la mesa
  const radiusY = 24; 
  const centerX = 50; 
  const centerY = 32; 

  const x = centerX + radiusX * Math.cos(angleRad);
  const y = centerY - radiusY * Math.sin(angleRad);

  return {
    top: `calc(${y}vh + 10px)`, 
    left: `clamp(6%, ${x}vw, 94%)`, 
    transform: 'translate(-50%, -50%)',
    position: 'absolute'
  }
}
</script>

<style scoped>
.neon-glow {
  box-shadow: 0 0 20px currentColor, inset 0 0 10px currentColor;
  animation: pulse-glow 1.5s infinite alternate;
}
@keyframes pulse-glow {
  from { filter: drop-shadow(0 0 5px currentColor); }
  to { filter: drop-shadow(0 0 15px currentColor); }
}
</style>
