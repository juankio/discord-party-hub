<template>
  <div class="parchis-dice-container flex gap-3 sm:gap-4 justify-center items-center">
    <div 
      v-for="(val, index) in (diceValues.length ? diceValues : [1, 1])" 
      :key="index"
      class="dice-wrapper relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white to-gray-200 rounded-2xl border border-gray-300 flex items-center justify-center transition-all cursor-pointer overflow-hidden shadow-[inset_0_-4px_8px_rgba(0,0,0,0.15),inset_0_4px_8px_rgba(255,255,255,0.9)] drop-shadow-xl"
      :class="{
        'ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#2a1a10] scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] z-10': index === parchisStore.selectedDiceIndex,
        'opacity-50 grayscale hover:grayscale-0': parchisStore.selectedDiceIndex !== null && index !== parchisStore.selectedDiceIndex && parchisStore.isMyTurn
      }"
      :ref="(el) => { if (el) diceElements[index] = el as HTMLElement; }"
      @click="selectDice(index)"
    >
      <div class="w-full h-full relative p-1.5 sm:p-2">
        <!-- 1 -->
        <div v-if="val === 1" class="w-full h-full flex items-center justify-center">
          <div class="bg-gradient-to-b from-red-600 to-red-500 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-red-800"></div>
        </div>
        <!-- 2 -->
        <div v-else-if="val === 2" class="w-full h-full flex justify-between">
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full self-start"></div>
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full self-end"></div>
        </div>
        <!-- 3 -->
        <div v-else-if="val === 3" class="w-full h-full flex flex-col justify-between">
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full self-start"></div>
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full self-center"></div>
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full self-end"></div>
        </div>
        <!-- 4 -->
        <div v-else-if="val === 4" class="w-full h-full flex flex-col justify-between">
          <div class="flex justify-between w-full"><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"></div><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"></div></div>
          <div class="flex justify-between w-full"><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"></div><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"></div></div>
        </div>
        <!-- 5 -->
        <div v-else-if="val === 5" class="w-full h-full relative">
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 rounded-full absolute top-0 left-0"></div>
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 rounded-full absolute top-0 right-0"></div>
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 rounded-full absolute bottom-0 left-0"></div>
          <div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2.5 h-2.5 rounded-full absolute bottom-0 right-0"></div>
        </div>
        <!-- 6 -->
        <div v-else-if="val === 6" class="w-full h-full flex flex-col justify-between">
          <div class="flex justify-between w-full"><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"></div><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"></div></div>
          <div class="flex justify-between w-full"><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"></div><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"></div></div>
          <div class="flex justify-between w-full"><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"></div><div class="bg-gray-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import anime from 'animejs'
import { useParchisStore } from '~/stores/games/parchisStore'

const props = defineProps<{
  diceValues: number[]
}>()

const parchisStore = useParchisStore()
const diceElements = ref<HTMLElement[]>([])

const selectDice = (index: number) => {
  if (parchisStore.isMyTurn) {
    // If it's already selected, unselect it. Otherwise select it.
    if (parchisStore.selectedDiceIndex === index) {
      parchisStore.selectedDiceIndex = null
    } else {
      parchisStore.selectedDiceIndex = index
    }
  }
}

const rollDice = (index: number) => {
  if (!import.meta.client) return;
  const el = diceElements.value[index]
  if (!el) return
  
  anime.remove(el)
  
  // Pro Max: Impactful 3D jump and roll! Yohohoho!
  anime({
    targets: el,
    translateY: [
      { value: -100, duration: 300, easing: 'easeOutExpo' },
      { value: 0, duration: 600, easing: 'easeOutBounce' }
    ],
    rotateX: [
      { value: () => 720 + anime.random(-90, 90), duration: 900, easing: 'easeOutQuad' }
    ],
    rotateY: [
      { value: () => 720 + anime.random(-90, 90), duration: 900, easing: 'easeOutQuad' }
    ],
    rotateZ: [
      { value: () => 360 + anime.random(-90, 90), duration: 900, easing: 'easeOutQuad' }
    ],
    scale: [
      { value: 1.2, duration: 300, easing: 'easeOutExpo' },
      { value: 1, duration: 600, easing: 'easeOutBounce' }
    ],
    delay: index * 100
  })
}

// Watch for changes in array reference or values to trigger roll animation
watch(() => [...props.diceValues], (newVals, oldVals) => {
  if (newVals && newVals.length > 0) {
    const isNewRoll = oldVals.length === 0 || newVals.some((v, i) => v !== oldVals[i])
    if (isNewRoll || parchisStore.isMyTurn) {
        newVals.forEach((_, i) => {
          rollDice(i)
        })
    }
  }
}, { deep: true })
</script>
