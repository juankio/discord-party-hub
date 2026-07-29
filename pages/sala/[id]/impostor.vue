<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#4a2e1b] relative">
    <GameExitButton @leave="$router.push(`/sala/${roomId}`)" />
    <ImpostorBoard 
      v-if="state && playerStore.userId" 
      :game-state="state" 
      :current-player-id="playerStore.userId"
      @vote="handleAction.vote" 
      @ready="handleAction.ready"
      @leave="$router.push(`/sala/${roomId}`)"
    />
    <div v-else class="text-white">Cargando partida...</div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useImpostorEngine } from '~/composables/useImpostorEngine';
import ImpostorBoard from '~/components/games/impostor/ImpostorBoard.vue';
import { usePlayerStore } from '~/stores/playerStore';

const route = useRoute();
const roomId = route.params.id as string;
const { state, handleAction } = useImpostorEngine(roomId);
const playerStore = usePlayerStore();
</script>
