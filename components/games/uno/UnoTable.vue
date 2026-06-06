<template>
  <div class="flex-1 flex justify-center items-center relative z-10 w-full">
    <div class="w-full max-w-[600px] h-[200px] sm:h-[300px] bg-[#991b1b] rounded-[60px] sm:rounded-[100px] border-[6px] sm:border-[12px] border-[#5c3a21] shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-center relative mx-4 overflow-hidden">
      
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 8px 8px;"/>

      <!-- Deck (Mazo para Robar) -->
      <div class="absolute left-8 md:left-16 flex flex-col items-center gap-2">
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
        <span class="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-center max-w-[120px] drop-shadow-md z-10" :class="pendingDraws > 0 ? (isMyTurn ? 'text-red-500 animate-pulse' : 'text-orange-400') : (isMyTurn ? (hasDrawnThisTurn ? 'text-orange-500' : 'text-yellow-400') : 'text-gray-300')">{{ pendingDraws > 0 ? (isMyTurn ? `¡TE TOCA COMER +${pendingDraws}!` : `¡${victimName} COME +${pendingDraws}!`) : (isMyTurn ? (hasDrawnThisTurn ? '¿Pasar turno?' : (hasPlayableCard ? 'Tu turno' : (currentTaunt || '¡Robar Carta!'))) : 'Mazo') }}</span>
        
        <!-- Frase extra para las acumuladas (+2/+4) -->
        <span v-if="pendingDraws > 0" class="absolute -bottom-8 w-max text-xs font-black drop-shadow-lg animate-bounce" :class="isMyTurn ? 'text-yellow-400' : 'text-orange-500'">
          {{ currentDrawTaunt }}
        </span>
      </div>

      <!-- Top Card (Carta de la Mesa) -->
      <UnoCard
           v-if="topCard"
           :card="topCard"
           :currentColor="currentColor"
           class="top-card-anim top-card-placeholder transition-shadow duration-300"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import anime from 'animejs'
import { useUnoStore } from '~/stores/games/unoStore'
import { usePlayerStore } from '~/stores/playerStore'
import UnoCard from './UnoCard.vue'

const props = defineProps({
  topCard: { type: Object, default: null },
  currentColor: { type: String, default: '' },
  pendingDraws: { type: Number, default: 0 },
  isMyTurn: { type: Boolean, default: false },
  hasDrawnThisTurn: { type: Boolean, default: false },
  myHand: { type: Array as () => any[], default: () => [] }
})
const emit = defineEmits(['draw', 'pass-turn'])

const taunts = [
  "Uy, tal vez la siguiente bro",
  "Ni modo, la próxima",
  "Tú tienes muy mala suerte",
  "Epaa, esa servirá luego",
  "Sigue intentando...",
  "No es tu día",
  "Dale, una más y ya",
  "¿En serio? Otra vez..."
]

const stackTaunts = [
  "¡Uy! Te tenían ganas...",
  "¡Te van a destruir!",
  "A comer se dijo...",
  "¡Esa dolió!",
  "Acumulación letal",
  "¡Castigo divino!",
  "Te odian un poquito"
]

const revengeTaunts = [
  "¡La venganza se sirve fría!",
  "¡Toma tu +2 de vuelta!",
  "¡Rebotado pa' ti!",
  "¡Ojo por ojo!",
  "¡Karma instantáneo!",
  "¡No te escapas!"
]

const currentTaunt = ref('')
const currentDrawTaunt = ref('')

let previousDraws = 0

watch(() => props.pendingDraws, (newVal) => {
  if (newVal > 0) {
    if (newVal > previousDraws && previousDraws > 0) {
      // It's a stack/revenge
      currentDrawTaunt.value = revengeTaunts[Math.floor(Math.random() * revengeTaunts.length)] || ""
    } else {
      // Initial +2/+4
      currentDrawTaunt.value = stackTaunts[Math.floor(Math.random() * stackTaunts.length)] || ""
    }
  } else {
    currentDrawTaunt.value = ""
  }
  previousDraws = newVal
})

watch(() => props.isMyTurn, (newVal) => {
  if (!newVal) {
    currentTaunt.value = ''
  }
})

const isDrawing = ref(false)

const unoStore = useUnoStore()
const playerStore = usePlayerStore()

const hasPlayableCard = computed(() => {
  if (!props.isMyTurn) return false;
  if (props.pendingDraws > 0) {
    return props.myHand.some(card => card.value === 'draw2' || card.value === 'wild_draw4');
  }
  return props.myHand.some(card => 
    card.color === 'wild' || 
    card.color === props.currentColor || 
    card.color === props.topCard?.color || 
    card.value === props.topCard?.value
  );
})

const victimName = computed(() => {
  const currentId = unoStore.currentTurnUserId;
  if (currentId === playerStore.userId) return 'TÚ';
  const rival = unoStore.rivals.find((r: any) => r.userId === currentId);
  return rival ? rival.nickname : 'Alguien';
})

// getCardDisplay removed

const drawCard = (event: Event) => {
  if (!props.isMyTurn || isDrawing.value) return
  isDrawing.value = true // Bloqueamos el mazo
  
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
        currentTaunt.value = taunts[Math.floor(Math.random() * taunts.length)] || ""
        // Menos bloqueo al robar carta para que el jugador pueda robar rápido 1x1
        setTimeout(() => isDrawing.value = false, 100) 
      }
    }
  })
}
</script>

