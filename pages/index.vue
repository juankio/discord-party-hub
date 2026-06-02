<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
    
    <!-- Header Decorativo -->
    <div class="absolute top-12 text-center header-anim opacity-0 -translate-y-5">
      <h1 class="text-4xl md:text-5xl font-black text-white pb-1 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        PARTY HUB
      </h1>
      <p class="text-gray-500 text-sm font-medium tracking-widest uppercase mt-1">Juega con fricción cero</p>
    </div>

    <!-- Contenedor Principal y Leaderboard -->
    <div class="flex flex-col md:flex-row items-start justify-center gap-6 mt-16 w-full max-w-4xl relative z-10 main-container opacity-0 translate-y-5">
      
      <!-- Tarjeta Principal -->
      <div class="w-full max-w-[380px] bg-[#151515] rounded-3xl shadow-2xl flex flex-col items-center border border-white/5 overflow-hidden">
        
        <!-- Tabs -->
        <div class="flex w-full bg-black/50 border-b border-white/5">
          <button 
            @click="activeTab = 'guest'" 
            class="flex-1 py-4 text-xs font-bold tracking-widest transition-all outline-none"
            :class="activeTab === 'guest' ? 'text-orange-500 border-b-2 border-orange-500 bg-white/5' : 'text-gray-600 hover:text-gray-300'"
          >
            INVITADO
          </button>
          <button 
            @click="activeTab = 'account'" 
            class="flex-1 py-4 text-xs font-bold tracking-widest transition-all outline-none"
            :class="activeTab === 'account' ? 'text-orange-500 border-b-2 border-orange-500 bg-white/5' : 'text-gray-600 hover:text-gray-300'"
          >
            CUENTA
          </button>
        </div>

        <div class="p-6 w-full flex flex-col items-center gap-6">
          <!-- Modo Invitado -->
          <template v-if="activeTab === 'guest'">
            <GuestSetup 
              v-model:avatarId="avatarId"
              v-model:color="selectedColor"
              v-model:nickname="nickname"
              v-model:roomCode="roomCode"
              :isValid="isValid"
              @createRoom="handleCreateRoom"
              @joinRoom="handleJoinRoom"
            />
          </template>

          <!-- Modo Cuenta -->
          <template v-else>
            <AccountSetup />
            
            <!-- Botones de Jugar si ya está logueado -->
            <div class="w-full mt-4 pt-4 border-t border-white/5" v-if="playerStore.isLoggedIn">
              <div class="w-full flex items-center justify-between gap-4" v-if="!showJoinInput">
                <button 
                  @click="showJoinInput = true"
                  class="text-gray-500 hover:text-white text-sm font-bold transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] pl-2"
                >
                  Tengo Código
                </button>
                <button 
                  @click="handleCreateRoom"
                  class="bg-[#f97316] hover:bg-orange-500 text-white px-7 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                >
                  Crear Sala
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>

              <!-- Join Input (Si hizo click en "Tengo Código") -->
              <div class="w-full flex flex-col gap-3" v-else>
                <div class="flex items-center gap-2">
                  <input 
                    v-model="roomCode"
                    type="text"
                    placeholder="CÓDIGO (5 LETRAS)"
                    class="flex-1 bg-black text-white px-4 py-3 rounded-2xl outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-mono font-bold tracking-[0.2em] text-center uppercase"
                    maxlength="5"
                  />
                </div>
                <div class="flex items-center justify-between w-full px-2">
                  <button 
                    @click="showJoinInput = false"
                    class="text-gray-500 hover:text-white text-xs font-bold transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button 
                    @click="handleJoinRoom"
                    :disabled="roomCode.length < 5"
                    class="bg-white hover:bg-gray-200 text-black px-8 py-2.5 rounded-full font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  >
                    UNIRSE
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Leaderboard -->
      <Leaderboard />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import anime from 'animejs'

const router = useRouter()
const playerStore = usePlayerStore()

const avatarId = ref(playerStore.avatarId || 1)
const nickname = ref(playerStore.nickname || '')
const selectedColor = ref(playerStore.color || '#f97316') // Orange default

const roomCode = ref('')
const activeTab = ref('guest')
const showJoinInput = ref(false)

const isValid = computed(() => {
  if (activeTab.value === 'account' && playerStore.isLoggedIn) return true
  return nickname.value.trim().length >= 2
})

const savePlayerAndRedirect = (roomId: string) => {
  if (activeTab.value === 'guest') {
    playerStore.setPlayerSetup(nickname.value.trim(), avatarId.value, selectedColor.value)
  }
  
  anime({
    targets: ['.main-container', '.header-anim'],
    opacity: 0,
    translateY: -30,
    scale: 0.95,
    duration: 400,
    easing: 'easeInQuad',
    complete: () => {
      router.push(`/sala/${roomId.toUpperCase()}`)
    }
  })
}

const handleCreateRoom = () => {
  if (!isValid.value) return
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let roomId = ''
  for (let i = 0; i < 5; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  savePlayerAndRedirect(roomId)
}

const handleJoinRoom = () => {
  if (!isValid.value || roomCode.value.length < 5) return
  savePlayerAndRedirect(roomCode.value)
}

onMounted(() => {
  document.body.style.backgroundColor = '#0A0A0A'
  
  playerStore.loadPlayerSetup()
  if (playerStore.nickname) {
    nickname.value = playerStore.nickname
    avatarId.value = playerStore.avatarId
    selectedColor.value = playerStore.color
  }

  anime({
    targets: '.header-anim',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 800,
    easing: 'easeOutExpo'
  })
  anime({
    targets: '.main-container',
    scale: [0.9, 1],
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: 100,
    easing: 'easeOutExpo'
  })
})
</script>

