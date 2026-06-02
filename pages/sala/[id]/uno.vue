<template>
  <div class="relative min-h-screen flex flex-col bg-transparent overflow-hidden text-white font-sans">
    
    <!-- Top Bar -->
    <div class="absolute top-4 left-4 z-50">
      <UButton @click="exitGame" color="gray" variant="ghost" icon="i-heroicons-arrow-left">Salir</UButton>
    </div>

    <!-- Rivals Area (Top) -->
    <div class="flex-1 flex justify-center items-start pt-12 gap-8 z-10">
      <div v-for="rival in unoStore.rivals" :key="rival.userId" class="flex flex-col items-center relative">
        <div class="w-16 h-16 rounded-full border-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10"
             :style="{ borderColor: rival.color || '#f97316' }"
             :class="{'neon-glow': unoStore.currentTurnUserId === rival.userId}">
          <img :src="`/avatars/avatar-${rival.avatarId}.svg?v=2`" class="w-full h-full object-cover rounded-full bg-[#151515]" />
          
          <!-- Mini Cards Hand -->
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 flex justify-center w-max pointer-events-none">
            <div class="flex -space-x-2">
              <div v-for="n in Math.min(rival.cardCount, 8)" :key="n" 
                   class="w-4 h-6 bg-gray-800 border border-gray-500 rounded-[2px] shadow-md transform rotate-[-5deg]">
                <div class="w-full h-full bg-red-800 rounded-[2px] opacity-80" 
                     style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 2px);"></div>
              </div>
              <div v-if="rival.cardCount > 8" class="w-4 h-6 bg-black border border-gray-500 rounded-[2px] flex items-center justify-center text-[8px] font-bold text-white z-10 -ml-1">
                +
              </div>
            </div>
          </div>
        </div>
        <span class="mt-4 text-sm font-bold text-gray-300">{{ rival.nickname }}</span>
        
        <!-- Denounce UNO button -->
        <UButton v-if="rival.cardCount === 1 && !rival.hasYelledUno" 
                 size="xs" color="red" class="absolute -bottom-6 whitespace-nowrap animate-bounce z-20"
                 @click="challengeUno(rival.userId)">
          ¡Denunciar!
        </UButton>
      </div>
    </div>

    <!-- Central Table -->
    <div class="flex-1 flex justify-center items-center relative z-10">
      <div class="w-[600px] h-[300px] bg-[#151515] rounded-[100px] border border-gray-800 shadow-2xl flex items-center justify-center relative">
        
        <!-- Deck -->
        <div class="absolute left-16 flex flex-col items-center gap-2">
          <div class="deck-placeholder w-24 h-36 bg-gray-900 border-2 border-gray-700 rounded-xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] cursor-pointer hover:scale-105 transition-transform"
               @click="drawCard($event)">
            <span class="text-3xl font-black text-gray-800 tracking-tighter">UNO</span>
          </div>
          <span class="text-xs text-gray-500 font-bold tracking-widest uppercase">Robar</span>
        </div>

        <!-- Top Card -->
        <div v-if="unoStore.topCard" class="uno-card top-card-anim top-card-placeholder" :class="`card-${unoStore.topCard.color || 'black'}`">
           <div class="inner-oval"><span class="card-value">{{ getCardDisplay(unoStore.topCard) }}</span></div>
           <span class="corner-value top-left">{{ getCardDisplay(unoStore.topCard) }}</span>
           <span class="corner-value bottom-right">{{ getCardDisplay(unoStore.topCard) }}</span>
        </div>
      </div>
    </div>

    <!-- My Hand (Bottom) -->
    <div class="flex-1 flex justify-center items-end pb-8 z-10 relative" ref="handContainer">
      <div class="flex justify-center items-end -space-x-12 sm:-space-x-10">
        <div v-for="(card, index) in unoStore.myHand" :key="card.id" 
             class="card-wrapper"
             :style="{ transform: `rotate(${(index - (unoStore.myHand.length - 1)/2) * 4}deg) translateY(${Math.abs(index - (unoStore.myHand.length - 1)/2) * 3}px)` }">
          <div class="uno-card hand-card cursor-pointer"
               :class="`card-${card.color || 'black'}`"
               @click="playCard(card.id, $event)">
            <div class="inner-oval"><span class="card-value">{{ getCardDisplay(card) }}</span></div>
            <span class="corner-value top-left">{{ getCardDisplay(card) }}</span>
            <span class="corner-value bottom-right">{{ getCardDisplay(card) }}</span>
          </div>
        </div>
      </div>

      <!-- Yell UNO Button -->
      <div class="absolute right-12 bottom-12" v-if="unoStore.myHand.length <= 2">
        <button class="w-24 h-24 bg-red-600 rounded-full border-4 border-white text-white font-black text-2xl shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-110 active:scale-95 transition-transform"
                @click="yellUno">
          UNO!
        </button>
      </div>
    </div>

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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import { useUnoStore } from '~/stores/games/unoStore'
import { useSocket } from '~/composables/useSocket'
import anime from 'animejs'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id as string

const playerStore = usePlayerStore()
const unoStore = useUnoStore()
const { socket } = useSocket()
const toast = useToast()

const getCardDisplay = (card: any) => {
  if (!card) return ''
  if (['0','1','2','3','4','5','6','7','8','9'].includes(card.value)) return card.value
  if (card.value === 'skip') return '⊘'
  if (card.value === 'reverse') return '⇄'
  if (card.value === 'draw2') return '+2'
  if (card.value === 'wild') return 'W'
  if (card.value === 'wild_draw4') return '+4'
  return ''
}

