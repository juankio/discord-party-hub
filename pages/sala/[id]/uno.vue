<template>
  <div class="relative min-h-screen flex flex-col bg-transparent overflow-hidden text-white font-sans">
    
    <!-- Top Bar -->
    <div class="absolute top-4 left-4 z-50 flex gap-4">
      <UButton color="red" variant="soft" icon="i-heroicons-flag" @click="surrender">Rendirse</UButton>
      <UButton color="gray" variant="ghost" icon="i-heroicons-arrow-left" @click="exitGame">Salir al Lobby</UButton>
    </div>

    <!-- Rivals Area -->
    <UnoRivals 
      :rivals="unoStore.rivals" 
      :current-turn-user-id="unoStore.currentTurnUserId"
      @challenge="challengeUno"
    />

    <!-- Central Table -->
    <UnoTable 
      :top-card="unoStore.topCard"
      :current-color="unoStore.currentColor"
      :pending-draws="unoStore.pendingDraws"
      :is-my-turn="unoStore.currentTurnUserId === playerStore.userId"
      @draw="drawCard"
    />

    <!-- My Hand Area -->
    <UnoHand 
      :my-hand="unoStore.myHand"
      :is-my-turn="unoStore.currentTurnUserId === playerStore.userId"
      :top-card="unoStore.topCard"
      :current-color="unoStore.currentColor"
      :pending-draws="unoStore.pendingDraws"
      @play-card="playCard"
      @yell-uno="yellUno"
      @hover-card="onCardHover"
    />

    <!-- Color Modal -->
    <UnoColorModal 
      :is-open="unoStore.gameState === 'CHOOSING_COLOR' && unoStore.actionRequiredFrom === playerStore.userId"
      @select="declareColor"
    />

    <!-- Victory Modal -->
    <UnoVictoryModal
      :is-open="unoStore.gameState === 'FINISHED'"
      :winner-message="unoStore.winner === playerStore.userId ? '¡Has ganado la partida!' : `El ganador es ${unoStore.rivals.find((r: any) => r.userId === unoStore.winner)?.nickname || 'un rival'}.`"
      :is-host="playerStore.userId === playerStore.hostUserId"
      @lobby="exitGame"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import { useUnoStore } from '~/stores/games/unoStore'
import { useSocket } from '~/composables/useSocket'
import { useUnoAnimations } from '~/composables/useUnoAnimations'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id as string

const playerStore = usePlayerStore()
const unoStore = useUnoStore()
const { socket } = useSocket()
const toast = useToast()

const { playCardAnimation, drawCardAnimation } = useUnoAnimations(unoStore, playerStore, socket)

const playCard = (id: string) => playCardAnimation(id)
const drawCard = () => drawCardAnimation()

const declareColor = (color: string) => { socket.value?.emit('uno:declare_color', color) }
const yellUno = () => { socket.value?.emit('uno:yell_uno') }
const challengeUno = (targetId: string) => { socket.value?.emit('uno:challenge_uno', targetId) }
const onCardHover = (index: number | null) => { socket.value?.emit('uno:hover_card', index) }
const surrender = () => { socket.value?.emit('uno:surrender') }
const exitGame = () => {
  if (unoStore.gameState === 'FINISHED' && playerStore.userId === playerStore.hostUserId) {
    socket.value?.emit('return_to_lobby')
  } else {
    router.push(`/sala/${roomId}`)
  }
}

watch(() => unoStore.gameState, (newState, oldState) => {
  if (newState === 'FINISHED' && oldState !== 'FINISHED') {
    if (unoStore.winner === playerStore.userId) {
      playerStore.incrementWin()
    }
  }
})

onMounted(() => {
  socket.value?.on('game_message', (data: any) => {
    toast.add({ title: 'UNO', description: data.message, color: 'primary', icon: 'i-lucide-info' })
  })
})

onUnmounted(() => {
  socket.value?.off('game_message')
})
</script>
