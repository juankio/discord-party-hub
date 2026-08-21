<template>
  <GameLayout
    bg-class="bg-[#2c1f18]"
    :is-finished="state?.state === 'FINISHED'"
    :winner-message="winnerMessage"
    :rules="['El dibujante elige una palabra y debe dibujarla sin usar letras.', 'Los demás deben escribir la palabra exacta en el chat para ganar puntos.', 'Adivinar más rápido otorga más puntos.', '¡Si estás muy cerca, el sistema te avisará por privado!']"
    @leave="$router.push(`/sala/${roomId}`)"
  >
    <PinturilloBoard 
      v-if="state && playerStore.userId" 
      :game-state="state" 
      :my-user-id="playerStore.userId"
      :strokes-to-render="strokesToRender"
      :chat-messages="chatMessages"
      @draw="handleAction.draw" 
      @choose-word="handleAction.chooseWord"
      @guess="handleAction.guess"
      @leave="$router.push(`/sala/${roomId}`)"
    />
    <GameLoading v-else message="Colocando el lienzo..." icon="i-lucide-loader-2" />
  </GameLayout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { usePinturilloEngine } from '~/composables/usePinturilloEngine';
import PinturilloBoard from '~/components/games/pinturillo/PinturilloBoard.vue';
import { usePlayerStore } from '~/stores/playerStore';
import { computed } from 'vue';

const route = useRoute();
const roomId = route.params.id as string;
const { state, strokesToRender, chatMessages, handleAction } = usePinturilloEngine(roomId);
const playerStore = usePlayerStore();

const winnerMessage = computed(() => {
  if (!state.value || !state.value.scores) return '';
  const scores = state.value.scores;
  
  let topUserId = '';
  let topScore = -1;
  for (const [uid, score] of Object.entries(scores)) {
    if ((score as number) > topScore) {
      topScore = score as number;
      topUserId = uid;
    }
  }

  if (topUserId === playerStore.userId) return '¡Has ganado la partida con tus dibujos!';
  const winnerPlayer = state.value.players?.find((p: any) => p.userId === topUserId || p.id === topUserId);
  return `El ganador es ${winnerPlayer?.nickname || winnerPlayer?.name || 'Alguien'}.`;
});
</script>
