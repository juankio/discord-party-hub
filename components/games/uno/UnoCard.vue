<template>
  <div class="uno-card" :class="cardClasses">
    <div class="inner-oval relative flex items-center justify-center">
      <div v-if="card.value === 'wild' || card.value === 'wild_draw4'" class="w-8 h-8 md:w-12 md:h-12 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] border-2 border-white/20 absolute" style="background: conic-gradient(#ef4444 90deg, #eab308 90deg 180deg, #22c55e 180deg 270deg, #3b82f6 270deg);"/>
      <span v-if="card.value === 'wild_draw4'" class="relative z-10 text-white font-black text-xl md:text-3xl tracking-tighter" style="text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;">+4</span>
      <span v-else-if="card.value !== 'wild'" class="card-value">{{ cardDisplay }}</span>
    </div>
    
    <div v-if="card.value === 'wild' || card.value === 'wild_draw4'" class="corner-value top-left flex flex-col items-center justify-center">
      <div class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm" style="background: conic-gradient(#ef4444 90deg, #eab308 90deg 180deg, #22c55e 180deg 270deg, #3b82f6 270deg);"/>
      <span v-if="card.value === 'wild_draw4'" class="text-[6px] md:text-[8px] font-black leading-none mt-0.5" style="color: white; text-shadow: 1px 1px 0 #000;">+4</span>
    </div>
    <span v-else class="corner-value top-left">{{ cardDisplay }}</span>
    
    <div v-if="card.value === 'wild' || card.value === 'wild_draw4'" class="corner-value bottom-right flex flex-col items-center justify-center">
      <div class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm" style="background: conic-gradient(#ef4444 90deg, #eab308 90deg 180deg, #22c55e 180deg 270deg, #3b82f6 270deg);"/>
      <span v-if="card.value === 'wild_draw4'" class="text-[6px] md:text-[8px] font-black leading-none mt-0.5" style="color: white; text-shadow: 1px 1px 0 #000;">+4</span>
    </div>
    <span v-else class="corner-value bottom-right">{{ cardDisplay }}</span>
    
    <!-- Bloqueo visual oscuro si no es jugable -->
    <div v-if="!playable" class="absolute inset-0 bg-black/60 rounded-[4px] md:rounded-[6px] pointer-events-none"/>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  playable: { type: Boolean, default: true },
  currentColor: { type: String, default: '' }
})

const cardDisplay = computed(() => {
  const v = props.card.value
  if (!v) return ''
  if (['0','1','2','3','4','5','6','7','8','9'].includes(v)) return v
  if (v === 'skip') return '⊘'
  if (v === 'reverse') return '⇄'
  if (v === 'draw2') return '+2'
  if (v === 'wild') return ''
  if (v === 'wild_draw4') return '+4'
  return ''
})

const cardClasses = computed(() => {
  let colorClass = `card-${props.card.color === 'wild' ? 'black' : props.card.color}`
  // If it is a wild card on top of the table and has a chosen color
  if (props.card.color === 'wild' && props.currentColor) {
    colorClass = `card-${props.currentColor}`
  }
  
  return [
    colorClass,
    !props.playable ? 'unplayable' : ''
  ]
})
</script>