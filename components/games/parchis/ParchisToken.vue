<template>
  <div 
    ref="tokenContainer"
    class="absolute z-10 w-[4%] h-[4%] -ml-[2%] -mt-[2%] flex items-center justify-center parchis-token transition-all duration-300 pointer-events-auto cursor-pointer"
    :class="{
      'animate-pulse hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20': isClickable
    }"
    :style="{
      left: `${(coordinates.x / 1000) * 100}%`,
      top: `${(coordinates.y / 1000) * 100}%`
    }"
    @click="onTokenClick"
  >
    <div class="token-body relative w-full h-full drop-shadow-lg flex items-center justify-center transform-style-3d">
       
       <!-- GEM -->
       <div v-if="figureId === 'gem'" class="w-full h-full relative" style="transform: rotate(45deg);">
          <div class="absolute inset-0 border-2 shadow-[0_0_10px_currentColor] rounded-sm bg-gradient-to-br from-white/60 to-transparent" 
               :style="{ color: token.color, backgroundColor: token.color, borderColor: 'white' }">
          </div>
          <div class="absolute inset-1 border border-white/50 bg-transparent rounded-sm"></div>
       </div>
       
       <!-- CAR -->
       <div v-else-if="figureId === 'car'" 
            class="w-full h-full rounded-full border-2 shadow-inner flex items-center justify-center overflow-hidden" 
            :style="{ backgroundColor: token.color, borderColor: 'white' }">
          <Car class="w-3/5 h-3/5 text-white opacity-90 drop-shadow-md" />
       </div>

       <!-- WOOD -->
       <div v-else-if="figureId === 'wood'" 
            class="w-full h-full relative rounded-full border-2 overflow-hidden"
            :style="{ backgroundColor: token.color, borderColor: '#3a2212' }">
          <div class="absolute inset-0 opacity-40 mix-blend-multiply flex flex-col justify-center">
            <div class="h-[1px] w-full bg-black my-[1px] rounded-[50%]" v-for="i in 5" :key="i"></div>
          </div>
          <div class="absolute inset-0 rounded-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.5)]"></div>
       </div>

       <!-- DEFAULT -->
       <div v-else class="w-full h-full rounded-full border-[2px] shadow-[4px_6px_8px_rgba(0,0,0,0.5),inset_0_-4px_6px_rgba(0,0,0,0.3)] relative" 
            :style="{ backgroundColor: token.color, borderColor: token.color }">
          <div class="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.7),_transparent)]"></div>
          <div class="absolute inset-[25%] rounded-full border border-black/10 shadow-[0_3px_5px_rgba(0,0,0,0.4)]"
               :style="{ backgroundColor: token.color }">
               <div class="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.9),_transparent)]"></div>
          </div>
       </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, computed, nextTick } from 'vue'
import anime from 'animejs'
import { Car } from 'lucide-vue-next'
import { useParchisStore } from '~/stores/games/parchisStore'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'

const props = defineProps<{
  token: { color: string, ownerId: string, position: number, state: string, id: number },
  figureId?: string,
  coordinates: { x: number, y: number }
}>()

const tokenContainer = ref<HTMLElement | null>(null)
const parchisStore = useParchisStore()
const playerStore = usePlayerStore()
const { socket } = useSocket()
const toast = useToast()

const isClickable = computed(() => {
  return parchisStore.isMyTurn && playerStore.userId === props.token.ownerId
})

const onTokenClick = () => {
  if (!parchisStore.isMyTurn) {
    toast.add({ title: 'No es tu turno', color: 'red' })
    return
  }

  if (playerStore.userId !== props.token.ownerId) {
    return // Not my token
  }

  if (!parchisStore.availableMoves || parchisStore.availableMoves.length === 0) {
    toast.add({ title: 'Tira los dados primero', color: 'orange' })
    return
  }

  if (props.token.state === 'HOME' && !parchisStore.availableMoves.includes(5)) {
    toast.add({ title: 'Necesitas sacar un 5 para salir de la cárcel', color: 'amber' })
    return
  }

  const selectedIdx = parchisStore.selectedDiceIndex
  const diceValue = (selectedIdx !== null && selectedIdx >= 0 && selectedIdx < parchisStore.availableMoves.length)
    ? parchisStore.availableMoves[selectedIdx]
    : parchisStore.availableMoves[0]

  socket.value?.emit('parchis:move_token', { 
    tokenId: props.token.id, 
    diceValue 
  })
}

watch(() => props.coordinates, (newVal, oldVal) => {
  if (oldVal && (newVal.x !== oldVal.x || newVal.y !== oldVal.y)) {
    if (tokenContainer.value) {
      const body = tokenContainer.value.querySelector('.token-body')
      if (body) {
        anime.remove(body)
        anime({
          targets: body,
          translateY: [-30, 0],
          scale: [1.2, 1],
          easing: 'spring(1, 80, 10, 0)',
          duration: 400
        })
      }
    }
  }
})
</script>

<style scoped>
.transform-style-3d {
  transform-style: preserve-3d;
}
</style>