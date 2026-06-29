<template>
  <div class="app-loader fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden" style="background-color: #0A0A0A; background-image: url('/doodles.svg'); background-repeat: repeat; background-attachment: fixed;">
    <!-- Dark overlay to make the content pop a bit more over the doodles if needed -->
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- 3D Dice Container -->
    <div class="dice-wrapper relative w-32 h-32 flex items-center justify-center perspective-1000 mb-8 mt-12 z-10">
      <div class="dice-bounce w-16 h-16 relative transform-style-3d">
        <div class="dice-spin w-full h-full relative transform-style-3d">
          <!-- 1 -->
          <div class="face front bg-rose-500"><div class="w-full h-full flex items-center justify-center"><div class="dot w-3 h-3"></div></div></div>
          <!-- 2 -->
          <div class="face back bg-sky-500"><div class="w-full h-full flex justify-between p-2"><div class="dot self-start"></div><div class="dot self-end"></div></div></div>
          <!-- 3 -->
          <div class="face right bg-amber-400"><div class="w-full h-full flex flex-col justify-between p-1.5"><div class="dot self-start"></div><div class="dot self-center"></div><div class="dot self-end"></div></div></div>
          <!-- 4 -->
          <div class="face left bg-emerald-500"><div class="w-full h-full flex flex-col justify-between p-2"><div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div><div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div></div></div>
          <!-- 5 -->
          <div class="face top bg-violet-500"><div class="relative w-full h-full p-2"><div class="dot absolute top-2 left-2"></div><div class="dot absolute top-2 right-2"></div><div class="dot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div><div class="dot absolute bottom-2 left-2"></div><div class="dot absolute bottom-2 right-2"></div></div></div>
          <!-- 6 -->
          <div class="face bottom bg-orange-500"><div class="w-full h-full flex flex-col justify-between p-2"><div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div><div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div><div class="flex justify-between"><div class="dot"></div><div class="dot"></div></div></div></div>
        </div>
      </div>
      
      <!-- Shadow -->
      <div class="dice-shadow absolute -bottom-4 w-16 h-4 bg-black/50 rounded-[50%] blur-sm"></div>
    </div>

    <!-- Animated Text -->
    <div class="text-container h-12 relative w-full flex justify-center items-center px-4">
      <Transition name="phrase-fade" mode="out-in">
        <span 
          :key="currentPhraseIndex" 
          class="phrase font-black tracking-widest text-lg md:text-xl text-white text-center uppercase drop-shadow-md"
          style="font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif;"
        >
          {{ phrases[currentPhraseIndex] }}
        </span>
      </Transition>
    </div>

    <!-- Loading Bar -->
    <div class="absolute bottom-16 w-48 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
      <div class="loading-bar h-full w-full bg-gradient-to-r from-rose-500 via-amber-400 to-sky-500 origin-left rounded-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const phrases = [
  "Preparando la fiesta...",
  "Mezclando minijuegos...",
  "Lanzando los dados...",
  "Repartiendo diversión...",
  "Llamando a los jugadores...",
  "Calentando motores..."
]

const currentPhraseIndex = ref(0)
let textInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Dice bouncing animation
  anime({
    targets: '.dice-bounce',
    translateY: [0, -70],
    easing: 'easeOutCubic',
    duration: 500,
    direction: 'alternate',
    loop: true
  })

  // Dice tumbling/spinning animation
  anime({
    targets: '.dice-spin',
    rotateX: '+=360deg',
    rotateY: '+=180deg',
    rotateZ: '+=90deg',
    easing: 'linear',
    duration: 3000,
    loop: true
  })

  // Shadow scaling to fake depth
  anime({
    targets: '.dice-shadow',
    scale: [1, 0.4],
    opacity: [0.6, 0.1],
    easing: 'easeOutCubic',
    duration: 500,
    direction: 'alternate',
    loop: true
  })

  // Loading bar pulse/progress
  anime({
    targets: '.loading-bar',
    scaleX: [0, 1],
    easing: 'easeInOutSine',
    duration: 2500,
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
  anime.remove('.dice-bounce')
  anime.remove('.dice-spin')
  anime.remove('.dice-shadow')
  anime.remove('.loading-bar')
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
  @apply absolute w-16 h-16 border-2 border-white/20 rounded-xl shadow-[inset_0_0_12px_rgba(0,0,0,0.2)];
  backface-visibility: hidden;
}
.dot {
  @apply bg-white rounded-full w-2.5 h-2.5 shadow-sm;
}

/* 3D Cube placement */
.front  { transform: translateZ(32px); }
.back   { transform: rotateY(180deg) translateZ(32px); }
.right  { transform: rotateY(90deg) translateZ(32px); }
.left   { transform: rotateY(-90deg) translateZ(32px); }
.top    { transform: rotateX(90deg) translateZ(32px); }
.bottom { transform: rotateX(-90deg) translateZ(32px); }

/* Text Transition */
.phrase-fade-enter-active,
.phrase-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.phrase-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
.phrase-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}
</style>
