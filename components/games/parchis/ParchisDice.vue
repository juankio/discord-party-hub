<template>
  <div class="parchis-dice-container flex gap-6 sm:gap-8 justify-center items-center" style="perspective: 1000px;">
    <div 
      v-for="(val, index) in (diceValues.length ? diceValues : [1, 1])" 
      :key="index"
      class="dice-scene relative cursor-pointer group"
      :class="{
        'z-10': index === parchisStore.selectedDiceIndex,
        'opacity-50 hover:opacity-100 transition-opacity duration-300': parchisStore.selectedDiceIndex !== null && index !== parchisStore.selectedDiceIndex && parchisStore.isMyTurn
      }"
      @click="selectDice(index)"
    >
      <!-- Selection Highlight (2D Ring behind the 3D cube) -->
      <div 
        class="absolute -inset-4 sm:-inset-5 rounded-2xl border-4 border-yellow-400/0 transition-all duration-300 pointer-events-none"
        :class="{'border-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] bg-yellow-500/10 scale-100': index === parchisStore.selectedDiceIndex, 'scale-90': index !== parchisStore.selectedDiceIndex}"
      ></div>

      <!-- The 3D Cube -->
      <div 
        class="dice-cube relative w-12 h-12 sm:w-16 sm:h-16"
        :ref="(el) => { if (el) diceElements[index] = el as HTMLElement; }"
        style="transform-style: preserve-3d;"
      >
        <!-- 6 Faces -->
        <div class="dice-face front"  v-html="getDotsHtml(1)"></div>
        <div class="dice-face back"   v-html="getDotsHtml(6)"></div>
        <div class="dice-face right"  v-html="getDotsHtml(2)"></div>
        <div class="dice-face left"   v-html="getDotsHtml(5)"></div>
        <div class="dice-face top"    v-html="getDotsHtml(3)"></div>
        <div class="dice-face bottom" v-html="getDotsHtml(4)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import anime from 'animejs'
import { useParchisStore } from '~/stores/games/parchisStore'

const props = defineProps<{
  diceValues: number[]
}>()

const parchisStore = useParchisStore()
const { playDice } = useParchisAudio()
const diceElements = ref<HTMLElement[]>([])

const getDotsHtml = (face: number) => {
  const dot = `<div class="bg-gray-900 shadow-inner border border-[rgba(0,0,0,0.5)] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full"></div>`;
  const redDot = `<div class="bg-gradient-to-b from-red-600 to-red-500 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full shadow-inner border border-red-800"></div>`;

  switch(face) {
    case 1: return `<div class="w-full h-full flex items-center justify-center">${redDot}</div>`;
    case 2: return `<div class="w-full h-full flex justify-between p-1.5 sm:p-2.5"><div class="self-start">${dot}</div><div class="self-end">${dot}</div></div>`;
    case 3: return `<div class="w-full h-full flex flex-col justify-between p-1.5 sm:p-2.5"><div class="self-start">${dot}</div><div class="self-center">${dot}</div><div class="self-end">${dot}</div></div>`;
    case 4: return `<div class="w-full h-full flex flex-col justify-between p-1.5 sm:p-2.5"><div class="flex justify-between w-full">${dot}${dot}</div><div class="flex justify-between w-full">${dot}${dot}</div></div>`;
    case 5: return `<div class="w-full h-full relative p-1.5 sm:p-2.5"><div class="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5">${dot}</div><div class="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5">${dot}</div><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">${dot}</div><div class="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5">${dot}</div><div class="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5">${dot}</div></div>`;
    case 6: return `<div class="w-full h-full flex flex-col justify-between p-1.5 sm:p-2.5"><div class="flex justify-between w-full">${dot}${dot}</div><div class="flex justify-between w-full">${dot}${dot}</div><div class="flex justify-between w-full">${dot}${dot}</div></div>`;
  }
  return '';
};

const selectDice = (index: number) => {
  if (parchisStore.isMyTurn) {
    if (parchisStore.selectedDiceIndex === index) {
      parchisStore.selectedDiceIndex = null
    } else {
      parchisStore.selectedDiceIndex = index
    }
  }
}

