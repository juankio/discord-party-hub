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

const startGame = () => {
  socket.value?.emit('start_game', { gameType: 'uno', rules: unoRules.value })
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
</style>
