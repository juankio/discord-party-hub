<template>
  <div class="flex-1 flex justify-center items-end relative z-10 w-full pt-16 pb-4 sm:pt-16 sm:pb-6">
    <!-- Contenedor Maestro de la Mesa y Órbita -->
    <div class="relative mx-auto w-full max-w-[900px] lg:max-w-[1000px] aspect-[1.1/1] sm:aspect-[2.2/1] min-h-[320px] max-h-[45vh] sm:max-h-[450px]">
      
      <!-- Table Layer (Tapete de Madera) -->
      <div class="absolute inset-x-2 sm:inset-x-6 top-[15%] bottom-[5%] sm:top-[12%] sm:bottom-[8%] bg-[#991b1b] rounded-[40px] sm:rounded-[80px] lg:rounded-[100px] border-[6px] sm:border-[10px] lg:border-[12px] border-[#5c3a21] shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_20px_40px_rgba(0,0,0,0.6)] flex flex-row items-center justify-center gap-4 sm:gap-8 overflow-hidden z-10">
        
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

      <!-- Rivals Layer -->
      <UnoRivals 
        :rivals="rivals" 
        :current-turn-user-id="currentTurnUserId"
        class="absolute inset-0 z-20 pointer-events-none"
        @challenge="$emit('challenge', $event)"
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
  myHand: { type: Array as () => any[], default: () => [] },
  rivals: { type: Array as () => any[], default: () => [] },
  currentTurnUserId: { type: String, default: '' }
})
const emit = defineEmits(['draw', 'pass-turn', 'challenge'])

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
