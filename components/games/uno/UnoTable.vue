<template>
  <div class="flex-1 flex justify-center items-end relative z-10 w-full pt-12 pb-2 md:pt-16 md:pb-6">
    <div class="relative mx-auto w-[calc(100vw-2rem)] sm:w-[calc(100vw-6rem)] md:w-full max-w-[900px] lg:max-w-[1000px] h-[320px] sm:h-[420px] lg:h-[480px]">
      
      <!-- Table Layer -->
      <div class="absolute inset-0 top-1/2 -translate-y-1/2 h-[80%] bg-[#991b1b] rounded-[60px] sm:rounded-[100px] border-[6px] sm:border-[12px] border-[#5c3a21] shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_20px_40px_rgba(0,0,0,0.6)] flex flex-row items-center justify-center gap-4 sm:gap-8 mx-2 sm:mx-6 overflow-hidden z-10">
        
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 8px 8px;"/>

        <!-- Turn Indicator -->
        <Transition name="fade-slide">
          <div 
            v-if="!isMyTurn && currentTurnName"
            class="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/10 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-white font-black text-[10px] sm:text-xs tracking-[0.2em] uppercase shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 flex items-center gap-2 sm:gap-3"
          >
            <UIcon name="i-lucide-clock" class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
            <span>Turno de <span class="text-yellow-400 drop-shadow-md">{{ currentTurnName }}</span></span>
          </div>
        </Transition>

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

const currentTurnName = computed(() => {
  if (props.isMyTurn) return '';
  const player = props.rivals.find(r => r.userId === props.currentTurnUserId);
  return player ? player.nickname : '';
})

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

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