const playCard = (id: string, event: Event) => {
  if (unoStore.currentTurnUserId !== playerStore.userId) return
  
  const target = event.currentTarget as HTMLElement
  target.style.pointerEvents = 'none'

  // Get absolute positions for realistic flying
  const rect = target.getBoundingClientRect()
  const topCardEl = document.querySelector('.top-card-placeholder')
  const topRect = topCardEl ? topCardEl.getBoundingClientRect() : { top: window.innerHeight/2 - 80, left: window.innerWidth/2 - 55 }

  // Create flying clone
  const clone = target.cloneNode(true) as HTMLElement
  document.body.appendChild(clone)
  
  clone.style.position = 'fixed'
  clone.style.top = `${rect.top}px`
  clone.style.left = `${rect.left}px`
  clone.style.margin = '0'
  clone.style.zIndex = '9999'
  clone.style.transform = 'none' // Reset wrapper rotation
  
  target.style.opacity = '0' // Hide original immediately

  anime({
    targets: clone,
    top: topRect.top,
    left: topRect.left,
    rotate: anime.random(-25, 25),
    scale: 1, // Final size
    duration: 350,
    easing: 'easeOutCubic',
    complete: () => {
      clone.remove()
      socket.value?.emit('uno:play_cards', [id])
    }
  })
}

const isDrawing = ref(false)
const drawCard = (event: Event) => {
  if (unoStore.currentTurnUserId !== playerStore.userId) return
  if (isDrawing.value) return
  isDrawing.value = true
  
  const target = event.currentTarget as HTMLElement
  anime({
    targets: target,
    scale: [1, 1.2, 1],
    translateY: [0, -15, 0],
    rotate: [0, 5, -5, 0],
    duration: 400,
    easing: 'easeOutElastic(1, .5)',
    complete: () => {
      socket.value?.emit('uno:draw_card')
      setTimeout(() => isDrawing.value = false, 300)
    }
  })
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

watch(() => unoStore.myHand.length, async (newLen, oldLen) => {
  if (newLen > oldLen) {
    await nextTick()
    
    // Calcular posición aproximada del mazo vs la mano (La mano está abajo, mazo al centro)
    const deckEl = document.querySelector('.deck-placeholder')
    const deckRect = deckEl ? deckEl.getBoundingClientRect() : { top: window.innerHeight/2, left: window.innerWidth/2 }
    
    // Asumimos la posición destino (las cartas nuevas) vs el mazo (origen)
    // Para simplificar y mantenerlo ultra fluido, usamos offsets relativos a la pantalla
    const yOffset = - (window.innerHeight - deckRect.top) + 150
    const xOffset = deckRect.left - (window.innerWidth / 2)
    
    anime({
      targets: '.card-wrapper:nth-last-child(-n+' + (newLen - oldLen) + ') .hand-card',
      translateY: [yOffset, 0], 
      translateX: [xOffset, 0],
      scale: [0.2, 1],
      opacity: [0, 1],
      duration: 500, 
      easing: 'easeOutElastic(1, .8)'
    })
  }
})

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
  anime({
    targets: '.hand-card',
    translateY: [200, 0], opacity: [0, 1],
    delay: anime.stagger(80), easing: 'easeOutElastic(1, .8)'
  })

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

<style scoped>
.neon-glow {
  box-shadow: 0 0 20px currentColor, inset 0 0 10px currentColor;
  animation: pulse-glow 1.5s infinite alternate;
}
@keyframes pulse-glow {
  from { filter: drop-shadow(0 0 5px currentColor); }
  to { filter: drop-shadow(0 0 15px currentColor); }
}

.card-wrapper { 
  transform-origin: bottom center; 
  transition: transform 0.3s ease, margin 0.2s ease, z-index 0s; 
  z-index: 1;
}
.card-wrapper:hover {
  z-index: 50;
  margin: 0 10px; /* Empuja a las cartas vecinas para verla mejor */
}
.hand-card {
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease;
}
.card-wrapper:hover .hand-card {
  transform: translateY(-40px) scale(1.15) !important;
  box-shadow: 0 20px 30px rgba(0,0,0,0.6);
}

.uno-card {
  width: 110px; height: 160px;
  border-radius: 10px; border: 5px solid white;
  position: relative; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5); user-select: none;
  background-color: white; /* Fallback */
}
.card-red { background-color: #ef4444; }
.card-blue { background-color: #3b82f6; }
.card-green { background-color: #22c55e; }
.card-yellow { background-color: #eab308; }
.card-black { background-color: #1f2937; border-color: #111; }

.inner-oval {
  width: 85%; height: 85%; background: white;
  border-radius: 50% 50% / 65% 65%;
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-25deg);
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.3);
}
.card-red .inner-oval { color: #ef4444; }
.card-blue .inner-oval { color: #3b82f6; }
.card-green .inner-oval { color: #22c55e; }
.card-yellow .inner-oval { color: #eab308; }

.card-black .inner-oval { 
  background-color: #1a1a1a !important; 
  border: 4px solid transparent;
  background-clip: padding-box;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
}
.card-black .inner-oval::before {
  content: ''; position: absolute; inset: -4px; border-radius: inherit;
  background: linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6);
  z-index: -1;
}

.card-value {
  font-size: 3rem; font-weight: 900;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
  transform: rotate(25deg);
  line-height: 1;
}

.card-black .card-value {
  color: white !important;
  font-size: 2.5rem;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5) !important;
  background: none !important;
  -webkit-text-fill-color: white !important;
}

.corner-value {
  position: absolute; font-size: 1.1rem; font-weight: bold;
  color: white; text-shadow: 1px 1px 0px rgba(0,0,0,0.5);
}
.top-left { top: 4px; left: 6px; }
.bottom-right { bottom: 4px; right: 6px; transform: rotate(180deg); }
</style>