const getRotationForValue = (val: number) => {
  // Face 1: front -> no rotation needed to see it (0,0,0)
  // Face 6: back -> rotateY(180)
  // Face 2: right -> rotateY(-90)
  // Face 5: left -> rotateY(90)
  // Face 3: top -> rotateX(-90)
  // Face 4: bottom -> rotateX(90)
  switch (val) {
    case 1: return { x: 0, y: 0 };
    case 2: return { x: 0, y: -90 };
    case 3: return { x: -90, y: 0 };
    case 4: return { x: 90, y: 0 };
    case 5: return { x: 0, y: 90 };
    case 6: return { x: 180, y: 0 };
    default: return { x: 0, y: 0 };
  }
}

const applyStaticRotation = () => {
  props.diceValues.forEach((val, index) => {
    const el = diceElements.value[index];
    if (el) {
      const target = getRotationForValue(val);
      el.style.transform = `rotateX(${target.x}deg) rotateY(${target.y}deg) rotateZ(0deg) scale(1)`;
    }
  });
}

onMounted(() => {
  applyStaticRotation();
});

const rollDice = (index: number, val: number) => {
  if (!import.meta.client) return;
  const el = diceElements.value[index]
  if (!el) return
  
  anime.remove(el)
  
  const target = getRotationForValue(val);
  
  // Reseteamos el estilo a 0 antes de girar para no acumular giros locos
  el.style.transform = `rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)`;

  anime({
    targets: el,
    translateY: [
      { value: -60, duration: 250, easing: 'easeOutSine' },
      { value: 0, duration: 550, easing: 'easeOutBounce' }
    ],
    rotateX: [
      { value: target.x + 1080, duration: 800, easing: 'easeOutQuint' }
    ],
    rotateY: [
      { value: target.y + 1080, duration: 800, easing: 'easeOutQuint' }
    ],
    rotateZ: [
      { value: 0, duration: 800, easing: 'easeOutQuint' } // Z no rota para evitar deformaciones
    ],
    scale: [
      { value: 1.2, duration: 250, easing: 'easeOutSine' },
      { value: 1, duration: 550, easing: 'easeOutBounce' }
    ],
    delay: index * 50
  })
}

// Watch for changes in array reference or values to trigger roll animation
watch(() => [...props.diceValues], (newVals, oldVals) => {
  if (newVals && newVals.length > 0) {
    const isNewRoll = oldVals.length === 0 || newVals.some((v, i) => v !== oldVals[i])
    if (isNewRoll || parchisStore.isMyTurn) {
        // Trigger sound once per roll
        playDice()
        newVals.forEach((val, i) => {
          rollDice(i, val)
        })
    } else {
        applyStaticRotation();
    }
  }
}, { deep: true })
</script>

<style scoped>
.dice-scene {
  --dice-size: 48px;
}
@media (min-width: 640px) {
  .dice-scene {
    --dice-size: 64px;
  }
}

.dice-face {
  position: absolute;
  width: var(--dice-size);
  height: var(--dice-size);
  background-color: #fdf0d5; /* bone color */
  border-radius: 12px;
  border: 1px solid #e5c9a0;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.1), inset 2px 2px 5px rgba(255,255,255,0.8), 0 0 2px rgba(0,0,0,0.4);
  backface-visibility: hidden;
}

/* 3D Positioning */
.front  { transform: rotateY(0deg) translateZ(calc(var(--dice-size) / 2)); }
.back   { transform: rotateY(180deg) translateZ(calc(var(--dice-size) / 2)); }
.right  { transform: rotateY(90deg) translateZ(calc(var(--dice-size) / 2)); }
.left   { transform: rotateY(-90deg) translateZ(calc(var(--dice-size) / 2)); }
.top    { transform: rotateX(90deg) translateZ(calc(var(--dice-size) / 2)); }
.bottom { transform: rotateX(-90deg) translateZ(calc(var(--dice-size) / 2)); }
</style>
