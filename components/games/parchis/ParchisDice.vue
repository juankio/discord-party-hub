<template>
  <div class="parchis-dice-container flex gap-4 perspective-1000">
    <div 
      v-for="(val, index) in diceValues" 
      :key="index"
      class="dice-wrapper relative w-12 h-12 flex items-center justify-center transform-style-3d transition-transform"
      :ref="(el) => { if (el) diceElements[index] = el as HTMLElement; }"
    >
      <div class="dice-spin w-full h-full relative transform-style-3d shadow-xl rounded-lg">
        <!-- 1 -->
        <div class="face front bg-white border border-gray-200"><div class="w-full h-full flex items-center justify-center"><div class="dot bg-red-500 w-2.5 h-2.5"></div></div></div>
        <!-- 2 -->
        <div class="face back bg-white border border-gray-200"><div class="w-full h-full flex justify-between p-1.5"><div class="dot bg-gray-800 self-start"></div><div class="dot bg-gray-800 self-end"></div></div></div>
        <!-- 3 -->
        <div class="face right bg-white border border-gray-200"><div class="w-full h-full flex flex-col justify-between p-1"><div class="dot bg-gray-800 self-start"></div><div class="dot bg-gray-800 self-center"></div><div class="dot bg-gray-800 self-end"></div></div></div>
        <!-- 4 -->
        <div class="face left bg-white border border-gray-200"><div class="w-full h-full flex flex-col justify-between p-1.5"><div class="flex justify-between"><div class="dot bg-gray-800"></div><div class="dot bg-gray-800"></div></div><div class="flex justify-between"><div class="dot bg-gray-800"></div><div class="dot bg-gray-800"></div></div></div></div>
        <!-- 5 -->
        <div class="face top bg-white border border-gray-200"><div class="relative w-full h-full p-1.5"><div class="dot bg-gray-800 absolute top-1.5 left-1.5"></div><div class="dot bg-gray-800 absolute top-1.5 right-1.5"></div><div class="dot bg-gray-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div><div class="dot bg-gray-800 absolute bottom-1.5 left-1.5"></div><div class="dot bg-gray-800 absolute bottom-1.5 right-1.5"></div></div></div>
        <!-- 6 -->
        <div class="face bottom bg-white border border-gray-200"><div class="w-full h-full flex flex-col justify-between p-1.5"><div class="flex justify-between"><div class="dot bg-gray-800"></div><div class="dot bg-gray-800"></div></div><div class="flex justify-between"><div class="dot bg-gray-800"></div><div class="dot bg-gray-800"></div></div><div class="flex justify-between"><div class="dot bg-gray-800"></div><div class="dot bg-gray-800"></div></div></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import anime from 'animejs'

const props = defineProps<{
  diceValues: number[]
}>()

const diceElements = ref<HTMLElement[]>([])

const getRotationsForFace = (face: number) => {
  switch(face) {
    case 1: return { x: 0, y: 0 }
    case 2: return { x: 0, y: -180 }
    case 3: return { x: 0, y: -90 }
    case 4: return { x: 0, y: 90 }
    case 5: return { x: -90, y: 0 }
    case 6: return { x: 90, y: 0 }
    default: return { x: 0, y: 0 }
  }
}

const rollDice = (index: number, targetValue: number) => {
  const el = diceElements.value[index]
  if (!el) return
  
  const spinEl = el.querySelector('.dice-spin')
  if (!spinEl) return

  anime.remove(spinEl)
  
  const targetRot = getRotationsForFace(targetValue)
  
  // Random extra spins
  const extraRotX = 360 * (2 + Math.floor(Math.random() * 2))
  const extraRotY = 360 * (2 + Math.floor(Math.random() * 2))

  anime({
    targets: spinEl,
    rotateX: targetRot.x + extraRotX,
    rotateY: targetRot.y + extraRotY,
    rotateZ: Math.random() > 0.5 ? 360 : -360,
    easing: 'easeOutQuart',
    duration: 1500 + index * 200
  })

  // Bounce effect
  anime.remove(el)
  anime({
    targets: el,
    translateY: [
      { value: -40, duration: 300, easing: 'easeOutQuad' },
      { value: 0, duration: 400, easing: 'easeInQuad' },
      { value: -15, duration: 250, easing: 'easeOutQuad' },
      { value: 0, duration: 300, easing: 'easeInQuad' }
    ]
  })
}

watch(() => props.diceValues, (newVals, oldVals) => {
  if (newVals && newVals.length > 0) {
    // If the values changed or length changed, reroll
    // In a real app we might want a trigger or counter, but let's assume new array ref means new roll
    newVals.forEach((val, i) => {
      rollDice(i, val)
    })
  }
}, { deep: true })

onMounted(() => {
  props.diceValues.forEach((val, i) => {
    const el = diceElements.value[i]
    if (el) {
      const spinEl = el.querySelector('.dice-spin') as HTMLElement
      if (spinEl) {
        const rot = getRotationsForFace(val)
        spinEl.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`
      }
    }
  })
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.face {
  @apply absolute w-12 h-12 rounded-lg shadow-[inset_0_0_8px_rgba(0,0,0,0.1)];
  backface-visibility: hidden;
}
.dot {
  @apply rounded-full w-2 h-2 shadow-sm;
}

.front  { transform: translateZ(24px); }
.back   { transform: rotateY(180deg) translateZ(24px); }
.right  { transform: rotateY(90deg) translateZ(24px); }
.left   { transform: rotateY(-90deg) translateZ(24px); }
.top    { transform: rotateX(90deg) translateZ(24px); }
.bottom { transform: rotateX(-90deg) translateZ(24px); }
</style>