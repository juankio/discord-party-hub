<template>
  <div class="flex-1 flex justify-center items-center relative z-10 w-full">
    <div class="w-full max-w-[600px] h-[200px] sm:h-[300px] bg-[#991b1b] rounded-[60px] sm:rounded-[100px] border-[6px] sm:border-[12px] border-[#5c3a21] shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-center relative mx-4 overflow-hidden">
      
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 8px 8px;"/>

      <!-- Deck (Mazo para Robar) -->
      <UnoTableDeck 
        :pending-draws="pendingDraws"
        :is-my-turn="isMyTurn"
        :has-drawn-this-turn="hasDrawnThisTurn"
        :has-playable-card="hasPlayableCard"
        @draw="$emit('draw')"
        @pass-turn="$emit('pass-turn')"
      />

      <!-- Top Card (Carta de la Mesa) -->
      <UnoCard
           v-if="topCard"
           :card="topCard"
           :currentColor="currentColor"
           class="top-card-anim top-card-placeholder transition-shadow duration-300"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  topCard: { type: Object, default: null },
  currentColor: { type: String, default: '' },
  pendingDraws: { type: Number, default: 0 },
  isMyTurn: { type: Boolean, default: false },
  hasDrawnThisTurn: { type: Boolean, default: false },
  myHand: { type: Array as () => any[], default: () => [] }
})
const emit = defineEmits(['draw', 'pass-turn'])

const hasPlayableCard = computed(() => {
  if (!props.isMyTurn) return false;
  if (props.pendingDraws > 0) {
    return props.myHand.some(card => card.value === 'draw2' || card.value === 'wild_draw4');
  }
  return props.myHand.some(card => 
    card.color === 'wild' || 
    card.color === props.currentColor || 
    card.color === props.topCard?.color || 
    card.value === props.topCard?.value
  );
})
</script>

