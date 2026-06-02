<template>
  <div class="flex-1 flex justify-center items-center relative z-10 w-full">
    <div class="w-full max-w-[600px] h-[300px] bg-[#151515] rounded-[100px] border border-gray-800 shadow-2xl flex items-center justify-center relative mx-4">
      
      <!-- Deck (Mazo para Robar) -->
      <div class="absolute left-8 md:left-16 flex flex-col items-center gap-2">
        <div class="deck-placeholder w-20 h-32 md:w-24 md:h-36 bg-gray-900 border-2 border-gray-700 rounded-xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] cursor-pointer transition-transform"
             :class="pendingDraws > 0 ? 'border-red-500 animate-pulse hover:scale-105' : 'hover:scale-105'"
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
        <span class="text-[10px] md:text-xs font-bold tracking-widest uppercase"
              :class="pendingDraws > 0 ? 'text-red-500 animate-pulse' : 'text-gray-500'">
          {{ pendingDraws > 0 ? '¡Comer!' : 'Robar' }}
        </span>
      </div>

      <!-- Top Card (Carta de la Mesa) -->
      <div v-if="topCard" class="uno-card top-card-anim top-card-placeholder" :class="`card-${topCard.color || 'black'}`">
         <div class="inner-oval"><span class="card-value">{{ getCardDisplay(topCard) }}</span></div>
         <span class="corner-value top-left">{{ getCardDisplay(topCard) }}</span>
         <span class="corner-value bottom-right">{{ getCardDisplay(topCard) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import anime from 'animejs'

const props = defineProps({
  topCard: { type: Object, default: null },
  pendingDraws: { type: Number, default: 0 },
  isMyTurn: { type: Boolean, default: false }
})

const emit = defineEmits(['draw'])
const isDrawing = ref(false)

const getCardDisplay = (card: any) => {
  if (!card) return ''
  if (['0','1','2','3','4','5','6','7','8','9'].includes(card.value)) return card.value
  if (card.value === 'skip') return '⊘'
  if (card.value === 'reverse') return '⇄'
  if (card.value === 'draw2') return '+2'
  if (card.value === 'wild') return 'W'
  if (card.value === 'wild_draw4') return '+4'
  return ''
}

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
      emit('draw')
      setTimeout(() => isDrawing.value = false, 200)
    }
  })
}
</script>

<style scoped>
/* Compartimos estilos de las cartas */
.uno-card {
  width: 90px; height: 130px;
  border-radius: 8px; border: 4px solid white;
  position: relative; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5); user-select: none;
  background-color: white;
}
@media (min-width: 768px) {
  .uno-card { width: 110px; height: 160px; border-width: 5px; border-radius: 10px; }
}

.card-red { background-color: #ef4444; }
.card-blue { background-color: #3b82f6; }
.card-green { background-color: #22c55e; }
.card-yellow { background-color: #eab308; }
.card-black { background-color: #1f2937; border-color: #111; }

.inner-oval {
  width: 85%; height: 85%; background: white;
  border-radius: 50% 50% / 65% 65%;
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-25deg);
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.3);
}
.card-red .inner-oval { color: #ef4444; }
.card-blue .inner-oval { color: #3b82f6; }
.card-green .inner-oval { color: #22c55e; }
.card-yellow .inner-oval { color: #eab308; }

.card-black .inner-oval { 
  background-color: #1a1a1a !important; 
  border: 4px solid transparent;
  background-clip: padding-box;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
}
.card-black .inner-oval::before {
  content: ''; position: absolute; inset: -4px; border-radius: inherit;
  background: linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6);
  z-index: -1;
}

.card-value {
  font-size: 2.2rem; font-weight: 900;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
  transform: rotate(25deg);
  line-height: 1;
}
@media (min-width: 768px) {
  .card-value { font-size: 3rem; }
}

.card-black .card-value {
  color: white !important;
  font-size: 2rem;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5) !important;
  background: none !important;
  -webkit-text-fill-color: white !important;
}
@media (min-width: 768px) {
  .card-black .card-value { font-size: 2.5rem; }
}

.corner-value {
  position: absolute; font-size: 0.9rem; font-weight: bold;
  color: white; text-shadow: 1px 1px 0px rgba(0,0,0,0.5);
}
@media (min-width: 768px) {
  .corner-value { font-size: 1.1rem; }
}
.top-left { top: 4px; left: 6px; }
.bottom-right { bottom: 4px; right: 6px; transform: rotate(180deg); }
</style>
