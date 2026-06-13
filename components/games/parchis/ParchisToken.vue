<template>
  <div 
    ref="tokenContainer"
    class="absolute z-10 w-[50px] h-[50px] -ml-[25px] -mt-[25px] flex items-center justify-center parchis-token transition-all duration-300 pointer-events-auto cursor-pointer"
    :style="{
      left: `${(coordinates.x / 1140) * 100}%`,
      top: `${(coordinates.y / 1140) * 100}%`
    }"
    @click="onTokenClick"
  >
    <div class="token-body relative w-3/4 h-3/4 flex items-center justify-center transform-style-3d"
         :class="[ isClickable ? 'animate-pulse scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'drop-shadow-[0_8px_6px_rgba(0,0,0,0.6)]' ]">
       
       <div class="w-full h-full rounded-full border-4 relative" 
            :style="{ 
              backgroundColor: token.color, 
              borderColor: 'rgba(0,0,0,0.3)',
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), ${token.color} 50%, rgba(0,0,0,0.4))`
            }">
          <div class="absolute inset-[2px] rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.4)] flex items-center justify-center"
               :style="{ 
                 background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${token.color} 70%)`
               }">
            <component 
              v-if="figureId && iconMap[figureId]" 
              :is="iconMap[figureId]" 
              class="w-5 h-5 text-white/90" 
              style="filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5))"
            />
            <div v-else class="w-3 h-3 rounded-full bg-white opacity-80 shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
          </div>
       </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import anime from 'animejs'
import { Dog, Car, HardHat, Sailboat, Gem, Trees } from 'lucide-vue-next'
import { useParchisStore } from '~/stores/games/parchisStore'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'
import { useToast } from '#imports'

const iconMap: Record<string, any> = {
  dog: Dog,
  car: Car,
  hat: HardHat,
  boat: Sailboat,
  gem: Gem,
  wood: Trees
}

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
  return parchisStore.isMyTurn && playerStore.userId === props.token.ownerId && parchisStore.availableMoves.length > 0
})

const onTokenClick = () => {
  if (!parchisStore.isMyTurn) {
    toast.add({ title: 'No es tu turno', color: 'red' })
    return
  }
  if (playerStore.userId !== props.token.ownerId) {
    toast.add({ title: 'Esta no es tu ficha', color: 'red' })
    return
  }
  if (!parchisStore.availableMoves || parchisStore.availableMoves.length === 0) {
    toast.add({ title: 'Tira los dados primero', color: 'orange' })
    return
  }
  if (props.token.state === 'HOME' && !parchisStore.availableMoves.includes(5)) {
    toast.add({ title: 'Necesitas sacar un 5 para salir de la cárcel', color: 'amber' })
    return
  }

  // Use selected dice if available, else first move
  const moveVal = parchisStore.selectedDiceIndex !== null && parchisStore.selectedDiceIndex !== undefined
    ? parchisStore.availableMoves[parchisStore.selectedDiceIndex]
    : parchisStore.availableMoves[0];

  socket.value?.emit('parchis:move_token', { 
    tokenId: props.token.id, 
    diceValue: moveVal 
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
          translateY: [-40, 0],
          scale: [1.3, 1],
          easing: 'spring(1, 80, 10, 0)',
          duration: 500
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
