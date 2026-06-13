<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useParchisStore } from '~/stores/games/parchisStore';
import { usePlayerStore } from '~/stores/playerStore';

const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;

const { socket, isConnected } = useSocket();
const parchisStore = useParchisStore();
const playerStore = usePlayerStore();

// Watch for socket events
watch(socket, (newSocket) => {
  if (newSocket) {
    // Enviar join al montar
    newSocket.emit('parchis:join', { roomId });
  }
}, { immediate: true });

onMounted(() => {
  if (socket.value && isConnected.value) {
    socket.value.emit('parchis:join', { roomId });
  }
});

onUnmounted(() => {
  if (socket.value) {
    // Perhaps emit a leave event if required by the backend
  }
});

const handleSelectFigure = (figureId: string) => {
  if (socket.value) {
    socket.value.emit('parchis:choose_figure', { roomId, figureId });
  }
};
</script>

<template>
  <div class="relative w-full h-full min-h-[80vh] flex flex-col p-4 md:p-8">
    <!-- Overlay de Selección de Fichas -->
    <ParchisTokenSelector 
      v-if="parchisStore.gameState === 'CHOOSING_TOKENS'" 
      :players="parchisStore.players" 
      :my-user-id="playerStore.userId" 
      @select_figure="handleSelectFigure" 
    />
    
    <!-- Tablero de Juego Principal -->
    <ParchisBoard v-else-if="parchisStore.gameState === 'PLAYING'" class="flex-grow" />

    <!-- Estado de Espera u Otros -->
    <div v-else class="flex flex-col items-center justify-center flex-grow">
      <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-orange-500 animate-spin mb-4" />
      <h1 class="text-3xl font-black text-white tracking-wider mb-2">ESPERANDO A LOS JUGADORES</h1>
      <p class="text-gray-400">Preparando el tablero de parchís...</p>
      <UButton color="gray" variant="soft" class="mt-8" @click="router.push(`/sala/${roomId}`)">
        Volver a la mesa
      </UButton>
    </div>
  </div>
</template>
