<template>
  <div class="app-loader fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden">
    
    <!-- Animación de Trayectoria SVG -->
    <div class="relative w-[300px] h-[200px] sm:w-[400px] sm:h-[300px] flex items-center justify-center mb-12 perspective-1000">
      
      <!-- Glow de fondo -->
      <div 
        class="absolute inset-0 opacity-25 blur-[50px] transition-colors duration-500 will-change-transform"
        :style="{ backgroundColor: currentCardColor }"
      ></div>

      <!-- El Camino (Pista Infinito) -->
      <AppLoaderTrack :current-card-color="currentCardColor" />
      
      <!-- La Carta de UNO Viajera -->
      <AppLoaderCard 
        :current-card-class="currentCardClass"
        :current-text-class="currentTextClass"
        :current-card-color="currentCardColor"
      />

    </div>

    <!-- Animated Text -->
    <div class="text-container h-12 relative w-full flex justify-center items-center px-4 mt-8">
      <Transition name="phrase-fade" mode="out-in">
        <span 
          :key="currentPhraseIndex" 
          class="phrase font-black tracking-widest text-lg md:text-xl text-center uppercase will-change-transform"
          :class="currentTextClass"
          style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.8));"
        >
          {{ phrases[currentPhraseIndex] }}
        </span>
      </Transition>
    </div>

    <!-- Progress bar hint (pulsing line) -->
    <div class="absolute bottom-16 w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div class="loading-bar h-full w-full origin-left transition-colors duration-300 will-change-transform" :style="{ backgroundColor: currentCardColor }"></div>
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

const colors = [
  { class: 'bg-red-500', textClass: 'text-red-500', hex: '#ef4444' },
  { class: 'bg-blue-500', textClass: 'text-blue-500', hex: '#3b82f6' },
  { class: 'bg-green-500', textClass: 'text-green-500', hex: '#22c55e' },
  { class: 'bg-yellow-400', textClass: 'text-yellow-400', hex: '#eab308' }
]

const currentPhraseIndex = ref(0)
const colorIndex = ref(0)

const currentCardClass = ref(colors[0]!.class)
const currentTextClass = ref(colors[0]!.textClass)
const currentCardColor = ref(colors[0]!.hex)

let textInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const path = anime.path('.track-path-base');
  
  // Fisicas fluidas: El recorrido de la carta en infinito (∞)
  // Usamos easeInOutSine para que acelere en el centro y se frene suave en las curvas
  anime({
    targets: '.traveling-card',
    translateX: path('x'),
    translateY: path('y'),
    rotate: path('angle'),
    easing: 'easeInOutSine',
    duration: 3500,
    loop: true,
    update: function(anim) {
      // Cambiamos el color cada vez que pasa por el centro (0%, 50%, 100%)
      const prog = Math.round(anim.progress)
      
      // En 25% y 75% estamos en los bordes de la curva, es el momento perfecto para hacer el flip
      if (prog === 25 || prog === 75) {
        if (!document.querySelector('.traveling-card')?.hasAttribute('data-flipped')) {
            document.querySelector('.traveling-card')?.setAttribute('data-flipped', 'true');
            
            // Hacemos un giro rápido (flip 3D) a la carta
            anime({
              targets: '.traveling-card',
              rotateY: '+=180',
              duration: 800,
              easing: 'easeOutElastic(1, .5)' // Física de rebote real
            });

            // Cambiamos color
            colorIndex.value = (colorIndex.value + 1) % colors.length;
            const nextColorObj = colors[colorIndex.value];
            if(nextColorObj) {
              currentCardClass.value = nextColorObj.class;
              currentTextClass.value = nextColorObj.textClass;
              currentCardColor.value = nextColorObj.hex;
            }
        }
      }
      
      // Limpiamos el lock cuando salimos de las curvas
      if (prog > 35 && prog < 65 || prog > 85 || prog < 15) {
         document.querySelector('.traveling-card')?.removeAttribute('data-flipped');
      }
    }
  });

  // El láser de neón que persigue a la carta
  anime({
    targets: '.track-laser',
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutSine',
    duration: 3500,
    loop: true
  });

  // Loading bar pulse
  anime({
    targets: '.loading-bar',
    scaleX: [0, 1],
    opacity: [1, 0.5],
    easing: 'easeInOutQuad',
    duration: 1500,
    direction: 'alternate',
    loop: true
  })

  // Phrase cycler
  textInterval = setInterval(() => {
    currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length
  }, 2400)
})

onUnmounted(() => {
  if (textInterval) clearInterval(textInterval)
  anime.remove('.traveling-card')
  anime.remove('.track-laser')
  anime.remove('.loading-bar')
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.phrase-fade-enter-active,
.phrase-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.phrase-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
.phrase-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
