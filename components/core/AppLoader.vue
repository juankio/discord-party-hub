<template>
  <div class="app-loader">
    <div class="bg-doodles"></div>
    <div class="bg-overlay"></div>

    <div class="dice-wrapper">
      <div class="dice-bounce transform-style-3d">
        <div class="dice-spin transform-style-3d">
          <div class="face front"><div class="face-center"><div class="dot"></div></div></div>
          <div class="face back"><div class="face-between"><div class="dot self-start"></div><div class="dot self-end"></div></div></div>
          <div class="face right"><div class="face-between-col"><div class="dot self-start"></div><div class="dot self-center"></div><div class="dot self-end"></div></div></div>
          <div class="face left">
            <div class="face-between-col-2">
              <div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div>
              <div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div>
            </div>
          </div>
          <div class="face top">
            <div class="pos-rel">
              <div class="dot abs-tl"></div><div class="dot abs-tr"></div>
              <div class="dot abs-center"></div>
              <div class="dot abs-bl"></div><div class="dot abs-br"></div>
            </div>
          </div>
          <div class="face bottom">
            <div class="face-between-col-2">
              <div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div>
              <div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div>
              <div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="dice-shadow"></div>
    </div>

    <div class="plaque-content">
      <div class="text-container">
        <Transition name="phrase-fade" mode="out-in">
          <span :key="currentPhraseIndex" class="phrase">
            {{ phrases[currentPhraseIndex] }}
          </span>
        </Transition>
      </div>

      <div class="loading-bar-wrapper">
        <div class="loading-bar-container">
          <div class="loading-bar-progress" :style="{ width: `${percentage}%` }"></div>
        </div>
        <div class="percentage-text">{{ percentage }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const phrases = [
  "Preparando la fiesta...",
  "Mezclando minijuegos...",
  "Lanzando los dados...",
  "Despertando los servidores gratuitos...",
  "(Esto puede tardar unos 10 segundos)...",
  "Calentando motores..."
]

const currentPhraseIndex = ref(0)
const percentage = ref(88) // Puntos de relevo exacto con el SPA

let textInterval: ReturnType<typeof setInterval> | null = null
let pctInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  textInterval = setInterval(() => {
    currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length
  }, 2500)

  pctInterval = setInterval(() => {
    if (percentage.value < 99) {
      percentage.value += Math.floor(Math.random() * 2)
      if (percentage.value > 99) percentage.value = 99
    }
  }, 400)
})

onUnmounted(() => {
  if (textInterval) clearInterval(textInterval)
  if (pctInterval) clearInterval(pctInterval)
})
</script>

<style scoped>
.phrase-fade-enter-active,
.phrase-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.phrase-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(4px);
}
.phrase-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  filter: blur(4px);
}
</style>
