<template>
  <div class="min-h-screen overflow-hidden">
    <NuxtPage />

    <!-- Modal Obligatorio si entra directo con link sin nickname -->
    <div v-if="showSetupModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div class="w-full max-w-[380px] bg-[#151515] p-6 pb-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-white/5 relative">
        <h2 class="text-xl font-black text-white text-center tracking-widest uppercase mt-2">Únete a la Sala</h2>
        
        <ProfileSetup 
          v-model:avatar-id="tempAvatarId"
          v-model:color="tempColor"
          v-model:nickname="tempNickname"
        />

        <!-- Separador -->
        <div class="w-full flex items-center gap-4 my-2 opacity-50">
          <div class="h-px bg-white flex-1"/>
          <span class="text-[10px] font-bold tracking-widest text-white uppercase">O</span>
          <div class="h-px bg-white flex-1"/>
        </div>

        <!-- Botón Google -->
        <a :href="(config.public.socketUrl || 'http://localhost:3001').replace(/\/$/, '') + '/api/auth/google/login'" class="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black px-6 py-3.5 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] decoration-none">
          <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          CONTINUAR CON GOOGLE
        </a>

        <button 
          :disabled="tempNickname.trim().length < 2"
          class="w-full disabled:opacity-50 disabled:cursor-not-allowed px-7 py-3.5 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 mt-2"
          style="background-color: var(--theme-color); color: var(--theme-text-color, white); box-shadow: 0 0 15px rgba(var(--theme-color-rgb), 0.3);"
          onmouseover="if(!this.disabled) { this.style.filter='brightness(1.1)'; this.style.boxShadow='0 0 20px rgba(var(--theme-color-rgb), 0.5)'; }"
          onmouseout="if(!this.disabled) { this.style.filter='none'; this.style.boxShadow='0 0 15px rgba(var(--theme-color-rgb), 0.3)'; }"
          @click="saveAndJoin"
        >
          Entrar a Jugar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/playerStore'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const config = useRuntimeConfig()
const { connect, disconnect, socket } = useSocket()

const roomId = route.params.id as string
const showSetupModal = ref(false)
const hasSetup = ref(false)

const tempNickname = ref('')
const tempAvatarId = ref(1)
const tempColor = ref('#f97316')

onMounted(() => {
  document.body.style.backgroundColor = '#0A0A0A'
  
  // Limpiar el estado de la sala anterior para evitar "fantasmas" visuales
  playerStore.updateRoomState([], '')
  
  playerStore.loadPlayerSetup()
  playerStore.setRoom(route.params.id as string)

  if (!playerStore.nickname) {
    showSetupModal.value = true
  } else {
    hasSetup.value = true
    initRoom()
  }
})

onUnmounted(() => {
  disconnect()
  playerStore.updateRoomState([], '')
})

const saveAndJoin = () => {
  playerStore.setPlayerSetup(tempNickname.value, tempAvatarId.value, tempColor.value)
  showSetupModal.value = false
  hasSetup.value = true
  setTimeout(() => { initRoom() }, 50)
}

const initRoom = () => {
  
  connect(roomId)
  
  socket.value?.on('game_started', (data) => {
    // Solo redirige si estamos en el lobby
    if (route.path.replace(/\/$/, '') === `/sala/${roomId}`) {
      document.body.style.transition = 'opacity 0.5s'
      document.body.style.opacity = '0'
      setTimeout(() => {
        router.push(`/sala/${roomId}/${data.gameType}`)
        setTimeout(() => { document.body.style.opacity = '1' }, 100)
      }, 500)
    }
  })
}
</script>
