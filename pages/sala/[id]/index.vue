<template>
  <div class="flex flex-col items-center pt-8 md:pt-16 p-4">
    <div class="w-full max-w-6xl">
      <!-- Header de la Sala -->
      <div class="flex items-center justify-between mb-8 header-anim opacity-0">
        <h1 class="text-3xl font-black text-white">Sala: <span class="text-primary">{{ roomId }}</span></h1>
        <UButton 
          color="red" 
          variant="soft" 
          icon="i-lucide-log-out"
          @click="leaveRoom"
        >
          Salir
        </UButton>
      </div>

      <!-- Componente Mesa -->
      <PlayerTable :room-id="roomId" :players="players" />

      <!-- Zona de Control Dinámica -->
      <div class="mt-16 w-full flex justify-center pb-24">
        <Transition name="fade" mode="out-in">
          <!-- Panel de Control (Host) -->
          <div v-if="isHost" class="flex flex-col items-center w-full max-w-3xl relative">
            <h3 class="text-white/30 mb-4 font-black uppercase tracking-[0.4em] text-xs">Selector de Juegos</h3>
            
            <!-- Estante de Billar (Flat 2D Vectorial) -->
            <div class="relative w-full bg-[#8b5a2b] rounded-2xl border-4 border-[#5c3a21] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20 flex flex-col justify-center">
              
              <!-- Fondo del estante (Oscuro) -->
              <div class="absolute inset-2 bg-[#2a1a0f] rounded-xl shadow-[inset_0_5px_15px_rgba(0,0,0,0.9)]"></div>
              
              <!-- Repisa Horizontal Madera Oscura -->
              <div class="absolute top-1/2 left-0 w-full h-3 bg-[#4a2e1b] -translate-y-1/2 border-y border-[#3a2212] shadow-[0_5px_5px_rgba(0,0,0,0.5)] z-0"></div>

              <!-- Contenedor de Bolas -->
              <div class="flex flex-wrap justify-center gap-6 relative z-10">
                <button
                  v-for="game in games"
                  :key="game.id"
                  @click="selectedGame = game.id"
                  class="relative group outline-none focus:outline-none transition-transform duration-300"
                  :class="[
                    selectedGame === game.id ? '-translate-y-6 scale-110' : 'hover:-translate-y-2',
                    game.disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'
                  ]"
                  :disabled="game.disabled"
                >
                  <!-- Flecha indicadora flotante (Estilo Arcade) -->
                  <div v-if="selectedGame === game.id" class="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg class="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21l-7-7h14l-7 7z" />
                    </svg>
                  </div>

                  <!-- Bola Flat 2D -->
                  <div 
                    class="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 border-black/80 shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.5),_0_8px_10px_rgba(0,0,0,0.6)]"
                    :class="[game.color]"
                  >
                    <!-- Centro blanco de la bola -->
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] border border-black/10">
                      <span class="font-black text-black" :class="game.textSize">{{ game.number }}</span>
                    </div>
                    
                    <!-- Brillo Blanco (Estilo Vector Flat) -->
                    <div class="absolute top-1 right-2 w-3 h-2 bg-white/60 rounded-full rotate-[45deg]"></div>
                  </div>

                  <!-- Sombra en la repisa -->
                  <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/60 rounded-full blur-[2px] -z-10"></div>
                  
                  <!-- Etiqueta del nombre (Hover/Select) -->
                  <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-300"
                       :class="selectedGame === game.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'">
                    <span class="text-[10px] font-black tracking-widest text-amber-100 bg-black/80 px-2 py-1 rounded border border-white/10 uppercase">{{ game.name }}</span>
                  </div>
                </button>
              </div>
            </div>
            
            <!-- Panel de Reglas (Pizarra Verde) -->
            <Transition name="slide-panel">
              <div v-if="selectedGame === 'uno'" class="w-full max-w-lg mx-auto relative z-10 -mt-4">
                <div class="bg-[#109041] rounded-b-2xl border-4 border-[#8b5a2b] p-6 pt-10 shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.4)] relative">
                  
                  <h4 class="text-white/90 font-black text-xs tracking-[0.3em] uppercase mb-6 text-center drop-shadow-md">
                    Reglas de la Casa
                  </h4>
                  
                  <div class="flex flex-col gap-3">
                    <!-- Filas con diseño flat y bordes sutiles -->
                    <div class="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-black/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                      <span class="text-green-50 text-sm font-bold tracking-wide drop-shadow-sm">Acumular +2 y +4</span>
                      <UToggle v-model="unoRules.stackDrawCards" color="gray" class="scale-110 shadow-lg" :ui="{ active: 'bg-white', inactive: 'bg-black/50', icon: { active: 'text-[#109041]' } }" />
                    </div>
                    <div class="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-black/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                      <span class="text-green-50 text-sm font-bold tracking-wide drop-shadow-sm">Tirar dobles (Mismo número)</span>
                      <UToggle v-model="unoRules.playMultipleSame" color="gray" class="scale-110 shadow-lg" :ui="{ active: 'bg-white', inactive: 'bg-black/50', icon: { active: 'text-[#109041]' } }" />
                    </div>
                    <div class="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-black/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                      <span class="text-green-50 text-sm font-bold tracking-wide drop-shadow-sm">Regla del 0 (Pasa) y 7 (Cambia)</span>
                      <UToggle v-model="unoRules.zeroAndSevenRules" color="gray" class="scale-110 shadow-lg" :ui="{ active: 'bg-white', inactive: 'bg-black/50', icon: { active: 'text-[#109041]' } }" />
                    </div>
                    <div class="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-black/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                      <span class="text-green-50 text-sm font-bold tracking-wide drop-shadow-sm">Robar hasta que salga carta</span>
                      <UToggle v-model="unoRules.drawUntilPlayable" color="gray" class="scale-110 shadow-lg" :ui="{ active: 'bg-white', inactive: 'bg-black/50', icon: { active: 'text-[#109041]' } }" />
                    </div>
                    <div class="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-black/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                      <span class="text-green-50 text-sm font-bold tracking-wide drop-shadow-sm">Intercepción exacta (Corte)</span>
                      <UToggle v-model="unoRules.interceptExact" color="gray" class="scale-110 shadow-lg" :ui="{ active: 'bg-white', inactive: 'bg-black/50', icon: { active: 'text-[#109041]' } }" />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
            
            <!-- Botón Arcade 2D Macizo -->
            <button 
              class="mt-12 w-[280px] h-[60px] rounded-2xl text-lg font-black uppercase tracking-widest text-white transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative border-t-2 border-white/20"
              :disabled="players.length < 2 || selectedGame !== 'uno'"
              @click="startGame"
              style="
                background-color: var(--theme-color); 
                box-shadow: 0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4);
              "
              onmousedown="if(!this.disabled) { this.style.transform='translateY(8px)'; this.style.boxShadow='0 0px 0 rgba(0,0,0,0.6), 0 5px 10px rgba(0,0,0,0.4)'; }"
              onmouseup="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4)'; }"
              onmouseleave="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4)'; }"
            >
              Empezar Partida
            </button>
            
            <p v-if="players.length < 2" class="text-xs text-gray-500 mt-6 font-bold tracking-[0.2em] uppercase">Esperando más jugadores...</p>
            <p v-else-if="selectedGame !== 'uno'" class="text-xs text-red-500/80 mt-6 font-bold tracking-[0.2em] uppercase">Juego no disponible aún</p>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'
