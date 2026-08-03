<template>
  <GameLayout
    bg-class="bg-[#1a1a1a]"
    :is-finished="state?.state === 'FINISHED'"
    :winner-message="`¡${winnerName} sobrevive y gana la partida!`"
    :rules="['Cada jugador tiene dados ocultos (el 1 es comodín).', 'Adivina cuántos dados de una cara hay EN TOTAL en toda la mesa.', 'Sube la apuesta (ej. de \&quot;3 cuatros\&quot; a \&quot;4 cuatros\&quot;) o llama ¡Mentiroso! si crees que no los hay.', 'El que se equivoque al dudar, pierde un dado.']"
    @leave="$router.push(`/sala/${roomId}`)"
  >
    <LiarsBoard v-if="state && playerStore.userId" :game-state="state" :local-player-id="playerStore.userId" @action="handleGameAction" @leave="$router.push(`/sala/${roomId}`)" />
    <GameLoading v-else message="Acomodando los dados..." icon="i-lucide-loader-2" />
  </GameLayout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useLiarsEngine } from '~/composables/useLiarsEngine';
import LiarsBoard from '~/components/games/liars-bar/LiarsBoard.vue';
import { usePlayerStore } from '~/stores/playerStore';

const route = useRoute();
const roomId = route.params.id as string;
const { state, handleAction } = useLiarsEngine(roomId);
const playerStore = usePlayerStore();

const handleGameAction = (action: any) => {
  if (action.type === 'BET') {
    handleAction.placeBid(action.amount, action.face);
  } else if (action.type === 'CALL_LIAR') {
    handleAction.callLiar();
  }
};

const winnerName = computed(() => {
  if (!state.value?.winnerId) return '';
  const p = state.value?.players?.find((p: any) => p.id === state.value.winnerId);
  return p ? p.name : 'Alguien';
});
</script>
