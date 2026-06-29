<template>
  <div class="relative min-h-screen flex flex-col bg-transparent text-white font-sans overflow-x-hidden">
    
    <!-- Top Bar -->
    <div class="absolute top-4 left-4 z-50 flex gap-4">
      <!-- Botón Rendirse -->
      <button 
        @click="surrender"
        class="group relative flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all duration-300 active:scale-95 shadow-lg overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)] rounded-xl pointer-events-none"></div>
        <UIcon name="i-heroicons-flag" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Rendirse</span>
      </button>

      <!-- Botón Salir (Pro Max UI) -->
      <button 
        @click="exitGame"
        class="group relative flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-gray-900/40 hover:bg-gray-800/60 text-gray-400 hover:text-white rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 active:scale-95 shadow-lg overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
      >
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] rounded-xl pointer-events-none"></div>
        <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5 text-gray-400 group-hover:text-white" />
        <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Salir al Lobby</span>
      </button>
    </div>

    <!-- Central Table -->
    <UnoTable 
      :top-card="unoStore.topCard"
      :current-color="unoStore.currentColor"
      :pending-draws="unoStore.pendingDraws"
      :is-my-turn="unoStore.currentTurnUserId === playerStore.userId"
      :has-drawn-this-turn="unoStore.hasDrawnThisTurn"
      :my-hand="unoStore.myHand"
      :rivals="unoStore.rivals"
      :current-turn-user-id="unoStore.currentTurnUserId"
      @draw="drawCard"
      @pass-turn="passTurn"
      @challenge="challengeUno"
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

    <!-- Swap Modal -->
    <UnoSwapModal
      :is-open="unoStore.gameState === 'CHOOSING_PLAYER' && unoStore.actionRequiredFrom === playerStore.userId"
      :rivals="unoStore.rivals"
      @select="swapHands"
    />

    <!-- Victory Modal -->
    <UnoVictoryModal
      :is-open="unoStore.gameState === 'FINISHED'"
      :winner-message="unoStore.winner === playerStore.userId ? '¡Has ganado la partida!' : `El ganador es ${unoStore.rivals.find((r: any) => r.userId === unoStore.winner)?.nickname || 'un rival'}.`"
      @lobby="exitGame"
    />
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/playerStore'
import { useUnoStore } from '~/stores/games/unoStore'

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
const passTurn = () => { socket.value?.emit('uno:pass_turn') }

const declareColor = (color: string) => { socket.value?.emit('uno:declare_color', color) }
const yellUno = () => { socket.value?.emit('uno:yell_uno') }
const challengeUno = (targetId: string) => { socket.value?.emit('uno:challenge_uno', targetId) }
const swapHands = (id: string) => { socket.value?.emit('uno:swap_hands', id) }
const onCardHover = (index: number | null) => { socket.value?.emit('uno:hover_card', index) }
const surrender = () => { socket.value?.emit('uno:surrender') }
const exitGame = () => {
  const isHost = playerStore.hostUserId === playerStore.userId;
  
  if (isHost || unoStore.gameState === 'FINISHED') {
    socket.value?.emit('return_to_lobby')
  } else {
    if (unoStore.gameState !== 'WAITING') {
      surrender()
    }
    router.push(`/sala/${roomId}`)
  }
}

onMounted(() => {
  socket.value?.on('game_message', (data: any) => {
    toast.add({ title: 'UNO', description: data.message, color: 'primary', icon: 'i-lucide-info' })
  })
})

onUnmounted(() => {
  socket.value?.off('game_message')
})
</script>
