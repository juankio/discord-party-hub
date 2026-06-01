<template>
  <div class="min-h-screen flex flex-col items-center pt-8 md:pt-16 p-4">
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

      <!-- Panel de Control (Host) -->
      <div v-if="players.length > 0 && players[0].nickname === playerStore.nickname" class="mt-16 flex flex-col items-center controls-anim opacity-0">
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
        
        <UButton 
          size="xl" 
          color="primary" 
          class="mt-8 px-12 h-14 text-lg font-bold shadow-lg shadow-primary/30"
          :disabled="players.length < 2"
        >
          Empezar Partida
        </UButton>
        <p v-if="players.length < 2" class="text-sm text-gray-500 mt-2">Esperando más jugadores...</p>
      </div>
      
      <!-- Panel de Espera (Invitados) -->
      <div v-else class="mt-16 text-center controls-anim opacity-0">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-200">Esperando al Host...</h3>
        <p class="text-gray-400">El creador de la sala elegirá el juego.</p>
      </div>

    </div>

    <!-- Modal Obligatorio si entra directo con link sin nickname -->
    <UModal v-model="showSetupModal" prevent-close>
      <div class="p-8 bg-[#1e1f22] rounded-3xl border border-gray-700">
        <h2 class="text-2xl font-bold text-white text-center mb-6">¡Únete a la Sala!</h2>
        <AvatarSelector v-model="tempAvatarId" />
        <PlayerSetupForm v-model="tempNickname" />
        <UButton 
          class="mt-8 w-full h-12 text-lg font-bold" 
          color="primary"
          :disabled="tempNickname.length < 2"
          @click="saveAndJoin"
        >
          Entrar a Jugar
        </UButton>
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

// Estado temporal para el modal
const tempNickname = ref('')
const tempAvatarId = ref(1)

const players = computed(() => playerStore.playersInRoom)

onMounted(() => {
  // Verificar si tiene setup completo
  if (!playerStore.nickname) {
    showSetupModal.value = true
  } else {
    initRoom()
  }
})

onUnmounted(() => {
  disconnect()
  playerStore.updatePlayers([])
})

const saveAndJoin = () => {
  playerStore.setPlayerSetup(tempNickname.value, tempAvatarId.value)
  showSetupModal.value = false
  initRoom()
}

const initRoom = () => {
  playerStore.setRoom(roomId)
  connect(roomId)
  
  // Animaciones de entrada
  setTimeout(() => {
    anime({
      targets: '.header-anim',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 800,
      easing: 'easeOutExpo'
    })
    anime({
      targets: '.controls-anim',
      opacity: [0, 1],
      translateY: [20, 0],
      delay: 400,
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
