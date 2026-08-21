<template>
  <div class="h-[100dvh] w-full flex flex-col items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] overflow-hidden relative">
    
    <!-- Header Decorativo -->
    <div ref="headerEl" class="absolute text-center opacity-0 -translate-y-5 top-[max(3rem,env(safe-area-inset-top))]">
      <h1 class="text-4xl md:text-5xl font-black text-white pb-1 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        PARTY HUB
      </h1>
      <p class="text-gray-500 text-sm font-medium tracking-widest uppercase mt-1">¡Juega cagón!</p>
    </div>

    <!-- Contenedor Principal y Leaderboard -->
    <div ref="mainContainerEl" class="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 mt-16 w-full max-w-5xl relative z-10 opacity-0 translate-y-5">
      
      <!-- Tarjeta Principal -->
      <HomeCard @redirecting="handleRedirect" />

      <!-- Leaderboard -->
      <Leaderboard />

    </div>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const router = useRouter()
const headerEl = ref(null)
const mainContainerEl = ref(null)

const handleRedirect = (roomId: string) => {
  anime({
    targets: [mainContainerEl.value, headerEl.value],
    opacity: 0,
    translateY: -30,
    scale: 0.95,
    duration: 400,
    easing: 'easeInQuad',
    complete: () => {
      router.push(`/sala/${roomId.toUpperCase()}`)
    }
  })
}

useHead({
  bodyAttrs: {
    style: 'background-color: #0A0A0A'
  }
})

onMounted(() => {
  if (headerEl.value) {
    anime({
      targets: headerEl.value,
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 800,
      easing: 'easeOutExpo'
    })
  }
  if (mainContainerEl.value) {
    anime({
      targets: mainContainerEl.value,
      scale: [0.9, 1],
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: 100,
      easing: 'easeOutExpo'
    })
  }
})
</script>

