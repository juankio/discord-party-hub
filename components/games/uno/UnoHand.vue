<template>
  <div class="flex-1 flex justify-center items-end pb-8 z-10 relative w-full" ref="handContainer">
    <div class="flex justify-center items-end -space-x-12 sm:-space-x-10">
      <div v-for="(card, index) in myHand" :key="card.id" 
           class="card-wrapper"
           :style="{ 
             transform: `rotate(${(index - (myHand.length - 1)/2) * 4}deg) translateY(${Math.abs(index - (myHand.length - 1)/2) * 3}px)`
           }">
        
        <div class="uno-card hand-card cursor-pointer"
             :class="[`card-${card.color || 'black'}`, !isPlayable(card) ? 'unplayable' : '']"
             @click="playCard(card, $event)">
          
          <div class="inner-oval"><span class="card-value">{{ getCardDisplay(card) }}</span></div>
          <span class="corner-value top-left">{{ getCardDisplay(card) }}</span>
          <span class="corner-value bottom-right">{{ getCardDisplay(card) }}</span>
          
          <!-- Bloqueo visual oscuro si no es jugable y es tu turno -->
          <div v-if="!isPlayable(card)" class="absolute inset-0 bg-black/60 rounded-[4px] md:rounded-[6px]"></div>
        </div>
      </div>
    </div>

    <!-- Botón Yell UNO -->
    <div class="absolute right-4 md:right-12 bottom-12" v-if="myHand.length <= 2">
      <button class="w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-full border-4 border-white text-white font-black text-xl md:text-2xl shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-110 active:scale-95 transition-transform"
              @click="$emit('yell-uno')">
        UNO!
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import anime from 'animejs'

const props = defineProps({
  myHand: { type: Array as () => any[], required: true },
  isMyTurn: { type: Boolean, default: false },
  topCard: { type: Object, default: null },
  currentColor: { type: String, default: '' },
  pendingDraws: { type: Number, default: 0 }
})

const emit = defineEmits(['play-card', 'yell-uno'])

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

// Validar si la carta brilla o se oscurece
const isPlayable = (card: any) => {
  if (!props.isMyTurn) return true // Si no es turno, no las oscurecemos
  
  if (props.pendingDraws > 0) {
    // Solo podemos jugar +2 o +4 para acumular
    return card.value === 'draw2' || card.value === 'wild_draw4'
  }

  // Jugada normal
  const validColor = card.color === 'wild' || card.color === props.currentColor || card.color === props.topCard?.color
  const validValue = card.value === props.topCard?.value
  return validColor || validValue
}

const playCard = (card: any, event: Event) => {
  if (!props.isMyTurn || !isPlayable(card)) {
    // Efecto de negar
    const target = event.currentTarget as HTMLElement
    anime({ targets: target, translateX: [0, -5, 5, -5, 5, 0], duration: 300 })
    return
  }
  
  const target = event.currentTarget as HTMLElement
  target.style.pointerEvents = 'none'

  // Clon volador a la mesa
  const rect = target.getBoundingClientRect()
  const topCardEl = document.querySelector('.top-card-placeholder')
  const topRect = topCardEl ? topCardEl.getBoundingClientRect() : { top: window.innerHeight/2 - 80, left: window.innerWidth/2 - 55 }

  const clone = target.cloneNode(true) as HTMLElement
  document.body.appendChild(clone)
  
  clone.style.position = 'fixed'
  clone.style.top = `${rect.top}px`
  clone.style.left = `${rect.left}px`
  clone.style.margin = '0'
  clone.style.zIndex = '9999'
  clone.style.transform = 'none'
  
  target.style.opacity = '0'

  anime({
    targets: clone,
    top: topRect.top,
    left: topRect.left,
    rotate: anime.random(-25, 25),
    scale: topCardEl ? 1 : 0.8,
    duration: 350,
    easing: 'easeOutCubic',
    complete: () => {
      clone.remove()
      emit('play-card', card.id)
    }
  })
}
</script>

<style scoped>
.card-wrapper { 
  transform-origin: bottom center; 
  transition: transform 0.3s ease, margin 0.2s ease, z-index 0s; 
  z-index: 1;
}
.card-wrapper:hover {
  z-index: 50;
  margin: 0 10px;
}
.hand-card {
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease;
}
/* Si NO es unplayable, le aplicamos el hover guay */
.card-wrapper:hover .hand-card:not(.unplayable) {
  transform: translateY(-40px) scale(1.15) !important;
  box-shadow: 0 20px 30px rgba(0,0,0,0.6);
}

.unplayable {
  cursor: not-allowed;
  transform: translateY(10px) !important; /* Ligeramente hundida */
}

/* Copia de los estilos de la carta (se podría mover a global, pero lo mantenemos aislado) */
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
