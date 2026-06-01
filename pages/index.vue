<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <!-- Header Decorativo -->
    <div class="absolute top-10 text-center header-anim">
      <h1 class="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-2">
        Discord Party Hub
      </h1>
      <p class="text-gray-400 font-medium">Juega con tus amigos. Fricción cero.</p>
    </div>

    <!-- Contenedor Principal -->
    <div class="w-full max-w-2xl bg-[#1e1f22] p-8 md:p-12 rounded-[2rem] border border-gray-800/50 shadow-2xl relative z-10 mt-20 main-container">
      <AvatarSelector v-model="avatarId" />
      <PlayerSetupForm v-model="nickname" />
      <RoomActions 
        :is-visible="nickname.length >= 2" 
        @create="handleCreateRoom"
        @join="handleJoinRoom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import anime from 'animejs'

const router = useRouter()
const playerStore = usePlayerStore()

const avatarId = ref(playerStore.avatarId || 1)
const nickname = ref(playerStore.nickname || '')

const savePlayerAndRedirect = (roomId: string) => {
  playerStore.setPlayerSetup(nickname.value, avatarId.value)
  
  // Animación de salida
  anime({
    targets: ['.main-container', '.header-anim'],
    opacity: 0,
    translateY: -20,
    duration: 500,
    easing: 'easeInExpo',
    complete: () => {
      router.push(`/sala/${roomId}`)
    }
  })
}

const handleCreateRoom = () => {
  // Generar ID aleatorio
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let roomId = ''
  for (let i = 0; i < 5; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  savePlayerAndRedirect(roomId)
}

const handleJoinRoom = (code: string) => {
  savePlayerAndRedirect(code)
}

onMounted(() => {
  anime({
    targets: '.header-anim',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 1000,
    easing: 'easeOutExpo'
  })
  anime({
    targets: '.main-container',
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: 1000,
    easing: 'easeOutExpo'
  })
})
</script>
