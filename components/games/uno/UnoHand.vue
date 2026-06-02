<template>
  <div ref="handContainer" class="flex-1 flex justify-center items-end pb-8 z-10 relative w-full">
    <div class="flex justify-center items-end -space-x-12 sm:-space-x-10">
      <div
v-for="(card, index) in myHand" :key="card.id" 
           class="card-wrapper"
           :style="{ 
             transform: `rotate(${(index - (myHand.length - 1)/2) * 4}deg) translateY(${Math.abs(index - (myHand.length - 1)/2) * 3}px)`
           }">
        
        <div
class="uno-card hand-card cursor-pointer"
             :class="[`card-${card.color === 'wild' ? 'black' : card.color}`, !isPlayable(card) ? 'unplayable' : '']"
             @click="playCard(card, $event)"
             @mouseenter="$emit('hover-card', index)"
             @mouseleave="$emit('hover-card', null)">
          
          <div class="inner-oval"><span class="card-value">{{ getCardDisplay(card) }}</span></div>
          <span class="corner-value top-left">{{ getCardDisplay(card) }}</span>
          <span class="corner-value bottom-right">{{ getCardDisplay(card) }}</span>
          
          <!-- Bloqueo visual oscuro si no es jugable y es tu turno -->
          <div v-if="!isPlayable(card)" class="absolute inset-0 bg-black/60 rounded-[4px] md:rounded-[6px]"/>
        </div>
      </div>
    </div>

    <!-- Botón Yell UNO -->
    <div v-if="myHand.length <= 2" class="absolute right-4 md:right-12 bottom-12">
      <button
class="w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-full border-4 border-white text-white font-black text-xl md:text-2xl shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-110 active:scale-95 transition-transform"
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

const emit = defineEmits(['play-card', 'yell-uno', 'hover-card'])

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
