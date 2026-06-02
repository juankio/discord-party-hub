<template>
  <div class="min-h-screen overflow-hidden">
    <NuxtPage v-if="hasSetup" />

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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const { connect, disconnect, socket } = useSocket()

const roomId = route.params.id as string
const showSetupModal = ref(false)
const hasSetup = ref(false)

const tempNickname = ref('')
const tempAvatarId = ref(1)
const tempColor = ref('#f97316')

onMounted(() => {
  document.body.style.backgroundColor = '#0A0A0A'
  playerStore.loadPlayerSetup()

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
  playerStore.setRoom(roomId)
  connect(roomId)
  
  socket.value?.on('game_started', (data) => {
    // Solo redirige si estamos en el lobby
    if (route.path === `/sala/${roomId}`) {
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
