<template>
  <div class="flex flex-col items-center pt-8 md:pt-16 p-4">
    <div class="w-full max-w-6xl">
      <!-- Header de la Sala -->
      <div class="flex items-center justify-between mb-8 header-anim opacity-0">
        <h1 class="text-3xl font-black text-white">Sala: <span class="text-primary">{{ roomId }}</span></h1>
        <UButton color="red" variant="soft" icon="i-lucide-log-out" @click="leaveRoom">Salir</UButton>
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
              <div class="absolute inset-2 bg-[#2a1a0f] rounded-xl shadow-[inset_0_5px_15px_rgba(0,0,0,0.9)]"></div>
              <div class="absolute top-1/2 left-0 w-full h-3 bg-[#4a2e1b] -translate-y-1/2 border-y border-[#3a2212] shadow-[0_5px_5px_rgba(0,0,0,0.5)] z-0"></div>

              <GameSelector :games="games" :selectedGame="selectedGame" @select="selectedGame = $event" />
            </div>
            
            <!-- Panel de Reglas (Extensión de Madera Flat 2D) -->
            <UnoRulesPanel v-if="selectedGame === 'uno'" v-model:rules="unoRules" />
            
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
import { useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'
import anime from 'animejs'

const router = useRouter()
const playerStore = usePlayerStore()
const { socket } = useSocket()
const roomId = playerStore.roomId

const players = computed(() => playerStore.playersInRoom)
const isHost = computed(() => playerStore.userId !== '' && playerStore.userId === playerStore.hostUserId)

const unoRules = ref({
  stackDrawCards: true, playMultipleSame: true, zeroAndSevenRules: true, drawUntilPlayable: false, interceptExact: false
})
const selectedGame = ref('uno')
const games = [
  { id: 'uno', name: 'UNO', color: 'bg-red-500', textSize: 'text-xs', number: 'UNO', disabled: false },
  { id: 'parchis', name: 'Parchís', color: 'bg-yellow-500', textSize: 'text-lg', number: '1', disabled: true },
  { id: 'liars', name: 'Liar\'s Bar', color: 'bg-[#111111]', textSize: 'text-lg', number: '8', disabled: true },
  { id: 'stop', name: 'Stop', color: 'bg-blue-500', textSize: 'text-lg', number: '4', disabled: true },
  { id: 'pinturillo', name: 'Pinturillo', color: 'bg-purple-600', textSize: 'text-lg', number: '11', disabled: true },
]

const startGame = () => socket.value?.emit('start_game', { gameType: selectedGame.value, rules: unoRules.value })
const leaveRoom = () => router.push('/')

onMounted(() => {
  setTimeout(() => anime({ targets: '.header-anim', opacity: [0, 1], translateY: [-20, 0], duration: 800, easing: 'easeOutExpo' }), 100)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
