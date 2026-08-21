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
          <span :key="currentPhraseText" class="phrase">
            {{ currentPhraseText }}
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  isReady?: boolean
}>()

const emit = defineEmits<{
  (e: 'finish'): void
}>()

const phrases = [
  "Preparando la fiesta...",
  "Mezclando minijuegos...",
  "Lanzando los dados...",
  "Despertando servidores...",
  "Afinando los tableros...",
  "Calentando motores..."
]

const currentPhraseIndex = ref(0)
const percentage = ref(70)
const isCompleted = ref(false)

const currentPhraseText = computed(() => {
  if (isCompleted.value || props.isReady) {
    return "¡FIESTA LISTA!"
  }
  return phrases[currentPhraseIndex.value]
})

let textInterval: ReturnType<typeof setInterval> | null = null
let pctInterval: ReturnType<typeof setInterval> | null = null

const completeLoading = () => {
  if (isCompleted.value) return
  isCompleted.value = true
  
  if (pctInterval) clearInterval(pctInterval)
  if (textInterval) clearInterval(textInterval)
  
  // Animación rápida y satisfactoria a 100%
  percentage.value = 100
  
  setTimeout(() => {
    emit('finish')
  }, 450)
}

watch(() => props.isReady, (ready) => {
  if (ready) {
    completeLoading()
  }
}, { immediate: true })

onMounted(() => {
  textInterval = setInterval(() => {
    if (!isCompleted.value) {
      currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length
    }
  }, 2200)

  // Avance orgánico mientras espera al backend (de 70% a 96%)
  pctInterval = setInterval(() => {
    if (!isCompleted.value && percentage.value < 96) {
      percentage.value += Math.floor(Math.random() * 2) + 1
      if (percentage.value > 96) percentage.value = 96
    }
  }, 350)
})

onUnmounted(() => {
  if (textInterval) clearInterval(textInterval)
  if (pctInterval) clearInterval(pctInterval)
})
</script>

<style scoped>
.phrase-fade-enter-active,
.phrase-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.phrase-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
  filter: blur(3px);
}
.phrase-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  filter: blur(3px);
}
</style>
