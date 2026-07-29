import { ref, computed, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '~/stores/playerStore';
import { useSocket } from '~/composables/useSocket';
import { useToast } from '#imports';
import { useAppAudio } from '~/composables/useAppAudio';

export const useRoomLobby = (roomId: string) => {
  const router = useRouter();
  const playerStore = usePlayerStore();
  const { socket } = useSocket();
  const toast = useToast();
  const { playCountdown, playBotConfig, playSeatMove } = useAppAudio();

  const isStarting = ref(false);

  const players = computed(() => playerStore.playersInRoom);
  const isHost = computed(
    () => playerStore.userId !== "" && playerStore.userId === playerStore.hostUserId,
  );

  const selectedGame = computed({
    get: () => playerStore.selectedGame,
    set: (val: string) => {
      if (isHost.value) {
        const hasBots = players.value.some((p: any) => p.isBot);
        if (hasBots && !['uno', 'parchis'].includes(val)) {
          toast.add({ title: 'Bots no compatibles', description: 'Expulsa a los bots primero para jugar este juego.', color: 'red' });
          return;
        }
        playerStore.selectedGame = val;
        socket.value?.emit("update_selected_game", val);
      }
    },
  });

  const emitRules = () => {
    if (isHost.value) {
      socket.value?.emit("update_room_rules", toRaw(playerStore.roomRules));
    }
  };

  const startGame = () => {
    playCountdown();
    isStarting.value = true;
    
    if (selectedGame.value === 'parchis') {
      const boardSize = playerStore.roomRules?.parchisBoardSize || 4;
      if (players.value.length > boardSize) {
        toast.add({ title: 'Mesa llena', description: 'Hay más jugadores que espacios en el tablero. Aumenta el tamaño del tablero de Parchís o expulsa a alguien.', color: 'red' });
        isStarting.value = false;
        return;
      }
    }

    socket.value?.emit("start_game", {
      gameType: selectedGame.value,
      rules: toRaw(playerStore.roomRules),
    });
  };

  const leaveRoom = () => {
    socket.value?.emit("leave_room");
    router.push("/");
  };

  const addBot = (difficulty: number = 5) => {
    if (isHost.value) {
      socket.value?.emit("add_bots", { roomId, count: 1, difficulty });
    }
  };

  const updateBotConfig = (botId: string, config: { difficulty: number, nickname: string, avatarId: number, color: string }) => {
    playBotConfig();
    socket.value?.emit("update_bot_config", { botId, ...config });
  };

  const kickBot = (botId: string) => {
    socket.value?.emit("kick_bot", { botId });
  };

  const changeSeat = (targetSeatIndex: number) => {
    playSeatMove();
    socket.value?.emit("change_seat", { targetSeatIndex });
  };

  return {
    players,
    isHost,
    isStarting,
    selectedGame,
    emitRules,
    startGame,
    leaveRoom,
    addBot,
    updateBotConfig,
    kickBot,
    changeSeat
  };
};
