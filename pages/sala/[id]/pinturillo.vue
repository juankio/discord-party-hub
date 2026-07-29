<template>
  <div class="min-h-screen bg-[#2c1f18] relative">
    <GameExitButton @leave="$router.push(`/sala/${roomId}`)" />
    <PinturilloBoard 
      v-if="state && playerStore.userId" 
      :game-state="state" 
      :my-user-id="playerStore.userId"
      :strokes-to-render="strokesToRender" 
      @draw="handleAction.draw" 
      @choose-word="handleAction.chooseWord"
      @leave="$router.push(`/sala/${roomId}`)"
    />
    <div v-else class="text-white text-center pt-20">Colocando el lienzo...</div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { usePinturilloEngine } from '~/composables/usePinturilloEngine';
import PinturilloBoard from '~/components/games/pinturillo/PinturilloBoard.vue';
import { usePlayerStore } from '~/stores/playerStore';

const route = useRoute();
const roomId = route.params.id as string;
const { state, strokesToRender, handleAction } = usePinturilloEngine(roomId);
const playerStore = usePlayerStore();
</script>
