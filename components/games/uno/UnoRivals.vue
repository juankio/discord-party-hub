<template>
  <!-- Contenedor flex-1 para mantener la proporción de la pantalla, pero con overflow-hidden general -->
  <div class="flex-1 w-full relative z-10 pointer-events-none overflow-hidden">
    <!-- El contenedor que alinea a los rivales usa TODA la pantalla disponible, no solo la mitad superior -->
    <div class="absolute inset-0 w-full h-full flex items-center justify-center">
      <!-- max-w-screen-2xl limita lo ancho que pueden irse en monitores ultra-wide -->
      <div class="relative w-full max-w-screen-2xl h-full">
        <div 
          v-for="(rival, index) in rivals" 
          :id="`rival-avatar-${rival.userId}`" 
          :key="rival.userId" 
          class="flex flex-col items-center pointer-events-auto transition-all duration-500"
          :style="getRivalPosition(index, rivals.length)"
        >
          <!-- Avatar (Aumentado de tamaño) -->
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full border-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10 transition-colors"
            :style="{ borderColor: rival.color || '#f97316', color: rival.color || '#f97316' }"
            :class="{'neon-glow': currentTurnUserId === rival.userId}"
          >
            <!-- Overlay Offline -->
            <div v-if="rival.isOffline" class="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center z-30 backdrop-blur-[2px]">
              <UIcon name="i-lucide-wifi-off" class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-orange-500 animate-pulse" />
            </div>
            <span v-if="rival.isOffline" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-black text-orange-400 bg-black/90 px-2 py-0.5 rounded border border-orange-500/50 whitespace-nowrap animate-pulse z-40">
              Desconectado
            </span>
            <img :src="`/avatars/avatar-${rival.avatarId}.svg?v=2`" class="w-full h-full object-cover rounded-full bg-[#151515]" :class="{'grayscale opacity-50': rival.isOffline}">
            
            <!-- Mini Cards Hand (Aumentadas) -->
            <div class="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 flex justify-center w-max pointer-events-none">
              <div class="flex -space-x-3 sm:-space-x-4">
                <div
                  v-for="n in Math.min(rival.cardCount, 8)" :key="n" 
                  class="w-5 h-8 sm:w-6 sm:h-10 md:w-8 md:h-12 lg:w-10 lg:h-14 bg-gray-800 border border-gray-500 rounded-[3px] shadow-md transform rotate-[-5deg] transition-transform duration-200"
                  :class="{'translate-y-[-10px] scale-110 z-20': useUnoStore().rivalHoverIndex[rival.userId] === (n - 1)}"
                >
                  <div
                    class="w-full h-full bg-red-800 rounded-[2px] opacity-80" 
                    style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 2px);"
                  />
                </div>
                <div v-if="rival.cardCount > 8" class="w-5 h-8 sm:w-6 sm:h-10 md:w-8 md:h-12 lg:w-10 lg:h-14 bg-black border border-gray-500 rounded-[3px] flex items-center justify-center text-[10px] md:text-xs font-bold text-white z-10 -ml-2">
                  +
                </div>
              </div>
            </div>
          </div>

          <span class="mt-8 sm:mt-10 md:mt-12 text-sm md:text-base lg:text-lg font-bold text-gray-300 drop-shadow-md whitespace-nowrap">{{ rival.nickname }}</span>
          
          <!-- Botón de Denuncia -->
          <UButton
            v-if="rival.cardCount === 1 && !rival.hasYelledUno" 
            size="xs" color="red" class="absolute -bottom-10 whitespace-nowrap animate-bounce z-20"
            @click="$emit('challenge', rival.userId)"
          >
            ¡Denunciar!
          </UButton>
        </div>
      </div>
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
  // Ahora TODOS los cálculos de posición Y están referenciados al ALTO TOTAL de la pantalla,
  // con la mesa teóricamente sentada cerca del centro (50% vh).
  // La mitad superior libre real va del 0% al ~35% de la altura total de la pantalla.

  if (total === 1) return { top: '25%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' };
  
  if (total === 2) {
    return [
      { top: '25%', left: '25%', transform: 'translate(-50%, -50%)', position: 'absolute' },
      { top: '25%', left: '75%', transform: 'translate(-50%, -50%)', position: 'absolute' }
    ][index]
  }

  let startAngle = 180;
  let endAngle = 0;

  if (total === 3) {
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
    // 7 rivales
    startAngle = 190;
    endAngle = -10;
  }

  const angleDeg = startAngle - (index / (total - 1)) * (startAngle - endAngle);
  const angleRad = angleDeg * (Math.PI / 180);

  // Radio X usa hasta un 40% del ancho del contenedor (que llega a max-w-screen-2xl)
  const radiusX = 40; 
  // Radio Y usa un 20% de la altura TOTAL de la pantalla.
  const radiusY = 20; 
  
  const centerX = 50; 
  
  // El centro vertical de la elipse lo ubicamos en 40%.
  // Al restar 20% de radio Y en el punto más alto (90 grados), 
  // los avatares tocarán el top: 20%, quedando muy por encima de la mesa, pero bajando visiblemente.
  const centerY = 40; 

  const x = centerX + radiusX * Math.cos(angleRad);
  const y = centerY - radiusY * Math.sin(angleRad);

  return {
    top: `clamp(10%, ${y}%, 45%)`, 
    left: `clamp(5%, ${x}%, 95%)`, 
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
