<template>
  <div class="app-loader fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden">
    <!-- SVG Container for the animation -->
    <div class="loader-art-container relative w-64 h-64 flex items-center justify-center mb-8">
      
      <!-- 8-ball -->
      <div class="eight-ball absolute w-24 h-24 bg-black rounded-full border-4 border-zinc-800 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center z-20">
        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <span class="text-black font-black text-3xl">8</span>
        </div>
      </div>
      
      <!-- UNO Cards -->
      <div class="uno-card uno-red absolute w-16 h-24 bg-red-500 rounded-lg border-2 border-white flex items-center justify-center -rotate-12 translate-x-[-45px] translate-y-[20px] shadow-[0_0_15px_rgba(239,68,68,0.5)] z-10">
        <div class="w-12 h-20 bg-red-600 rounded-md border border-white/50 flex items-center justify-center">
          <span class="text-white font-black italic text-xl drop-shadow-md">+4</span>
        </div>
      </div>
      
      <div class="uno-card uno-blue absolute w-16 h-24 bg-blue-500 rounded-lg border-2 border-white flex items-center justify-center rotate-12 translate-x-[45px] translate-y-[20px] shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10">
        <div class="w-12 h-20 bg-blue-600 rounded-md border border-white/50 flex items-center justify-center">
          <span class="text-white font-black italic text-2xl drop-shadow-md">↺</span>
        </div>
      </div>

      <!-- Orbital dots / particles -->
      <div v-for="i in 12" :key="i" class="particle absolute w-2 h-2 rounded-full bg-[var(--theme-color)] shadow-[0_0_15px_var(--theme-color)]"></div>
    </div>

    <!-- Animated Text -->
    <div class="text-container h-12 relative w-full flex justify-center items-center px-4">
      <Transition name="phrase-fade" mode="out-in">
        <span 
          :key="currentPhraseIndex" 
          class="phrase text-[var(--theme-color)] drop-shadow-[0_0_10px_var(--theme-color)] font-bold tracking-widest text-lg md:text-xl text-center"
        >
          {{ phrases[currentPhraseIndex] }}
        </span>
      </Transition>
    </div>

    <!-- Progress bar hint (pulsing line) -->
    <div class="absolute bottom-16 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
      <div class="loading-bar h-full bg-[var(--theme-color)] w-full origin-left"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

const phrases = [
  "Despertando servidores en Azure...",
  "Limpiando mesas de billar...",
  "Repartiendo cartas de UNO...",
  "Ajustando luces de neon...",
  "Llamando a los jugadores rezagados...",
  "Preparando la jarra de fernet...",
  "¡Casi listos! Calentando motores..."
]

const currentPhraseIndex = ref(0)
let textInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // 8-ball Floating Animation
  anime({
    targets: '.eight-ball',
    translateY: ['-15px', '15px'],
    rotate: ['-5deg', '5deg'],
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
    duration: 1500
  })

  // UNO Cards floating
  anime({
    targets: '.uno-card',
    translateY: ['20px', '5px'],
    rotate: (el: HTMLElement) => {
      return el.classList.contains('uno-red') ? ['-12deg', '-20deg'] : ['12deg', '20deg']
    },
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad',
    duration: 2000,
    delay: anime.stagger(200)
  })

  // Particles orbit
  anime({
    targets: '.particle',
    translateX: () => anime.random(-120, 120),
    translateY: () => anime.random(-120, 120),
    scale: [0, () => anime.random(0.5, 2), 0],
    opacity: [0, 1, 0],
    easing: 'easeInOutSine',
    duration: () => anime.random(2000, 4000),
    loop: true,
    delay: anime.stagger(150)
  })

  // Loading bar pulse
  anime({
    targets: '.loading-bar',
    scaleX: [0, 1],
    opacity: [1, 0.5],
    easing: 'easeInOutQuad',
    duration: 2500,
    direction: 'alternate',
    loop: true
  })

  // Phrase cycler
  textInterval = setInterval(() => {
    currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length
  }, 3000)
})

onUnmounted(() => {
  if (textInterval) clearInterval(textInterval)
  anime.remove('.eight-ball')
  anime.remove('.uno-card')
  anime.remove('.particle')
  anime.remove('.loading-bar')
})
</script>

<style scoped>
.phrase-fade-enter-active,
.phrase-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.phrase-fade-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.95);
}
.phrase-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.95);
}
</style>
