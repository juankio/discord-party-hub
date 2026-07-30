<template>
  <div class="h-[100dvh] w-full overflow-hidden flex flex-col bg-[#1a1a1a] relative">
    <GameExitButton @leave="$router.push(`/sala/${roomId}`)" />
    <LiarsBoard v-if="state && playerStore.userId" :game-state="state" :local-player-id="playerStore.userId" @action="handleGameAction" @leave="$router.push(`/sala/${roomId}`)" />
    <div v-else class="text-white text-center pt-20">Acomodando los dados...</div>
  </div>
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
</script>
