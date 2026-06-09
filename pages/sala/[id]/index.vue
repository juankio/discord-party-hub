<template>
  <div class="flex flex-col items-center pt-8 md:pt-16 p-4">
    <div class="w-full max-w-6xl">
      <!-- Header de la Sala -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8 header-anim opacity-0 w-full">
        <h1 class="text-2xl sm:text-3xl font-black text-white text-center sm:text-left">Sala: <span class="text-primary">{{ roomId }}</span> <span class="text-gray-500 text-lg sm:text-xl ml-2">{{ players.length }}/{{ playerStore.roomRules?.extendedLobby ? 8 : 6 }}</span></h1>
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Botón Editar Perfil (Pro Max UI) -->
          <button 
            @click="isEditProfileOpen = true"
            class="group relative flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-black/40 hover:bg-white/5 text-gray-300 hover:text-white rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300 active:scale-95 shadow-lg overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 focus-visible:ring-0"
          >
            <!-- Efecto Pro Line (Glow en hover) -->
            <div class="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_var(--theme-color,rgba(249,115,22,0.2))] rounded-xl pointer-events-none"></div>
            <!-- Icono arreglado (Heroicons) -->
            <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110" style="color: var(--theme-color); filter: drop-shadow(0 0 4px var(--theme-color));" />
            <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Editar Perfil</span>
          </button>

          <!-- Botón Salir (Pro Max UI) -->
          <button 
            @click="leaveRoom"
            class="group relative flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all duration-300 active:scale-95 shadow-lg overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 focus-visible:ring-0"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)] rounded-xl pointer-events-none"></div>
            <!-- Icono arreglado (Heroicons) -->
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Salir</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 w-full items-start">
        <!-- Columna Izquierda (Mesa y Controles) -->
        <div class="flex-1 w-full flex flex-col gap-4 lg:gap-0">
          <!-- Componente Mesa -->
          <PlayerTable :room-id="roomId" :players="players" :host-user-id="playerStore.hostUserId" />

          <!-- Clasificación en Móvil (Oculta en LG porque irá en la columna derecha) -->
          <div class="block lg:hidden w-full max-w-md mx-auto">
            <TableHistoryBar :players="players" />
          </div>

          <!-- Zona de Control Dinámica -->
          <div class="w-full flex justify-center pb-24 mt-8 lg:mt-4 relative z-10">
            <Transition name="fade" mode="out-in">
              <!-- Panel de Control (Host) -->
          <div v-if="isHost" class="flex flex-col items-center w-full max-w-3xl relative">
            <h3 class="text-white/30 mb-2 lg:mb-4 font-black uppercase tracking-[0.4em] text-xs">Selector de Juegos</h3>
            
            <!-- Estante de Billar (Flat 2D Vectorial) -->
            <div class="relative w-full bg-[#8b5a2b] rounded-2xl border-4 border-[#5c3a21] py-4 px-2 sm:px-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20 flex flex-col justify-center">
              <div class="absolute inset-2 bg-[#2a1a0f] rounded-xl shadow-[inset_0_5px_15px_rgba(0,0,0,0.9)]"/>
              
              <GameSelector :games="games" :selected-game="selectedGame" @select="selectedGame = $event" />
            </div>
            
            <!-- Panel de Reglas (Extensión de Madera Flat 2D) -->
            <UnoRulesPanel v-if="selectedGame === 'uno'" v-model:rules="playerStore.roomRules" />
            <StopRulesPanel v-if="selectedGame === 'stop'" v-model:rules="playerStore.roomRules" />
            
            <!-- Botón Arcade 2D Macizo -->
            <button 
              class="mt-12 w-[280px] h-[60px] rounded-2xl text-lg font-black uppercase tracking-widest transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative border-t-2 border-white/20"
              :disabled="players.length < 2 || !['uno', 'stop'].includes(selectedGame) || (selectedGame === 'stop' && (!playerStore.roomRules?.stopCategories || playerStore.roomRules.stopCategories.length < 3))"
              style="
                background-color: var(--theme-color); 
                color: var(--theme-text-color, white);
                box-shadow: 0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4);
              "
              onmousedown="if(!this.disabled) { this.style.transform='translateY(8px)'; this.style.boxShadow='0 0px 0 rgba(0,0,0,0.6), 0 5px 10px rgba(0,0,0,0.4)'; }"
              onmouseup="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4)'; }"
              onmouseleave="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 rgba(0,0,0,0.6), 0 15px 20px rgba(0,0,0,0.4)'; }"
              @click="startGame"
            >
              Empezar Partida
            </button>
            
            <p v-if="players.length < 2" class="text-xs text-gray-500 mt-6 font-bold tracking-[0.2em] uppercase">Esperando más jugadores...</p>
            <p v-else-if="!['uno', 'stop'].includes(selectedGame)" class="text-xs text-red-500/80 mt-6 font-bold tracking-[0.2em] uppercase">Juego no disponible aún</p>
            <p v-else-if="selectedGame === 'stop' && (!playerStore.roomRules?.stopCategories || playerStore.roomRules.stopCategories.length < 3)" class="text-xs text-red-500/80 mt-6 font-bold tracking-[0.2em] uppercase">Faltan categorías para Stop</p>
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

        <!-- Columna Derecha (Solo visible en LG y superior) -->
        <div class="hidden lg:block w-[320px] xl:w-[350px] shrink-0">
          <TableHistoryBar :players="players" />
        </div>
      </div>
    </div>
    <EditProfileModal v-model:isOpen="isEditProfileOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'
