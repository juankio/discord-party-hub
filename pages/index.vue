<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
    
    <!-- Header Decorativo -->
    <div class="absolute top-12 text-center header-anim opacity-0 -translate-y-5">
      <h1 class="text-4xl md:text-5xl font-black text-white pb-1 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        PARTY HUB
      </h1>
      <p class="text-gray-500 text-sm font-medium tracking-widest uppercase mt-1">¡Juega cagón!</p>
    </div>

    <!-- Contenedor Principal y Leaderboard -->
    <div class="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 mt-16 w-full max-w-5xl relative z-10 main-container opacity-0 translate-y-5">
      
      <!-- Tarjeta Principal -->
      <HomeCard />

      <!-- Leaderboard -->
      <Leaderboard />

    </div>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

onMounted(() => {
  document.body.style.backgroundColor = '#0A0A0A'
  
  anime({
    targets: '.header-anim',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 800,
    easing: 'easeOutExpo'
  })
  anime({
    targets: '.main-container',
    scale: [0.9, 1],
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: 100,
    easing: 'easeOutExpo'
  })
})
</script>

