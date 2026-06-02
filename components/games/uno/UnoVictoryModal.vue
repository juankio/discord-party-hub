<template>
  <div v-if="isOpen" class="absolute inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-center">
    <div class="winner-anim transform scale-50 opacity-0">
      <h2 class="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)] mb-4">
        ¡VICTORIA!
      </h2>
      <p class="text-2xl text-gray-300 font-bold mb-12">
        {{ winnerMessage }}
      </p>
      <UButton 
        v-if="isHost"
        size="xl" 
        color="primary" 
        class="px-12 h-16 text-xl font-bold shadow-[0_0_20px_rgba(88,101,242,0.5)] hover:scale-105 active:scale-95 transition-all"
        @click="$emit('lobby')"
      >
        Volver al Lobby
      </UButton>
      <p v-else class="text-gray-500 font-medium animate-pulse">Esperando a que el Host vuelva al lobby...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, nextTick } from 'vue'
import anime from 'animejs'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  winnerMessage: { type: String, required: true },
  isHost: { type: Boolean, required: true }
})

defineEmits(['lobby'])

watch(() => props.isOpen, async (val) => {
  if (val) {
    await nextTick()
    anime({
      targets: '.winner-anim',
      scale: [0.5, 1],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutElastic(1, .5)'
    })
  }
}, { immediate: true })
</script>
