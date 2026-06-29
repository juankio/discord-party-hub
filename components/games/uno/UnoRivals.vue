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
        <!-- Nombre del rival (Debajo del avatar) -->
        <span class="absolute -bottom-6 text-[10px] sm:text-xs font-black text-gray-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap z-20">{{ rival.nickname }}</span>

        <!-- Avatar -->
        <div
          class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-[3px] sm:border-4 shadow-[0_10px_20px_rgba(0,0,0,0.6)] relative z-10 transition-colors bg-[#151515]"
          :style="{ borderColor: rival.color || '#f97316', color: rival.color || '#f97316' }"
          :class="{'neon-glow': currentTurnUserId === rival.userId}"
        >
          <!-- Indicador TU TURNO -->
          <div v-if="currentTurnUserId === rival.userId" class="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-2 py-0.5 rounded text-[9px] font-black animate-bounce shadow-[0_0_10px_rgba(234,179,8,0.8)] whitespace-nowrap z-50">
            TU TURNO
          </div>

          <!-- Overlay Offline -->
          <div v-if="rival.isOffline" class="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center z-30 backdrop-blur-[2px]">
            <UIcon name="i-lucide-wifi-off" class="w-4 h-4 sm:w-6 sm:h-6 text-orange-500 animate-pulse" />
          </div>
          <span v-if="rival.isOffline" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-black text-orange-400 bg-black/90 px-2 py-0.5 rounded border border-orange-500/50 whitespace-nowrap animate-pulse z-40">
            Desconectado
          </span>
          <img :src="`/avatars/avatar-${rival.avatarId}.svg?v=2`" class="w-full h-full object-cover rounded-full" :class="{'grayscale opacity-50': rival.isOffline}">
          
          <!-- Mini Cards Hand -->
          <div 
            class="absolute top-1/2 left-1/2 flex justify-center w-max pointer-events-none drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-all duration-500"
            :style="getMiniCardsStyle(index, rivals.length)"
          >
            <div class="flex -space-x-2 sm:-space-x-3">
              <div
                v-for="n in Math.min(rival.cardCount, 8)" :key="n" 
                class="w-5 h-8 sm:w-5 sm:h-8 md:w-6 md:h-10 bg-gray-800 border border-gray-500 rounded-[3px] shadow-sm transform rotate-[-5deg] transition-transform duration-200"
                :class="{'translate-y-[-10px] scale-110 z-20': useUnoStore().rivalHoverIndex[rival.userId] === (n - 1)}"
              >
                <div
                  class="w-full h-full bg-red-800 rounded-[2px] opacity-80" 
                  style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 2px);"
                />
              </div>
              <div v-if="rival.cardCount > 8" class="w-5 h-8 sm:w-5 sm:h-8 md:w-6 md:h-10 bg-black border border-gray-500 rounded-[3px] flex items-center justify-center text-[10px] md:text-xs font-bold text-white z-10 -ml-2 sm:-ml-3">
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
  if (total === 0) return { x: 50, y: 5 };
  if (total === 1) return { x: 50, y: 5 };
  if (total === 2) return index === 0 ? { x: 10, y: 30 } : { x: 90, y: 30 };

  const minAngle = Math.PI + 0.25; 
  const maxAngle = -0.25;       
  const angleStep = (minAngle - maxAngle) / (total - 1);
  const angle = minAngle - (index * angleStep);

  const radiusX = 48; 
  const radiusY = 46; 

  const x = 50 + radiusX * Math.cos(angle);
  const y = 50 - radiusY * Math.sin(angle); 

  return { x, y };
}

  const getMiniCardsStyle = (index: number, total: number) => {
    let angle = Math.PI / 2; 
    if (total === 2) {
      angle = index === 0 ? Math.PI - 0.2 : 0.2;
    } else if (total > 2) {
      const minAngle = Math.PI + 0.25;
      const maxAngle = -0.25;
      const angleStep = (minAngle - maxAngle) / (total - 1);
      angle = minAngle - (index * angleStep);
    }

    const pushDistance = 55; 
    const dx = -pushDistance * Math.cos(angle);
    const dy = pushDistance * Math.sin(angle);

    const rotate = (90 - (angle * 180 / Math.PI)) * 0.7;

    return {
      transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rotate}deg)`,
      transformOrigin: 'center'
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
