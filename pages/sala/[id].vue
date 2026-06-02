<template>
  <div class="min-h-screen overflow-hidden">
    <!-- Contenido de la sala (Oculto hasta configurar perfil) -->
    <div v-if="hasSetup" class="flex flex-col items-center pt-8 md:pt-16 p-4">
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
      <div class="mt-16 w-full flex justify-center">
        <Transition name="fade" mode="out-in">
          <!-- Panel de Control (Host) -->
          <div v-if="isHost" class="flex flex-col items-center">
            <h3 class="text-gray-400 mb-4 font-medium uppercase tracking-widest text-sm">Seleccionar Juego</h3>
            <div class="flex gap-4">
              <div class="bg-[#2b2d31] p-4 rounded-2xl border-2 border-primary neon-glow cursor-pointer hover:scale-105 transition-transform">
                <div class="w-24 h-24 bg-red-500 rounded-xl flex items-center justify-center font-black text-white text-3xl shadow-lg transform rotate-3">
                  UNO
                </div>
              </div>
              <!-- Placeholder para próximos juegos -->
              <div class="bg-[#2b2d31] p-4 rounded-2xl border border-gray-700 opacity-50 flex items-center justify-center cursor-not-allowed">
                 <div class="w-24 h-24 flex items-center justify-center text-gray-500 font-bold">
                   PRÓXIMAMENTE
                 </div>
              </div>
            </div>
            
            <!-- Configuración de Reglas UNO -->
            <div class="mt-8 w-full max-w-sm bg-[#151515] rounded-2xl border border-white/10 p-5 shadow-xl">
              <h4 class="text-white font-bold text-sm tracking-wider uppercase mb-4 text-center">Reglas de la Mesa</h4>
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between group">
                  <span class="text-gray-400 group-hover:text-gray-200 transition-colors text-sm font-medium">Acumular +2 y +4</span>
                  <UToggle v-model="unoRules.stackDrawCards" color="primary" />
                </div>
                <div class="flex items-center justify-between group">
                  <span class="text-gray-400 group-hover:text-gray-200 transition-colors text-sm font-medium">Tirar dobles (Varios números iguales)</span>
                  <UToggle v-model="unoRules.playMultipleSame" color="primary" />
                </div>
                <div class="flex items-center justify-between group">
                  <span class="text-gray-400 group-hover:text-gray-200 transition-colors text-sm font-medium">Regla del 0 (Pasa) y 7 (Cambia)</span>
                  <UToggle v-model="unoRules.zeroAndSevenRules" color="primary" />
                </div>
                <div class="flex items-center justify-between group">
                  <span class="text-gray-400 group-hover:text-gray-200 transition-colors text-sm font-medium">Robar hasta que salga carta</span>
                  <UToggle v-model="unoRules.drawUntilPlayable" color="primary" />
                </div>
                <div class="flex items-center justify-between group">
                  <span class="text-gray-400 group-hover:text-gray-200 transition-colors text-sm font-medium">Intercepción exacta (Corte)</span>
                  <UToggle v-model="unoRules.interceptExact" color="primary" />
                </div>
              </div>
            </div>
            
            <UButton 
              size="xl" 
              color="primary" 
              class="mt-8 px-12 h-14 text-lg font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
              :disabled="players.length < 2"
              @click="startGame"
            >
              Empezar Partida
            </UButton>
            <p v-if="players.length < 2" class="text-sm text-gray-500 mt-2">Esperando más jugadores...</p>
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

    <!-- Modal Obligatorio si entra directo con link sin nickname -->
    <UModal 
      v-model="showSetupModal" 
      prevent-close 
      :ui="{ 
        background: 'bg-transparent', 
        shadow: 'shadow-none',
        overlay: { background: 'bg-black/90 backdrop-blur-sm' },
        rounded: 'rounded-none',
        padding: 'p-0',
        ring: 'ring-0',
        inner: 'sm:p-0'
      }"
    >
      <div class="w-full max-w-[380px] mx-auto bg-[#151515] p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-6 border border-white/5">
        <h2 class="text-xl font-black text-white text-center tracking-widest uppercase mt-2">Únete a la Sala</h2>
        
        <ProfileSetup 
          v-model:avatarId="tempAvatarId"
          v-model:color="tempColor"
          v-model:nickname="tempNickname"
        />

        <button 
          @click="saveAndJoin"
          :disabled="tempNickname.trim().length < 2"
          class="w-full bg-[#f97316] hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-3.5 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(249,115,22,0.3)] mt-2"
        >
          Entrar a Jugar
        </button>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'
import anime from 'animejs'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const { connect, disconnect } = useSocket()

const roomId = route.params.id as string
const showSetupModal = ref(false)
const hasSetup = ref(false)

// Estado temporal para el modal
const tempNickname = ref('')
const tempAvatarId = ref(1)
const tempColor = ref('#f97316')

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

const startGame = () => {
  useSocket().socket.value?.emit('start_game', { gameType: 'uno', rules: unoRules.value })
}

onMounted(() => {
  document.body.style.backgroundColor = '#0A0A0A'
  
  // Cargar estado guardado de recargas anteriores
  playerStore.loadPlayerSetup()

  // Verificar si tiene setup completo
  if (!playerStore.nickname) {
    showSetupModal.value = true
  } else {
    hasSetup.value = true
    initRoom()
  }
})

onUnmounted(() => {
  disconnect()
  playerStore.updatePlayers([])
})

const saveAndJoin = () => {
  playerStore.setPlayerSetup(tempNickname.value, tempAvatarId.value, tempColor.value)
  showSetupModal.value = false
  hasSetup.value = true
  // Pequeño delay para que vue renderice el DOM antes de animar
  setTimeout(() => {
    initRoom()
  }, 50)
}

const initRoom = () => {
  playerStore.setRoom(roomId)
  connect(roomId)
  
  // Escuchar inicio de juego
  useSocket().socket.value?.on('game_started', (data) => {
    anime({
      targets: 'body',
      opacity: 0,
      duration: 500,
      easing: 'easeInOutQuad',
      complete: () => {
        router.push(`/sala/${roomId}/${data.gameType}`)
        setTimeout(() => { document.body.style.opacity = '1' }, 100)
      }
    })
  })

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
}

const leaveRoom = () => {
  disconnect()
  router.push('/')
}
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
</style>