import anime from 'animejs'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const { socket } = useSocket()

const roomId = route.params.id as string

const players = computed(() => playerStore.playersInRoom)
const isHost = computed(() => {
  return playerStore.userId !== '' && 
         playerStore.hostUserId !== '' && 
         playerStore.userId === playerStore.hostUserId
})

const unoRules = ref({
  stackDrawCards: true,
  playMultipleSame: true,
  zeroAndSevenRules: true,
  drawUntilPlayable: false,
  interceptExact: false
})

const selectedGame = ref('uno')

const games = [
  { id: 'uno', name: 'UNO', color: 'bg-red-500', icon: 'i-lucide-layers', textColor: 'text-red-500', textSize: 'text-xs', number: 'UNO', style: 'solid', disabled: false },
  { id: 'parchis', name: 'Parchís', color: 'bg-yellow-500', icon: 'i-lucide-crosshair', textColor: 'text-black', textSize: 'text-lg', number: '1', style: 'solid', disabled: true },
  { id: 'liars', name: 'Liar\'s Bar', color: 'bg-[#111111]', icon: 'i-lucide-skull', textColor: 'text-black', textSize: 'text-lg', number: '8', style: 'solid', disabled: true },
  { id: 'stop', name: 'Stop', color: 'bg-blue-500', icon: 'i-lucide-hand', textColor: 'text-black', textSize: 'text-lg', number: '4', style: 'solid', disabled: true },
  { id: 'pinturillo', name: 'Pinturillo', color: 'bg-purple-600', icon: 'i-lucide-paintbrush', textColor: 'text-black', textSize: 'text-lg', number: '11', style: 'striped', disabled: true },
]

const startGame = () => {
  if (selectedGame.value === 'uno') {
    socket.value?.emit('start_game', { gameType: 'uno', rules: unoRules.value })
  } else {
    socket.value?.emit('start_game', { gameType: selectedGame.value })
  }
}

const leaveRoom = () => {
  router.push('/')
}

onMounted(() => {
  // Animaciones de entrada (solo el header, el panel de control usa Transición de Vue)
  setTimeout(() => {
    anime({
      targets: '.header-anim',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 800,
      easing: 'easeOutExpo'
    })
  }, 100)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: top;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.9);
}
</style>
