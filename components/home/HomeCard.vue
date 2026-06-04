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
          <HomeRoomControls v-model:roomCode="roomCode" :isValid="isValid" @createRoom="handleCreateRoom" @joinRoom="handleJoinRoom" />
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
    document.documentElement.style.setProperty('--theme-text-color', newColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff')
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
  
  // Auto-switch a la pestaña de cuenta si el usuario está logueado
  if (playerStore.isLoggedIn) {
    activeTab.value = 'account'
  }
})
</script>