import anime from 'animejs'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const { socket } = useSocket()
const roomId = computed(() => route.params.id as string)

useSeoMeta({
  title: `Lobby: ${roomId.value} - Discord Party Hub`,
  ogTitle: `Lobby: ${roomId.value} - Discord Party Hub`,
  description: 'La sala está abierta. ¡Entra a jugar wachoo o te cagas!',
  ogDescription: 'La sala está abierta. ¡Entra a jugar wachoo o te cagas!',
  ogImage: 'https://discord-party-hub.vercel.app/banner.jpg?v=4',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: `Lobby: ${roomId.value} - Discord Party Hub`,
  twitterDescription: 'La sala está abierta. ¡Entra a jugar wachoo o te cagas!',
  twitterImage: 'https://discord-party-hub.vercel.app/banner.jpg?v=4'
})

const players = computed(() => playerStore.playersInRoom)
const isHost = computed(() => playerStore.userId !== '' && playerStore.userId === playerStore.hostUserId)

const isEditProfileOpen = ref(false)

const selectedGame = ref('uno')
const games = [
  { id: 'uno', name: 'UNO', color: 'bg-[#151515]', labelColor: 'text-red-500', disabled: false },
  { id: 'parchis', name: 'Parchís', color: 'bg-[#151515]', labelColor: 'text-yellow-500', disabled: true },
  { id: 'liars', name: 'Liar\'s Bar', color: 'bg-[#111111]', labelColor: 'text-gray-400', disabled: true },
  { id: 'stop', name: 'Stop', color: 'bg-[#151515]', labelColor: 'text-blue-500', disabled: false },
  { id: 'pinturillo', name: 'Pinturillo', color: 'bg-[#151515]', labelColor: 'text-purple-500', disabled: true },
]

let lastSentRules = JSON.stringify(playerStore.roomRules)

watch(() => playerStore.roomRules, (newRules) => {
  if (isHost.value) {
    const rulesStr = JSON.stringify(newRules)
    // Si las reglas son idénticas a las que enviamos la última vez, ignoramos el loop
    if (rulesStr !== lastSentRules) {
      lastSentRules = rulesStr
      socket.value?.emit('update_room_rules', toRaw(newRules))
    }
  }
}, { deep: true })

const startGame = () => socket.value?.emit('start_game', { gameType: selectedGame.value, rules: playerStore.roomRules })
const leaveRoom = () => {
  socket.value?.emit('leave_room')
  router.push('/')
}

onMounted(() => {
  setTimeout(() => anime({ targets: '.header-anim', opacity: [0, 1], translateY: [-20, 0], duration: 800, easing: 'easeOutExpo' }), 100)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
