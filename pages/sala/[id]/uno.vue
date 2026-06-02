<template>
  <div class="relative min-h-screen flex flex-col bg-transparent overflow-hidden text-white font-sans">
    
    <!-- Top Bar -->
    <div class="absolute top-4 left-4 z-50 flex gap-4">
      <UButton @click="surrender" color="red" variant="soft" icon="i-heroicons-flag">Rendirse</UButton>
      <UButton @click="exitGame" color="gray" variant="ghost" icon="i-heroicons-arrow-left">Salir al Lobby</UButton>
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

// Sincronizar el mouse (Hover) con el backend
const onCardHover = (index: number | null) => {
  socket.value?.emit('uno:hover_card', index)
}

const surrender = () => {
  socket.value?.emit('uno:surrender')
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
  if (typeof window !== 'undefined') {
    window.addEventListener('uno:action', handleRivalAnimation as EventListener)
  }
  
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
  if (typeof window !== 'undefined') {
    window.removeEventListener('uno:action', handleRivalAnimation as EventListener)
  }
  socket.value?.off('game_message')
})

const handleRivalAnimation = (e: CustomEvent) => {
  const { action, userId, cardsCount } = e.detail
  
  if (userId === playerStore.userId) return // Ignorar si soy yo

  const rivalEl = document.querySelector(`.flex-col:has([style*="${unoStore.rivals.find(r=>r.userId===userId)?.color}"])`) // Fallback cutre para buscar el rival
  // ... Aunque como no puedo inyectar ref fácilmente en el v-for del hijo, lo haremos con selectores CSS absolutos
  
  const topCardEl = document.querySelector('.top-card-placeholder')
  const deckEl = document.querySelector('.deck-placeholder')
  
  if (action === 'rival_played' && topCardEl) {
    const topRect = topCardEl.getBoundingClientRect()
    // Animacion genérica que vuela de arriba hacia el centro
    const clone = document.createElement('div')
    clone.className = 'w-16 h-24 bg-red-800 rounded border-2 border-white fixed z-[9999]'
    clone.style.top = `-50px` // Viene del top
    clone.style.left = `${window.innerWidth / 2}px`
    document.body.appendChild(clone)
    
    anime({
      targets: clone,
      top: topRect.top, left: topRect.left, scale: 0.5, opacity: 0, rotate: anime.random(-45, 45),
      duration: 400, easing: 'easeInCubic',
      complete: () => clone.remove()
    })
  }
  
  if (action === 'rival_drew' && deckEl) {
    const deckRect = deckEl.getBoundingClientRect()
    for (let i = 0; i < cardsCount; i++) {
      setTimeout(() => {
        const clone = document.createElement('div')
        clone.className = 'w-16 h-24 bg-red-800 rounded border-2 border-white fixed z-[9999]'
        clone.style.top = `${deckRect.top}px`
        clone.style.left = `${deckRect.left}px`
        document.body.appendChild(clone)
        
        anime({
          targets: clone,
          top: -50, scale: 0.5, opacity: 0, rotate: anime.random(-45, 45),
          duration: 400, easing: 'easeOutCubic',
          complete: () => clone.remove()
        })
      }, i * 150)
    }
  }
}
</script>
