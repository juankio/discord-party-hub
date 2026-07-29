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
        transform: 'translate(-50%, -50%) rotate(' + getRivalPosition(index, rivals.length).rot + 'deg)'
      }"
    >
        <!-- Silla Realista de Listones -->
        <div class="absolute -top-12 w-[40px] h-[60px] sm:w-[56px] sm:h-[80px] flex flex-col items-center -z-10 opacity-90 drop-shadow-xl" style="perspective: 200px;">
          <!-- Respaldar (3 Listones verticales) -->
          <div class="w-[85%] h-[60%] border-4 border-[#7a4b2b] rounded-t-lg bg-[#8b5a2b] flex justify-evenly p-0.5 shadow-inner" style="transform: rotateX(20deg); transform-origin: bottom;">
             <div class="w-[20%] h-full bg-[#5c3a21] rounded-sm"></div>
             <div class="w-[20%] h-full bg-[#5c3a21] rounded-sm"></div>
             <div class="w-[20%] h-full bg-[#5c3a21] rounded-sm"></div>
          </div>
          <!-- Asiento (Trapezoide con curva) -->
          <div class="w-full h-[40%] bg-[#7a4b2b] border-b-[6px] border-[#5c3a21] rounded-b-2xl shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)] -mt-1 z-10"></div>
        </div>

        <!-- Nombre del rival (Debajo del avatar) -->
        <span class="absolute -bottom-10 text-[8px] sm:text-[10px] max-w-[50px] sm:max-w-[80px] truncate font-black text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/10 shadow-lg z-20 text-center whitespace-nowrap" :style="{ transform: 'rotate(' + -getRivalPosition(index, rivals.length).rot + 'deg)' }">{{ rival.nickname }}</span>

        <!-- Avatar -->
        <div
          class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-[3px] sm:border-4 shadow-[0_10px_20px_rgba(0,0,0,0.6)] relative z-10 transition-colors bg-[#151515]"
          :style="{ borderColor: rival.color || '#f97316', color: rival.color || '#f97316' }"
          :class="{'ring-4 ring-yellow-500 ring-offset-4 ring-offset-[#0A0A0A]': currentTurnUserId === rival.userId}"
        >
          <!-- Indicador TU TURNO -->
          <div v-if="currentTurnUserId === rival.userId" class="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-2 py-1 rounded-md text-[10px] font-black shadow-[0_0_15px_rgba(234,179,8,0.8)] whitespace-nowrap z-50 flex items-center gap-1">
            <UIcon name="i-lucide-hourglass" class="w-3 h-3 animate-spin" />
            JUGANDO
          </div>

          <!-- Overlay Offline -->
          <div v-if="rival.isOffline" class="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center z-30 backdrop-blur-[2px]">
            <UIcon name="i-lucide-wifi-off" class="w-4 h-4 sm:w-6 sm:h-6 text-orange-500 animate-pulse" />
          </div>
          <span v-if="rival.isOffline" class="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-black text-orange-400 bg-black/90 px-2 py-0.5 rounded border border-orange-500/50 whitespace-nowrap animate-pulse z-40">
            Desconectado
          </span>
          <img :src="`/avatars/avatar-${rival.avatarId}.svg?v=2`" class="w-full h-full object-cover rounded-full" :class="{'grayscale opacity-50': rival.isOffline}">
          
          <!-- Mini Cards Hand -->
          <div 
            class="absolute top-1/2 left-1/2 flex justify-center w-max pointer-events-none drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-all duration-500 z-30"
            :style="getMiniCardsStyle(index, rivals.length)"
          >
            <div class="flex -space-x-2 sm:-space-x-3">
              <div
                v-for="n in Math.min(rival.cardCount, 8)" :key="n" 
                class="w-5 h-8 sm:w-6 sm:h-10 md:w-8 md:h-12 bg-gray-800 border border-gray-500 rounded-[3px] shadow-sm transform rotate-[-5deg] transition-transform duration-200"
                :class="{'translate-y-[-10px] scale-110 z-20': useUnoStore().rivalHoverIndex[rival.userId] === (n - 1)}"
              >
                <div
                  class="w-full h-full bg-red-800 rounded-[2px] opacity-80" 
                  style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 2px);"
                />
              </div>
              <div v-if="rival.cardCount > 8" class="w-5 h-8 sm:w-6 sm:h-10 md:w-8 md:h-12 bg-black border border-gray-500 rounded-[3px] flex items-center justify-center text-[10px] md:text-xs font-bold text-white z-10 -ml-3 sm:-ml-4">
                +
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botón de Denuncia -->
        <div v-if="rival.cardCount === 1 && !rival.hasYelledUno" class="absolute -bottom-20 z-50 flex justify-center" :style="{ transform: 'rotate(' + -getRivalPosition(index, rivals.length).rot + 'deg)' }">
          <UButton
            size="2xs" color="red" class="whitespace-nowrap animate-bounce shadow-lg text-[9px] sm:text-xs px-2 py-1"
            @click="$emit('challenge', rival.userId)"
          >
            ¡Denunciar!
          </UButton>
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
  if (total === 0) return { x: 50, y: 5, rot: 0 };
  if (total === 1) return { x: 50, y: 0, rot: 0 };
  
  // Ángulos base (apertura de la U)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  // PC: Ángulos abiertos para que rodeen los laterales de la mesa sin dar la vuelta por abajo
  const minAngle = isMobile ? Math.PI + 0.8 : Math.PI + 0.15; 
  const maxAngle = isMobile ? -0.8 : -0.15;       
  const angleStep = (minAngle - maxAngle) / (total - 1);
  const angle = minAngle - (index * angleStep);

  const radiusX = isMobile ? 48 : 55; // Expandimos para que envuelvan la mesa
  const radiusY = isMobile ? 70 : 65; // Alto pronunciado para escapar de la madera
  const centerY = isMobile ? 45 : 80; // Centro hundido hacia el fondo para que el arco suba solo hasta el borde

  const x = 50 + radiusX * Math.cos(angle);
  const y = centerY - radiusY * Math.sin(angle); 
  
  // Calcular rotación en grados para que la silla mire al centro (50, 50 aprox)
  const dx = 50 - x;
  const dy = 50 - y;
  let rot = Math.atan2(dy, dx) * (180 / Math.PI) - 90;

  return { x, y, rot };
}

  const getMiniCardsStyle = (index: number, total: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const pushDistance = isMobile ? 50 : 60; // Píxeles reales hacia la mesa
    
    return {
      transform: `translate(-50%, -50%) translateY(${pushDistance}px)`,
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
