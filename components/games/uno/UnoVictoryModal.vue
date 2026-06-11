<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="victory-title">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500" @click="$emit('lobby')" aria-hidden="true"></div>
    
    <!-- Background glowing shapes for depth -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center" aria-hidden="true">
      <div class="winner-glow absolute w-[24rem] h-[24rem] md:w-[32rem] md:h-[32rem] bg-amber-500/20 rounded-full blur-[100px] opacity-0 mix-blend-screen"></div>
      <div class="winner-glow-2 absolute w-[24rem] h-[24rem] md:w-[32rem] md:h-[32rem] bg-indigo-500/10 rounded-full blur-[120px] opacity-0 mix-blend-screen translate-y-20"></div>
    </div>

    <!-- Glassmorphism Card -->
    <div class="winner-anim relative z-10 w-full max-w-lg mx-4 flex flex-col items-center justify-center text-center p-10 md:p-14 rounded-[2.5rem] border border-white/10 bg-zinc-950/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transform scale-75 opacity-0">
      
      <!-- Subtle top inner highlight -->
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <!-- Crown SVG -->
      <div class="mb-6 opacity-90" aria-hidden="true">
        <svg class="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
        </svg>
      </div>

      <h2 id="victory-title" class="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 mb-4 drop-shadow-sm">
        VICTORIA
      </h2>
      
      <p class="text-xl md:text-2xl text-zinc-400 font-medium mb-12 tracking-wide">
        {{ winnerMessage }}
      </p>

      <!-- Sleek Button -->
      <button 
        class="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-white/5 px-10 font-medium text-white transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:translate-y-0 border border-white/10 hover:border-white/20"
        @click="$emit('lobby')"
      >
        <span class="relative z-10 flex items-center gap-2">
          Volver al Lobby
          <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
        <!-- Shine effect -->
        <div class="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
          <div class="relative h-full w-12 bg-white/10"></div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  winnerMessage: { type: String, required: true }
})

defineEmits(['lobby'])

const cleanupAnimations = () => {
  anime.remove('.winner-glow')
  anime.remove('.winner-glow-2')
  anime.remove('.winner-anim')
}

watch(() => props.isOpen, async (val) => {
  if (val) {
    cleanupAnimations()
    await nextTick()
    
    const tl = anime.timeline({
      easing: 'easeOutExpo'
    })
    
    tl.add({
      targets: ['.winner-glow', '.winner-glow-2'],
      opacity: [0, 1],
      scale: [0.8, 1.2],
      duration: 1500,
      delay: anime.stagger(200)
    })
    .add({
      targets: '.winner-anim',
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutElastic(1, .6)'
    }, '-=1200')
    
    // Continuous subtle floating animation for glows
    anime({
      targets: '.winner-glow',
      translateY: [-20, 20],
      translateX: [-10, 10],
      direction: 'alternate',
      loop: true,
      duration: 4000,
      easing: 'easeInOutSine'
    })
    
    anime({
      targets: '.winner-glow-2',
      translateY: [20, -20],
      translateX: [10, -10],
      direction: 'alternate',
      loop: true,
      duration: 5000,
      easing: 'easeInOutSine'
    })
  } else {
    cleanupAnimations()
  }
}, { immediate: true })

onUnmounted(() => {
  cleanupAnimations()
})
</script>
