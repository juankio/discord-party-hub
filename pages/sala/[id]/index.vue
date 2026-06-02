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
            <h3 class="text-amber-500/80 mb-6 font-bold uppercase tracking-[0.3em] text-sm drop-shadow-md">Estante de Juegos</h3>
            
            <!-- Estante de Billar -->
            <div class="relative w-full bg-[#3b2512] rounded-xl border-8 border-[#1a0f07] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_10px_20px_rgba(0,0,0,0.5)] z-20 overflow-hidden">
              <!-- Textura de madera (Simulada con gradientes) -->
              <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              
              <!-- Repisas -->
              <div class="absolute top-1/2 left-0 right-0 h-4 bg-[#201005] -translate-y-1/2 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8),0_2px_0_rgba(255,255,255,0.1)] z-0"></div>
              
              <!-- Contenedor de Bolas -->
              <div class="flex flex-wrap justify-center gap-8 relative z-10">
                <button
                  v-for="game in games"
                  :key="game.id"
                  @click="selectedGame = game.id"
                  class="relative group outline-none focus:outline-none transition-transform duration-300"
                  :class="[
                    selectedGame === game.id ? '-translate-y-4 scale-110' : 'hover:-translate-y-2 hover:scale-105',
                    game.disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'
                  ]"
                  :disabled="game.disabled"
                >
                  <!-- Efecto de Brillo al Seleccionar -->
                  <div v-if="selectedGame === game.id" class="absolute -inset-2 bg-yellow-400/30 rounded-full blur-md animate-pulse"></div>

                  <!-- Bola Sólida -->
                  <div 
                    v-if="game.style === 'solid'"
                    class="relative w-20 h-20 rounded-full flex items-center justify-center shadow-[inset_-15px_-15px_25px_rgba(0,0,0,0.6),inset_10px_10px_20px_rgba(255,255,255,0.3),0_15px_20px_rgba(0,0,0,0.6)]"
                    :class="[game.color, selectedGame === game.id ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#3b2512]' : 'ring-1 ring-black/50']"
                  >
                    <!-- Centro de la bola -->
                    <div class="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)] border border-gray-300/50">
                      <span class="font-black" :class="[game.textColor, game.textSize]">{{ game.number }}</span>
                    </div>
                    <!-- Brillo de la bola (Reflejo de luz) -->
                    <div class="absolute top-2 left-3 w-5 h-4 bg-white/50 rounded-[50%] rotate-[-45deg] blur-[1px]"></div>
                  </div>

                  <!-- Bola Rayada -->
                  <div 
                    v-else
                    class="relative w-20 h-20 rounded-full overflow-hidden flex flex-col justify-center items-center shadow-[inset_-15px_-15px_25px_rgba(0,0,0,0.6),inset_10px_10px_20px_rgba(255,255,255,0.3),0_15px_20px_rgba(0,0,0,0.6)] bg-[#f8f9fa]"
                    :class="[selectedGame === game.id ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#3b2512]' : 'ring-1 ring-black/50']"
                  >
                    <!-- Franja de color -->
                    <div class="absolute w-full h-[55%] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.2)]" :class="game.color">
                      <div class="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)] border border-gray-300/50 relative z-10">
                        <span class="font-black text-black" :class="game.textSize">{{ game.number }}</span>
                      </div>
                    </div>
                    <!-- Brillo (encima de todo) -->
                    <div class="absolute top-2 left-3 w-5 h-4 bg-white/60 rounded-[50%] rotate-[-45deg] blur-[1px] z-20"></div>
                  </div>

                  <!-- Etiqueta del nombre (Hover/Select) -->
                  <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity" :class="selectedGame === game.id ? 'opacity-100' : ''">
                    <span class="text-xs font-bold text-amber-200 tracking-wider bg-black/50 px-2 py-1 rounded-md">{{ game.name }}</span>
                  </div>
                </button>
              </div>
            </div>
            
            <!-- Configuración de Reglas (Tablón de Madera Desplegable) -->
            <Transition name="slide-panel">
              <div v-if="selectedGame === 'uno'" class="w-full max-w-lg mx-auto relative z-10 -mt-2">
                <div class="bg-[#4a3018] rounded-b-2xl border-4 border-t-0 border-[#2a1a0b] p-6 pt-10 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_0_40px_rgba(0,0,0,0.5)] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] relative">
                  <!-- Clavos decorativos -->
                  <div class="absolute bottom-4 left-4 w-3 h-3 bg-gray-800 rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),_1px_1px_2px_rgba(0,0,0,0.8)]"></div>
                  <div class="absolute bottom-4 right-4 w-3 h-3 bg-gray-800 rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),_1px_1px_2px_rgba(0,0,0,0.8)]"></div>
                  
                  <h4 class="text-amber-400 font-black text-sm tracking-[0.2em] uppercase mb-6 text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Reglas de la Mesa</h4>
                  <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between group bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
                      <span class="text-amber-100/80 group-hover:text-amber-100 transition-colors text-sm font-bold tracking-wide">Acumular +2 y +4</span>
                      <UToggle v-model="unoRules.stackDrawCards" color="amber" class="scale-110 shadow-lg" />
                    </div>
                    <div class="flex items-center justify-between group bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
                      <span class="text-amber-100/80 group-hover:text-amber-100 transition-colors text-sm font-bold tracking-wide">Tirar dobles (Varios números iguales)</span>
                      <UToggle v-model="unoRules.playMultipleSame" color="amber" class="scale-110 shadow-lg" />
                    </div>
                    <div class="flex items-center justify-between group bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
                      <span class="text-amber-100/80 group-hover:text-amber-100 transition-colors text-sm font-bold tracking-wide">Regla del 0 (Pasa) y 7 (Cambia)</span>
                      <UToggle v-model="unoRules.zeroAndSevenRules" color="amber" class="scale-110 shadow-lg" />
                    </div>
                    <div class="flex items-center justify-between group bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
                      <span class="text-amber-100/80 group-hover:text-amber-100 transition-colors text-sm font-bold tracking-wide">Robar hasta que salga carta</span>
                      <UToggle v-model="unoRules.drawUntilPlayable" color="amber" class="scale-110 shadow-lg" />
                    </div>
                    <div class="flex items-center justify-between group bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
                      <span class="text-amber-100/80 group-hover:text-amber-100 transition-colors text-sm font-bold tracking-wide">Intercepción exacta (Corte)</span>
                      <UToggle v-model="unoRules.interceptExact" color="amber" class="scale-110 shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
            
            <UButton 
              size="xl" 
              color="amber" 
              class="mt-12 px-16 h-16 text-xl font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(245,158,11,0.5)] active:translate-y-1 active:shadow-[0_5px_15px_rgba(245,158,11,0.3)]"
              :disabled="players.length < 2 || selectedGame !== 'uno'"
              @click="startGame"
            >
              Repartir Cartas
            </UButton>
            <p v-if="players.length < 2" class="text-sm text-amber-500/60 mt-4 font-bold tracking-widest uppercase">Esperando más jugadores...</p>
            <p v-else-if="selectedGame !== 'uno'" class="text-sm text-red-400 mt-4 font-bold tracking-widest uppercase">Juego no disponible aún</p>
          </div>
          
          <!-- Panel de Espera (Invitados) -->
          <div v-else class="text-center">
            <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <h3 class="text-xl font-bold text-gray-200">Esperando al Host...</h3>
            <p class="text-gray-400">El creador de la sala elegirá el juego.</p>
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
  { id: 'uno', name: 'UNO', color: 'bg-red-500', textColor: 'text-red-500', textSize: 'text-xs', number: 'UNO', style: 'solid', disabled: false },
  { id: 'parchis', name: 'Parchís', color: 'bg-yellow-500', textColor: 'text-black', textSize: 'text-lg', number: '1', style: 'solid', disabled: true },
  { id: 'liars', name: 'Liar\'s Bar', color: 'bg-[#111111]', textColor: 'text-black', textSize: 'text-lg', number: '8', style: 'solid', disabled: true },
  { id: 'stop', name: 'Stop', color: 'bg-blue-500', textColor: 'text-black', textSize: 'text-lg', number: '4', style: 'solid', disabled: true },
  { id: 'pinturillo', name: 'Pinturillo', color: 'bg-purple-600', textColor: 'text-black', textSize: 'text-lg', number: '11', style: 'striped', disabled: true },
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
