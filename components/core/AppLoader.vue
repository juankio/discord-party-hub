<template>
  <div class="app-loader fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden">
    
    <!-- Animación de Trayectoria SVG -->
    <div class="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center mb-8 perspective-1000">
      
      <!-- Camino Invisible y Glow dinámico -->
      <div 
        class="absolute inset-0 opacity-20 blur-[60px] rounded-full transition-colors duration-500"
        :style="{ backgroundColor: currentCardColor }"
      ></div>

      <!-- El Camino (Path) de la pista -->
      <svg class="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 400 400" fill="none">
        <path 
          class="track-path" 
          d="M 50,200 C 50,50 350,50 350,200 C 350,350 50,350 50,200" 
          stroke="rgba(255,255,255,0.1)" 
          stroke-width="2" 
          stroke-dasharray="10 10"
        />
      </svg>
      
      <!-- La Carta de UNO Viajera -->
      <div class="traveling-card w-16 h-24 sm:w-20 sm:h-28 absolute top-0 left-0 preserve-3d" style="transform-origin: center center;">
        <div class="uno-card absolute inset-0 rounded-xl border-4 border-white flex flex-col items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
             :class="currentCardClass"
             :style="{ boxShadow: `0 0 30px ${currentCardColor}` }">
          
          <div class="w-full h-full p-1.5 flex items-center justify-center">
             <div class="inner-oval w-full h-full rounded-full bg-white flex items-center justify-center transform -rotate-12 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                <span class="text-xl sm:text-2xl font-black italic tracking-tighter" :class="currentTextClass">UNO</span>
             </div>
          </div>
          
          <div class="absolute top-1 left-1.5 text-white font-black text-[10px] italic">O</div>
          <div class="absolute bottom-1 right-1.5 text-white font-black text-[10px] italic rotate-180">O</div>
        </div>
      </div>

    </div>

    <!-- Animated Text -->
    <div class="text-container h-12 relative w-full flex justify-center items-center px-4">
      <Transition name="phrase-fade" mode="out-in">
        <span 
          :key="currentPhraseIndex" 
          class="phrase font-black tracking-widest text-lg md:text-xl text-center uppercase"
          :class="currentTextClass"
          style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.8));"
        >
          {{ phrases[currentPhraseIndex] }}
        </span>
      </Transition>
    </div>

    <!-- Progress bar hint (pulsing line) -->
    <div class="absolute bottom-16 w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div class="loading-bar h-full w-full origin-left transition-colors duration-300" :style="{ backgroundColor: currentCardColor }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
  // SVG Motion Path animation
  // Centramos el objeto en el punto 0,0 del SVG (-40px -56px es la mitad de 80x112px carta)
  const path = anime.path('.track-path');
  
  anime({
    targets: '.traveling-card',
    translateX: path('x'),
    translateY: path('y'),
    rotate: path('angle'), // La carta gira siguiendo la curva
    easing: 'linear',
    duration: 3000,
    loop: true,
    update: function(anim) {
      // Cambiamos de color cada vez que completa un bucle (100%) o a la mitad (50%)
      const prog = Math.round(anim.progress)
      if (prog === 50 || prog === 100) {
        if (!document.querySelector('.traveling-card')?.hasAttribute('data-color-changed')) {
            document.querySelector('.traveling-card')?.setAttribute('data-color-changed', 'true');
            colorIndex.value = (colorIndex.value + 1) % colors.length;
            const nextColorObj = colors[colorIndex.value];
            if(nextColorObj) {
              currentCardClass.value = nextColorObj.class;
              currentTextClass.value = nextColorObj.textClass;
              currentCardColor.value = nextColorObj.hex;
            }
        }
      }
      if (prog > 10 && prog < 40 || prog > 60 && prog < 90) {
         document.querySelector('.traveling-card')?.removeAttribute('data-color-changed');
      }
    }
  });

  // Animamos la carta girando en 3D mientras viaja
  anime({
    targets: '.uno-card',
    rotateY: '1turn',
    easing: 'linear',
    duration: 1500,
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
  anime.remove('.uno-card')
  anime.remove('.loading-bar')
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.traveling-card {
  margin-top: -3rem; /* Centrar la carta respecto al path Y */
  margin-left: -2rem; /* Centrar la carta respecto al path X */
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
