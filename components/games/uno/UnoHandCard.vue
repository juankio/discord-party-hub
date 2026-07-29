<template>
  <div class="card-wrapper transition-all duration-300"
       :style="cardStyle"
       :data-index="index">
    <UnoCard
       :card="card"
       :playable="isPlayable"
       class="hand-card cursor-pointer"
       @click="playCard($event)"
       @mouseenter="$emit('hover-card', index)"
       @mouseleave="$emit('hover-card', null)"
    />
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const props = defineProps({
  card: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
  localHoverIndex: { type: Number, default: null },
  isPlayable: { type: Boolean, default: false }
})

const emit = defineEmits(['play-card', 'hover-card'])

const cardStyle = computed(() => {
  const isTooMany = props.total > 7
  const spreadAngle = isTooMany ? (props.total > 15 ? 1 : 2) : 5
  // La elevación en Y ahora tiene un base negativo Fuerte para sacarlas del piso, 
  // pero el cálculo del arco no necesita un yOffsetMultiplier gigante si usamos transformOrigin
  
  const middle = (props.total - 1) / 2
  const rotate = (props.index - middle) * spreadAngle
  
  // Usamos un simple cálculo cuadrático para el arco (parábola)
  let translateY = (Math.pow(props.index - middle, 2) * 2) - 40 // -40 es el base offset para que suban
  let scale = 1
  let zIndex = props.index

  if (props.index === props.localHoverIndex) {
    translateY -= 40
    scale = 1.15
    zIndex = 50
  }
  
  return {
    transform: `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`, // OJO: El TranslateY debe ir ANTES del rotate en CSS para que la rotación sea sobre el eje Y ya movido
    transformOrigin: 'bottom center', // Esto es CRÍTICO para que roteen como un abanico desde abajo
    zIndex,
  }
})

const playCard = (event: Event) => {
  if (!props.isPlayable) {
    const target = event.currentTarget as HTMLElement
    anime({ targets: target, translateX: [0, -5, 5, -5, 5, 0], duration: 300 })
    return
  }
  
  const target = event.currentTarget as HTMLElement
  target.style.pointerEvents = 'none'

  const rect = target.getBoundingClientRect()
  const topCardEl = document.querySelector('.top-card-placeholder')
  const topRect = topCardEl ? topCardEl.getBoundingClientRect() : { top: window.innerHeight/2 - 80, left: window.innerWidth/2 - 55 }

  const currentTransform = getComputedStyle(target.parentElement!).transform
  
  const clone = target.cloneNode(true) as HTMLElement
  document.body.appendChild(clone)
  
  clone.style.position = 'fixed'
  clone.style.top = `${rect.top}px`
  clone.style.left = `${rect.left}px`
  clone.style.margin = '0'
  clone.style.zIndex = '9999'
  clone.style.transform = currentTransform
  clone.style.transformOrigin = 'center center'
  
  target.style.opacity = '0'

  anime({
    targets: clone,
    top: topRect.top,
    left: topRect.left,
    rotate: anime.random(-25, 25),
    scale: topCardEl ? 1 : 0.8,
    duration: 350,
    easing: 'easeOutCubic',
    begin: () => {
      emit('play-card', props.card)
    },
    complete: () => {
      clone.remove()
    }
  })
}
</script>
