<template>
  <div class="h-[100dvh] w-full overflow-hidden flex flex-col bg-[#2c1f18] relative">
    <GameExitButton @leave="$router.push(`/sala/${roomId}`)" />
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
const { state, strokesToRender, chatMessages, handleAction } = usePinturilloEngine(roomId);
const playerStore = usePlayerStore();
</script>
