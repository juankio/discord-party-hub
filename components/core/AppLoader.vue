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
      <svg class="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 400 300" fill="none">
        <!-- Rastro sutil estático -->
        <path 
          class="track-path-base"
          d="M 200 150 C 280 50, 380 50, 380 150 C 380 250, 280 250, 200 150 C 120 50, 20 50, 20 150 C 20 250, 120 250, 200 150 Z" 
          stroke="rgba(255,255,255,0.05)" 
          stroke-width="4" 
        />
        <!-- Láser que dibuja el rastro (Neón) -->
        <path 
          class="track-laser" 
          d="M 200 150 C 280 50, 380 50, 380 150 C 380 250, 280 250, 200 150 C 120 50, 20 50, 20 150 C 20 250, 120 250, 200 150 Z" 
          :stroke="currentCardColor" 
          stroke-width="6" 
          stroke-linecap="round"
          style="filter: drop-shadow(0 0 10px currentColor);"
        />
      </svg>
      
      <!-- La Carta de UNO Viajera -->
      <div class="traveling-card w-14 h-20 sm:w-20 sm:h-28 absolute top-0 left-0 preserve-3d will-change-transform" style="transform-origin: center center;">
        <div class="uno-card absolute inset-0 rounded-xl border-4 border-white flex flex-col items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.8)] will-change-transform backface-hidden"
             :class="currentCardClass"
             :style="{ boxShadow: `0 0 30px ${currentCardColor}` }">
          
          <div class="w-full h-full p-1.5 flex items-center justify-center">
             <div class="inner-oval w-full h-full rounded-full bg-white flex items-center justify-center transform -rotate-12 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                <span class="text-lg sm:text-2xl font-black italic tracking-tighter" :class="currentTextClass">UNO</span>
             </div>
          </div>
          
          <div class="absolute top-1 left-1.5 text-white font-black text-[10px] italic">O</div>
          <div class="absolute bottom-1 right-1.5 text-white font-black text-[10px] italic rotate-180">O</div>
        </div>

        <!-- Reverso de la carta -->
        <div class="absolute inset-0 bg-[#111] rounded-xl border-4 border-white flex flex-col items-center justify-center rotate-y-180 backface-hidden" style="transform: rotateY(180deg);">
          <div class="w-full h-full p-1.5 flex items-center justify-center">
             <div class="w-full h-full rounded-full bg-red-600 flex items-center justify-center transform -rotate-12 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] border-2 border-yellow-500">
                <span class="text-sm font-black italic tracking-tighter text-yellow-400 drop-shadow-md">UNO</span>
             </div>
          </div>
        </div>

      </div>

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
.preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.traveling-card {
  /* Centrar exactamente la carta sobre el punto de la linea SVG */
  margin-top: -3.5rem; /* Mitad de h-28 (112px / 2 = 56px) */
  margin-left: -2.5rem; /* Mitad de w-20 (80px / 2 = 40px) */
}

/* Solo en movil (sm = 640px hacia abajo), la carta es mas pequeña */
@media (max-width: 639px) {
  .traveling-card {
    margin-top: -3rem; /* Mitad de h-24 (96px / 2 = 48px) */
    margin-left: -2rem; /* Mitad de w-16 (64px / 2 = 32px) */
  }
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
