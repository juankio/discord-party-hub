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
            
            <!-- Games Cards Selector -->
            <div class="w-full flex gap-4 overflow-x-auto pb-4 custom-scrollbar px-4 snap-x">
              <button
                v-for="game in games"
                :key="game.id"
                @click="selectedGame = game.id"
                class="min-w-[140px] md:min-w-[160px] h-[200px] md:h-[240px] bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 relative group outline-none focus:outline-none snap-center overflow-hidden shadow-2xl"
                :class="[
                  selectedGame === game.id ? 'scale-105 z-20' : 'hover:scale-105 opacity-50 hover:opacity-100',
                  game.disabled ? 'cursor-not-allowed grayscale' : 'cursor-pointer'
                ]"
                :style="selectedGame === game.id ? { borderColor: 'var(--theme-color)', boxShadow: '0 0 40px rgba(var(--theme-color-rgb), 0.2)' } : {}"
                :disabled="game.disabled"
              >
                <!-- Glow interior al seleccionar -->
                <div v-if="selectedGame === game.id" class="absolute inset-0 opacity-20 pointer-events-none" :style="{ background: 'radial-gradient(circle at top, var(--theme-color), transparent 70%)' }"></div>
                
                <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-xl" :class="game.bgColor">
                  <UIcon :name="game.icon" class="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-md" />
                </div>
                
                <h3 class="font-black text-lg md:text-xl tracking-wider uppercase text-white drop-shadow-lg z-10">{{ game.name }}</h3>
                <span v-if="game.disabled" class="absolute bottom-4 text-[10px] font-bold text-gray-500 tracking-widest uppercase">Próximamente</span>
              </button>
            </div>
            
            <!-- Panel de Reglas Glassmorphism -->
            <Transition name="slide-panel">
              <div v-if="selectedGame === 'uno'" class="w-full max-w-lg mt-8 relative z-10">
                <div class="bg-black/30 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
                  <!-- Efecto de cristal -->
                  <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                  
                  <h4 class="text-white font-black text-xs tracking-[0.3em] uppercase mb-6 text-center opacity-80 flex items-center justify-center gap-2">
                    <UIcon name="i-lucide-settings-2" class="w-4 h-4" />
                    Reglas de la Casa
                  </h4>
                  
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between group bg-white/5 p-4 rounded-2xl transition-colors hover:bg-white/10 border border-transparent hover:border-white/5">
                      <span class="text-gray-400 group-hover:text-white transition-colors text-sm font-bold tracking-wide">Acumular +2 y +4</span>
                      <UToggle v-model="unoRules.stackDrawCards" :ui="{ active: 'bg-[var(--theme-color)]' }" />
                    </div>
                    <div class="flex items-center justify-between group bg-white/5 p-4 rounded-2xl transition-colors hover:bg-white/10 border border-transparent hover:border-white/5">
                      <span class="text-gray-400 group-hover:text-white transition-colors text-sm font-bold tracking-wide">Tirar dobles (Mismo número)</span>
                      <UToggle v-model="unoRules.playMultipleSame" :ui="{ active: 'bg-[var(--theme-color)]' }" />
                    </div>
                    <div class="flex items-center justify-between group bg-white/5 p-4 rounded-2xl transition-colors hover:bg-white/10 border border-transparent hover:border-white/5">
                      <span class="text-gray-400 group-hover:text-white transition-colors text-sm font-bold tracking-wide">Regla del 0 (Pasa) y 7 (Cambia)</span>
                      <UToggle v-model="unoRules.zeroAndSevenRules" :ui="{ active: 'bg-[var(--theme-color)]' }" />
                    </div>
                    <div class="flex items-center justify-between group bg-white/5 p-4 rounded-2xl transition-colors hover:bg-white/10 border border-transparent hover:border-white/5">
                      <span class="text-gray-400 group-hover:text-white transition-colors text-sm font-bold tracking-wide">Robar hasta que salga carta</span>
                      <UToggle v-model="unoRules.drawUntilPlayable" :ui="{ active: 'bg-[var(--theme-color)]' }" />
                    </div>
                    <div class="flex items-center justify-between group bg-white/5 p-4 rounded-2xl transition-colors hover:bg-white/10 border border-transparent hover:border-white/5">
                      <span class="text-gray-400 group-hover:text-white transition-colors text-sm font-bold tracking-wide">Intercepción exacta (Corte)</span>
                      <UToggle v-model="unoRules.interceptExact" :ui="{ active: 'bg-[var(--theme-color)]' }" />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
            
            <button 
              class="mt-12 px-16 h-16 rounded-full text-xl font-black uppercase tracking-widest text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              :disabled="players.length < 2 || selectedGame !== 'uno'"
              @click="startGame"
              style="background-color: var(--theme-color); box-shadow: 0 0 20px rgba(var(--theme-color-rgb), 0.4);"
              onmouseover="if(!this.disabled) { this.style.filter='brightness(1.1)'; this.style.boxShadow='0 0 30px rgba(var(--theme-color-rgb), 0.6)'; }"
              onmouseout="if(!this.disabled) { this.style.filter='none'; this.style.boxShadow='0 0 20px rgba(var(--theme-color-rgb), 0.4)'; }"
            >
              <UIcon name="i-lucide-play" class="w-6 h-6 group-hover:scale-110 transition-transform" />
              Empezar Partida
            </button>
            
            <p v-if="players.length < 2" class="text-xs text-gray-500 mt-4 font-bold tracking-[0.2em] uppercase">Esperando más jugadores...</p>
            <p v-else-if="selectedGame !== 'uno'" class="text-xs text-red-500/80 mt-4 font-bold tracking-[0.2em] uppercase">Juego no disponible aún</p>
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
