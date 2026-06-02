<template>
  <div class="relative min-h-screen flex flex-col bg-transparent overflow-hidden text-white font-sans">
    
    <!-- Top Bar -->
    <div class="absolute top-4 left-4 z-50">
      <UButton @click="exitGame" color="gray" variant="ghost" icon="i-heroicons-arrow-left">Salir</UButton>
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
    />

    <!-- Color Modal -->
    <div v-if="unoStore.gameState === 'CHOOSING_COLOR' && unoStore.actionRequiredFrom === playerStore.userId" 
         class="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <h2 class="text-4xl font-black mb-8 drop-shadow-lg text-white">Elige un color</h2>
      <div class="grid grid-cols-2 gap-6">
        <div @click="declareColor('red')" class="w-32 h-32 bg-red-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.5)]"></div>
        <div @click="declareColor('blue')" class="w-32 h-32 bg-blue-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.5)]"></div>
        <div @click="declareColor('green')" class="w-32 h-32 bg-green-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.5)]"></div>
        <div @click="declareColor('yellow')" class="w-32 h-32 bg-yellow-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.5)]"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import { useUnoStore } from '~/stores/games/unoStore'
import { useSocket } from '~/composables/useSocket'
import UnoRivals from '~/components/games/uno/UnoRivals.vue'
import UnoTable from '~/components/games/uno/UnoTable.vue'
import UnoHand from '~/components/games/uno/UnoHand.vue'
import anime from 'animejs'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id as string

const playerStore = usePlayerStore()
const unoStore = useUnoStore()
const { socket } = useSocket()
const toast = useToast()

const playCard = (id: string) => {
  // Emit event after UnoHand finishes animation
  socket.value?.emit('uno:play_cards', [id])
}

const drawCard = () => {
  // Animación de robar (vuela desde el centro hacia la mano)
  const deckEl = document.querySelector('.deck-placeholder')
  const handContainer = document.querySelector('.card-wrapper')
  
  if (deckEl) {
    const rect = deckEl.getBoundingClientRect()
    // Creamos una carta falsa que baja volando
    const clone = document.createElement('div')
    clone.className = 'w-20 h-32 bg-red-600 rounded-lg border-4 border-white shadow-xl fixed z-[9999]'
    clone.style.top = `${rect.top}px`
    clone.style.left = `${rect.left}px`
    document.body.appendChild(clone)
    
    anime({
      targets: clone,
      top: window.innerHeight - 100, // Cae hacia abajo
      left: window.innerWidth / 2,
      scale: 0.5,
      rotate: anime.random(-45, 45),
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInQuad',
      complete: () => {
        clone.remove()
        socket.value?.emit('uno:draw_card')
      }
    })
  } else {
    socket.value?.emit('uno:draw_card')
  }
}

const declareColor = (color: string) => {
  socket.value?.emit('uno:declare_color', color)
}

const yellUno = () => {
  socket.value?.emit('uno:yell_uno')
}

const challengeUno = (targetId: string) => {
  socket.value?.emit('uno:challenge_uno', targetId)
}

const exitGame = () => {
  router.push(`/sala/${roomId}`)
}

watch(() => unoStore.topCard, async (newCard, oldCard) => {
  if (newCard && newCard.id !== oldCard?.id) {
    await nextTick()
    anime({
      targets: '.top-card-anim',
      scale: [1.5, 1],
      opacity: [0, 1],
      rotate: () => anime.random(-15, 15),
      duration: 400,
      easing: 'easeOutBounce'
    })
  }
}, { deep: true })

onMounted(() => {
  socket.value?.on('game_message', (data) => {
    toast.add({
      title: 'UNO',
      description: data.message,
      color: 'primary',
      icon: 'i-lucide-info'
    })
  })
})

onUnmounted(() => {
  socket.value?.off('game_message')
})
</script>
