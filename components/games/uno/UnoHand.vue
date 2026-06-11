<template>
  <div class="flex-1 flex justify-center items-end z-10 relative w-full max-w-full">
    <div ref="handContainer" class="w-full overflow-x-auto scrollbar-hide pb-8 pt-12 px-4 md:px-0 flex justify-start md:justify-center snap-x">
      <TransitionGroup 
        tag="div" 
        @enter="onCardEnter" 
        :css="false"
        class="flex items-end min-w-max mx-auto px-4 md:px-0" 
        :class="myHand.length > 12 ? '-space-x-14 sm:-space-x-16' : (myHand.length > 7 ? '-space-x-12 sm:-space-x-14' : '-space-x-10 sm:-space-x-12')"
      >
        <UnoHandCard
v-for="(card, index) in myHand" :key="card.id" 
             :card="card"
             :index="index"
             :total="myHand.length"
             :local-hover-index="localHoverIndex"
             :is-playable="isPlayable(card)"
             @play-card="$emit('play-card', $event.id)"
             @hover-card="localHoverIndex = $event; $emit('hover-card', $event)"
        />
      </TransitionGroup>
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
import anime from 'animejs'

const localHoverIndex = ref<number | undefined>(undefined)

const props = defineProps({
  myHand: { type: Array as () => any[], required: true },
  isMyTurn: { type: Boolean, default: false },
  topCard: { type: Object, default: null },
  currentColor: { type: String, default: '' },
  pendingDraws: { type: Number, default: 0 }
})

const emit = defineEmits(['play-card', 'yell-uno', 'hover-card'])

let enterTickCount = 0
let enterTimeout: NodeJS.Timeout | null = null

const onCardEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  const innerCard = htmlEl.querySelector('.uno-card') as HTMLElement
  if (!innerCard) {
    done()
    return
  }

  // Obtenemos coordenadas del mazo
  const deckEl = document.querySelector('.deck-placeholder')
  const deckRect = deckEl ? deckEl.getBoundingClientRect() : { top: 0, left: window.innerWidth / 2, width: 80, height: 120 }
  
  // Obtenemos posición final (natural) de la carta
  const elRect = htmlEl.getBoundingClientRect()
  
  const startX = deckRect.left - elRect.left + (deckRect.width / 2) - (elRect.width / 2)
  const startY = deckRect.top - elRect.top + (deckRect.height / 2) - (elRect.height / 2)

  // Asignamos posición inicial al hijo para no pelear con calculateCardStyle
  innerCard.style.opacity = '0'
  innerCard.style.transform = `translate(${startX}px, ${startY}px) scale(0.2) rotate(-30deg)`
  
  const delayIndex = enterTickCount++
  if (enterTimeout) clearTimeout(enterTimeout)
  enterTimeout = setTimeout(() => { enterTickCount = 0 }, 50)

  anime({
    targets: innerCard,
    opacity: [0, 1],
    translateX: [startX, 0],
    translateY: [startY, 0],
    scale: [0.2, 1],
    rotate: [-30, 0],
    duration: 600,
    delay: delayIndex * 150,
    easing: 'easeOutQuint',
    complete: () => {
      innerCard.style.transform = ''
      done()
    }
  })
}

// getCardDisplay removed

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
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
