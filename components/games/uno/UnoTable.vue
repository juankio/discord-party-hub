<template>
  <div class="flex-1 flex justify-center items-center relative z-10 w-full">
    <div class="w-full max-w-[600px] h-[200px] sm:h-[300px] bg-[#991b1b] rounded-[60px] sm:rounded-[100px] border-[6px] sm:border-[12px] border-[#5c3a21] shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-center relative mx-4 overflow-hidden">
      
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 8px 8px;"/>

      <!-- Deck (Mazo para Robar) -->
      <div class="absolute left-8 md:left-16 flex flex-col items-center gap-2">
        <div
class="deck-placeholder w-20 h-32 md:w-24 md:h-36 bg-gray-900 border-2 border-gray-700 rounded-xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] cursor-pointer transition-transform"
             :class="[pendingDraws > 0 ? 'ring-4 ring-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-105' : (isMyTurn && !hasPlayableCard ? 'ring-4 ring-yellow-400 animate-pulse shadow-[0_0_30px_rgba(250,204,21,0.6)] hover:scale-105' : 'hover:scale-105')]"
             @click="drawCard">
          
          <!-- Si hay cartas acumuladas (+2, +4) -->
          <span v-if="pendingDraws > 0" class="text-4xl font-black text-red-500 drop-shadow-md tracking-tighter">
            +{{ pendingDraws }}
          </span>
          <!-- Mazo normal -->
          <span v-else class="text-2xl md:text-3xl font-black text-gray-800 tracking-tighter">
            UNO
          </span>

        </div>
        <span class="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-center max-w-[120px] drop-shadow-md z-10" :class="pendingDraws > 0 ? (isMyTurn ? 'text-red-500 animate-pulse' : 'text-orange-400') : (isMyTurn ? 'text-yellow-400' : 'text-gray-300')">{{ pendingDraws > 0 ? (isMyTurn ? `¡TE TOCA COMER +${pendingDraws}!` : `¡${victimName} COME +${pendingDraws} POR MALO!`) : (isMyTurn ? (hasPlayableCard ? 'Tu turno' : '¡Robar Carta!') : 'Mazo') }}</span>
      </div>

      <!-- Top Card (Carta de la Mesa) -->
      <div
v-if="topCard" class="uno-card top-card-anim top-card-placeholder transition-shadow duration-300" 
           :class="[ topCard.color === 'wild' && currentColor ? 'card-' + currentColor : 'card-' + (topCard.color === 'wild' ? 'black' : topCard.color) ]">
         <div class="inner-oval"><div v-if="topCard.value === 'wild'" class="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] border-2 border-white/20" style="background: conic-gradient(#ef4444 90deg, #eab308 90deg 180deg, #22c55e 180deg 270deg, #3b82f6 270deg);"/><span v-else class="card-value">{{ getCardDisplay(topCard) }}</span></div>
         <div v-if="topCard.value === 'wild'" class="corner-value top-left w-3 h-3 rounded-full shadow-sm" style="background: conic-gradient(#ef4444 90deg, #eab308 90deg 180deg, #22c55e 180deg 270deg, #3b82f6 270deg);"/><span v-else class="corner-value top-left">{{ getCardDisplay(topCard) }}</span>
         <div v-if="topCard.value === 'wild'" class="corner-value bottom-right w-3 h-3 rounded-full shadow-sm" style="background: conic-gradient(#ef4444 90deg, #eab308 90deg 180deg, #22c55e 180deg 270deg, #3b82f6 270deg);"/><span v-else class="corner-value bottom-right">{{ getCardDisplay(topCard) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed  } from 'vue'
import anime from 'animejs'
import { useUnoStore } from '~/stores/games/unoStore'
import { usePlayerStore } from '~/stores/playerStore'

const props = defineProps({
  topCard: { type: Object, default: null },
  currentColor: { type: String, default: '' },
  pendingDraws: { type: Number, default: 0 },
  isMyTurn: { type: Boolean, default: false },
  myHand: { type: Array as () => any[], default: () => [] }
})

const emit = defineEmits(['draw'])
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

const getCardDisplay = (card: any) => {
  if (!card) return ''
  if (['0','1','2','3','4','5','6','7','8','9'].includes(card.value)) return card.value
  if (card.value === 'skip') return '⊘'
  if (card.value === 'reverse') return '⇄'
  if (card.value === 'draw2') return '+2'
  if (card.value === 'wild') return ''
  if (card.value === 'wild_draw4') return '+4'
  return ''
}

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
      emit('draw')
      // Aumentamos a 1000ms el bloqueo para evitar spamear el click mientras esperamos al backend
      setTimeout(() => isDrawing.value = false, 1000) 
    }
  })
}
</script>

