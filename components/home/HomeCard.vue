<template>
  <div class="w-full max-w-[420px] bg-[#151515] rounded-3xl shadow-2xl flex flex-col items-center border border-white/5 overflow-hidden">
    
    <!-- Tabs -->
    <div class="flex w-full bg-black/50 border-b border-white/5">
      <button 
        class="flex-1 py-4 text-xs font-bold tracking-widest transition-all outline-none border-b-2" 
        :class="activeTab === 'guest' ? 'bg-white/5' : 'border-transparent text-gray-600 hover:text-gray-300'"
        :style="activeTab === 'guest' ? { color: 'var(--theme-color)', borderColor: 'var(--theme-color)' } : {}"
        @click="activeTab = 'guest'"
      >
        INVITADO
      </button>
      <button 
        class="flex-1 py-4 text-xs font-bold tracking-widest transition-all outline-none border-b-2" 
        :class="activeTab === 'account' ? 'bg-white/5' : 'border-transparent text-gray-600 hover:text-gray-300'"
        :style="activeTab === 'account' ? { color: 'var(--theme-color)', borderColor: 'var(--theme-color)' } : {}"
        @click="activeTab = 'account'"
      >
        CUENTA
      </button>
    </div>

    <div class="p-6 w-full flex flex-col items-center gap-6">
      <!-- Modo Invitado -->
      <template v-if="activeTab === 'guest'">
        <GuestSetup 
          v-model:avatar-id="avatarId"
          v-model:color="selectedColor"
          v-model:nickname="nickname"
          v-model:room-code="roomCode"
          :is-valid="isValid"
          @create-room="handleCreateRoom"
          @join-room="handleJoinRoom"
        />
      </template>

      <!-- Modo Cuenta -->
      <template v-else>
        <AccountSetup />
        
        <!-- Botones de Jugar si ya está logueado -->
        <div v-if="playerStore.isLoggedIn" class="w-full mt-4 pt-4 border-t border-white/5">
          <div v-if="!showJoinInput" class="w-full flex items-center justify-between gap-4">
            <button 
              class="text-gray-500 hover:text-white text-sm font-bold transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] pl-2"
              @click="showJoinInput = true"
            >
              Tengo Código
            </button>
            <button 
              class="text-white px-7 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              style="background-color: var(--theme-color); box-shadow: 0 0 15px rgba(var(--theme-color-rgb), 0.3);"
              onmouseover="this.style.filter='brightness(1.1)'; this.style.boxShadow='0 0 20px rgba(var(--theme-color-rgb), 0.5)';"
              onmouseout="this.style.filter='none'; this.style.boxShadow='0 0 15px rgba(var(--theme-color-rgb), 0.3)';"
              @click="handleCreateRoom"
            >
              Crear Sala
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Join Input -->
          <div v-else class="w-full flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <input 
                v-model="roomCode"
                type="text"
                placeholder="CÓDIGO (5 LETRAS)"
                class="flex-1 bg-black text-white px-4 py-3 rounded-2xl outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-mono font-bold tracking-[0.2em] text-center uppercase"
                maxlength="5"
              >
            </div>
            <div class="flex items-center justify-between w-full px-2">
              <button 
                class="text-gray-500 hover:text-white text-xs font-bold transition-colors"
                @click="showJoinInput = false"
              >
                CANCELAR
              </button>
              <button 
                :disabled="roomCode.length < 5"
                class="bg-white hover:bg-gray-200 text-black px-8 py-2.5 rounded-full font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                @click="handleJoinRoom"
              >
                UNIRSE
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
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

watch(selectedColor, (newColor) => {
  playerStore.color = newColor
  if (typeof window !== 'undefined') {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}` : '249, 115, 22';
    }
    document.documentElement.style.setProperty('--theme-color', newColor)
    document.documentElement.style.setProperty('--theme-color-rgb', hexToRgb(newColor))
  }
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
  playerStore.loadPlayerSetup()
  if (playerStore.nickname) {
    nickname.value = playerStore.nickname
    avatarId.value = playerStore.avatarId
    selectedColor.value = playerStore.color
  }
})
</script>