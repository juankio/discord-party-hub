<template>
  <div class="app-loader fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden">
    <!-- Ambient Tavern Glow -->
    <div class="absolute inset-0 opacity-40 blur-[80px] bg-[radial-gradient(circle_at_center,rgba(180,83,9,0.3)_0%,transparent_50%)]"></div>

    <!-- Center Emblem / Ring -->
    <div class="relative w-32 h-32 flex items-center justify-center mb-10 perspective-1000">
      
      <!-- Outer Rotating Rings -->
      <svg class="loader-ring absolute inset-0 w-full h-full text-amber-700/60" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="46" stroke-width="1.5" stroke-dasharray="70 200" stroke-linecap="round" />
        <circle class="loader-ring-inner" cx="50" cy="50" r="38" stroke-width="1" stroke-dasharray="10 15" stroke-opacity="0.4" />
      </svg>
      
      <!-- Inner Floating Element (Rustic Chip/Gem) -->
      <div class="loader-core w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-900 rounded-sm rotate-45 shadow-[0_0_25px_rgba(217,119,6,0.5)] border border-amber-500/50 flex items-center justify-center relative">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-overlay"></div>
        <div class="w-6 h-6 border border-amber-300/30 rounded-sm rotate-45"></div>
      </div>
      
    </div>

    <!-- Animated Text -->
    <div class="text-container h-12 relative w-full flex justify-center items-center px-4 mt-2">
      <Transition name="phrase-fade" mode="out-in">
        <span 
          :key="currentPhraseIndex" 
          class="phrase font-serif tracking-[0.2em] text-sm md:text-base text-amber-500/90 text-center uppercase"
          style="text-shadow: 0 0 12px rgba(245, 158, 11, 0.4);"
        >
          {{ phrases[currentPhraseIndex] }}
        </span>
      </Transition>
    </div>

    <!-- Loading Bar -->
    <div class="absolute bottom-16 w-48 h-[1px] bg-amber-950/40 overflow-hidden">
      <div class="loading-bar h-full w-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.8)] origin-left"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const phrases = [
  "Despertando servidores...",
  "Limpiando las mesas...",
  "Repartiendo cartas...",
  "Llamando jugadores...",
  "Afilando los tacos...",
  "Sirviendo las bebidas...",
  "Calentando motores..."
]

const currentPhraseIndex = ref(0)
let textInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Rotate the outer ring
  anime({
    targets: '.loader-ring',
    rotateZ: 360,
    duration: 12000,
    easing: 'linear',
    loop: true
  })

  // Counter-rotate the inner dashed ring
  anime({
    targets: '.loader-ring-inner',
    rotateZ: -360,
    duration: 18000,
    easing: 'linear',
    loop: true,
    transformOrigin: ['50px', '50px']
  })
  
  // Floating and flipping animation for the core coin
  anime({
    targets: '.loader-core',
    translateY: [-6, 6],
    rotateZ: 45, // Keep it diamond shaped relative to its container
    rotateY: [0, 180, 360],
    duration: 4000,
    easing: 'easeInOutSine',
    loop: true
  })

  // Loading bar pulse/progress
  anime({
    targets: '.loading-bar',
    scaleX: [0, 1],
    opacity: [0.9, 0.3],
    easing: 'easeInOutSine',
    duration: 2000,
    direction: 'alternate',
    loop: true
  })

  // Phrase cycler
  textInterval = setInterval(() => {
    currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length
  }, 2500)
})

onUnmounted(() => {
  if (textInterval) clearInterval(textInterval)
  anime.remove('.loader-ring')
  anime.remove('.loader-ring-inner')
  anime.remove('.loader-core')
  anime.remove('.loading-bar')
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.phrase-fade-enter-active,
.phrase-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.phrase-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.phrase-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
