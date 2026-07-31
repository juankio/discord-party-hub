<template>
  <GameLayout
    bg-class="bg-[#4a2e1b] flex items-center justify-center"
    :is-finished="state?.state === 'FINISHED'"
    :winner-message="winnerMessage"
    @leave="$router.push(`/sala/${roomId}`)"
  >
    <ImpostorBoard 
      v-if="state && playerStore.userId" 
      :game-state="state" 
      :current-player-id="playerStore.userId"
      @vote="handleAction.vote" 
      @ready="handleAction.ready"
      @leave="$router.push(`/sala/${roomId}`)"
    />
    <GameLoading v-else message="Cargando partida..." icon="i-lucide-loader-2" />
  </GameLayout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useImpostorEngine } from '~/composables/useImpostorEngine';
import ImpostorBoard from '~/components/games/impostor/ImpostorBoard.vue';
import { usePlayerStore } from '~/stores/playerStore';
import { computed } from 'vue';

const route = useRoute();
const roomId = route.params.id as string;
const { state, handleAction } = useImpostorEngine(roomId);
const playerStore = usePlayerStore();

const winnerMessage = computed(() => {
  if (!state.value) return '';
  if (state.value.winner === 'impostor') {
    const impostor = state.value.players?.find((p: any) => p.userId === state.value?.impostorUserId || p.id === state.value?.impostorUserId);
    return `¡El Impostor (${impostor?.nickname || 'Desconocido'}) ha escapado!`;
  } else {
    return '¡La tripulación ha desenmascarado al Impostor!';
  }
});
</script>
