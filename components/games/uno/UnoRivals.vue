<template>
  <div class="absolute inset-0 w-full h-full pointer-events-none">
    <div 
      v-for="(rival, index) in rivals" 
      :id="`rival-avatar-${rival.userId}`" 
      :key="rival.userId" 
      class="flex flex-col items-center pointer-events-auto transition-all duration-500 ease-out absolute"
      :style="{
        left: `${getRivalPosition(index, rivals.length).x}%`,
        top: `${getRivalPosition(index, rivals.length).y}%`,
        transform: 'translate(-50%, -50%)'
      }"
    >
        <!-- Nombre del rival (Arriba del avatar para no superponer la mesa) -->
        <span class="absolute -top-6 sm:-top-7 text-[10px] sm:text-xs md:text-sm font-black text-gray-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap z-20">{{ rival.nickname }}</span>

        <!-- Avatar (Tamaño ajustado para el efecto 3D) -->
        <div
          class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-[3px] sm:border-4 shadow-[0_10px_20px_rgba(0,0,0,0.6)] relative z-10 transition-colors bg-[#151515]"
          :style="{ borderColor: rival.color || '#f97316', color: rival.color || '#f97316' }"
          :class="{'neon-glow': currentTurnUserId === rival.userId}"
        >
          <!-- Overlay Offline -->
          <div v-if="rival.isOffline" class="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center z-30 backdrop-blur-[2px]">
            <UIcon name="i-lucide-wifi-off" class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500 animate-pulse" />
          </div>
          <span v-if="rival.isOffline" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-black text-orange-400 bg-black/90 px-2 py-0.5 rounded border border-orange-500/50 whitespace-nowrap animate-pulse z-40">
            Desconectado
          </span>
          <img :src="`/avatars/avatar-${rival.avatarId}.svg?v=2`" class="w-full h-full object-cover rounded-full" :class="{'grayscale opacity-50': rival.isOffline}">
          
          <!-- Mini Cards Hand (Caen dentro de la mesa) -->
          <div 
            class="absolute top-1/2 left-1/2 flex justify-center w-max pointer-events-none drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-all duration-500"
            :style="getMiniCardsStyle(index, rivals.length)"
          >
            <div class="flex -space-x-2 sm:-space-x-3">
              <div
                v-for="n in Math.min(rival.cardCount, 8)" :key="n" 
                class="w-4 h-6 sm:w-5 sm:h-8 md:w-6 md:h-10 lg:w-8 lg:h-12 bg-gray-800 border border-gray-500 rounded-[2px] shadow-sm transform rotate-[-5deg] transition-transform duration-200"
                :class="{'translate-y-[-10px] scale-110 z-20': useUnoStore().rivalHoverIndex[rival.userId] === (n - 1)}"
              >
                <div
                  class="w-full h-full bg-red-800 rounded-[1px] opacity-80" 
                  style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 2px);"
                />
              </div>
              <div v-if="rival.cardCount > 8" class="w-4 h-6 sm:w-5 sm:h-8 md:w-6 md:h-10 lg:w-8 lg:h-12 bg-black border border-gray-500 rounded-[2px] flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white z-10 -ml-1 sm:-ml-2">
                +
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botón de Denuncia -->
        <UButton
          v-if="rival.cardCount === 1 && !rival.hasYelledUno" 
          size="2xs" color="red" class="absolute -bottom-10 whitespace-nowrap animate-bounce z-20 shadow-lg text-[9px] sm:text-xs px-2 py-1"
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
  if (total === 0) return { x: 50, y: -5 };
  if (total === 1) return { x: 50, y: -5 };
  if (total === 2) return index === 0 ? { x: 5, y: 15 } : { x: 95, y: 15 };

  // Angle bounds: from 180deg (left) to 0deg (right)
  const minAngle = Math.PI; // left
  const maxAngle = 0;       // right
  
  // Distribute index evenly between maxAngle and minAngle
  const angleStep = (minAngle - maxAngle) / (total - 1);
  const angle = minAngle - (index * angleStep);

  const radiusX = 58; // 58% of table width spread
  const radiusY = 55; // 55% of table height curve

  // Center is x: 50, y: 50
  const x = 50 + radiusX * Math.cos(angle);
  const y = 50 - radiusY * Math.sin(angle); 

  return { x, y };
}
  const getMiniCardsStyle = (index: number, total: number) => {
    let angle = Math.PI / 2; // Default top center
    if (total === 2) {
      angle = index === 0 ? Math.PI - 0.2 : 0.2;
    } else if (total > 2) {
      const minAngle = Math.PI;
      const maxAngle = 0;
      const angleStep = (minAngle - maxAngle) / (total - 1);
      angle = minAngle - (index * angleStep);
    }

    // Distancia fija en pixeles para empujar las cartas hacia el centro de la mesa
    const pushDistance = 110; 
    const dx = -pushDistance * Math.cos(angle);
    const dy = pushDistance * Math.sin(angle); // positivo porque y crece hacia abajo

    // Para que las cartas miren hacia el centro, rotamos el contenedor
    // angle = PI/2 (top) -> rotate = 0
    // angle = PI (left) -> rotate = -90
    // angle = 0 (right) -> rotate = 90
    const rotate = 90 - (angle * 180 / Math.PI);

    return {
      transform: `translate(calc(-50% + ${dx}px), ${dy}px) rotate(${rotate}deg)`,
      transformOrigin: 'top center'
    }
  }
</script>

<style scoped>
.neon-glow {
  box-shadow: 0 0 15px currentColor, inset 0 0 10px currentColor, 0 10px 20px rgba(0,0,0,0.6);
  animation: pulse-glow 1.5s infinite alternate;
}
@keyframes pulse-glow {
  from { filter: drop-shadow(0 0 5px currentColor); }
  to { filter: drop-shadow(0 0 15px currentColor); }
}
</style>
