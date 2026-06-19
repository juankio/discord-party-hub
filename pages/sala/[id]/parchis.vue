<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { useParchisStore } from "~/stores/games/parchisStore";
import { usePlayerStore } from "~/stores/playerStore";

const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;

const { socket, isConnected } = useSocket();
const parchisStore = useParchisStore();
const playerStore = usePlayerStore();

// Watch for socket events
watch(
	socket,
	(newSocket) => {
		if (newSocket) {
			// Enviar join al montar
			newSocket.emit("parchis:join", { roomId });
		}
	},
	{ immediate: true },
);

onMounted(() => {
	if (socket.value && isConnected.value) {
		socket.value.emit("parchis:join", { roomId });
	}
});

onUnmounted(() => {
	if (socket.value) {
		// Perhaps emit a leave event if required by the backend
	}
});

const handleSelectFigure = (figureId: string) => {
	if (socket.value) {
		socket.value.emit("parchis:choose_figure", { roomId, figureId });
	}
};

const surrender = () => {
    if (socket.value) {
        socket.value.emit("parchis:surrender");
    }
  };

  const exitGame = () => {
    if (parchisStore.gameState !== "FINISHED" && parchisStore.gameState !== "WAITING") {
        surrender();
    }
    
    if (parchisStore.gameState === "FINISHED") {
        socket.value?.emit("return_to_lobby");
    } else {
        router.push(`/sala/${roomId}`);
    }
  };
</script>

<template>
  <div class="relative w-full h-full min-h-[80vh] flex flex-col p-4 md:p-8">
    <!-- Botón Abandonar Partida -->
    <div class="absolute top-2 left-2 md:top-6 md:left-6 z-50">
      <button 
        @click="exitGame"
        class="group relative flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all duration-300 active:scale-95 shadow-lg overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 focus-visible:ring-0"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)] rounded-xl pointer-events-none"></div>
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Abandonar Partida</span>
      </button>
    </div>

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

    <!-- Victory Modal -->
    <UnoVictoryModal
      :is-open="parchisStore.gameState === 'FINISHED'"
      :winner-message="parchisStore.winner === playerStore.userId ? '¡Has ganado la partida!' : `El ganador es ${parchisStore.players.find((r: any) => r.userId === parchisStore.winner)?.nickname || 'un rival'}.`"
      @lobby="exitGame"
    />
  </div>
</template>

