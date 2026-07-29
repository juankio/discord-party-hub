<template>
  <div class="relative flex flex-col items-center gap-2">
    <div
         class="deck-placeholder w-20 h-32 md:w-24 md:h-36 bg-gray-900 border-2 border-gray-700 rounded-xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] cursor-pointer transition-transform"
         :class="[
           pendingDraws > 0 ? 'ring-4 ring-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-105' :
           (isMyTurn && hasDrawnThisTurn ? 'ring-4 ring-orange-500 animate-pulse shadow-[0_0_30px_rgba(249,115,22,0.8)] hover:scale-105' :
           (isMyTurn && !hasPlayableCard ? 'ring-4 ring-yellow-400 animate-pulse shadow-[0_0_30px_rgba(250,204,21,0.6)] hover:scale-105' : 'hover:scale-105'))
         ]"
         @click="drawCard">
      
      <!-- Si hay cartas acumuladas (+2, +4) -->
      <span v-if="pendingDraws > 0" class="text-4xl font-black text-red-500 drop-shadow-md tracking-tighter">
        +{{ pendingDraws }}
      </span>
      <span v-else-if="isMyTurn && hasDrawnThisTurn" class="text-xl md:text-2xl font-black text-orange-500 drop-shadow-md tracking-tighter uppercase">
        Pasar
      </span>
      <!-- Mazo normal -->
      <span v-else class="text-2xl md:text-3xl font-black text-gray-800 tracking-tighter">
        UNO
      </span>

    </div>
    <span class="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-center max-w-[120px] drop-shadow-md z-10 mt-1" :class="pendingDraws > 0 ? 'text-red-500 animate-pulse' : 'text-gray-400'">
      {{ pendingDraws > 0 ? `+${pendingDraws} ACUMULADOS` : 'MAZO' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const props = defineProps({
  pendingDraws: { type: Number, default: 0 },
  isMyTurn: { type: Boolean, default: false },
  hasDrawnThisTurn: { type: Boolean, default: false },
  hasPlayableCard: { type: Boolean, default: false }
})

const emit = defineEmits(['draw', 'pass-turn'])

const isDrawing = ref(false)

const drawCard = (event: Event) => {
  if (!props.isMyTurn || isDrawing.value) return
  isDrawing.value = true 
  
  const target = event.currentTarget as HTMLElement
  anime({
    targets: target,
    scale: [1, 1.1, 1],
    translateY: [0, -10, 0],
    rotate: [0, 5, -5, 0],
    duration: 300,
    easing: 'easeOutElastic(1, .5)',
    complete: () => {
      if (props.hasDrawnThisTurn) {
        emit('pass-turn')
        setTimeout(() => isDrawing.value = false, 800) 
      } else {
        emit('draw')
        setTimeout(() => isDrawing.value = false, 100) 
      }
    }
  })
}
</script>
