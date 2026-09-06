import { ref, onMounted, onUnmounted } from 'vue';
import { useSocket } from '~/composables/useSocket';

export const usePinturilloEngine = (roomId: string) => {
  const { socket } = useSocket();
  const state = ref<any>(null);
  const strokesToRender = ref<any[]>([]);
  const chatMessages = ref<any[]>([]);
  
  const handleUpdate = (newState: any) => {
    if (state.value && newState) {
      const roundChanged = newState.round !== state.value.round;
      const drawerChanged = newState.currentDrawerId !== state.value.currentDrawerId;
      const stateChanged = newState.state !== state.value.state && (
        newState.state === 'CHOOSING_WORD' ||
        newState.state === 'WAITING' ||
        newState.state === 'ROUND_RESULTS' ||
        newState.state === 'FINISHED'
      );
      if (roundChanged || drawerChanged || stateChanged) {
        strokesToRender.value = [];
      }
    }
    state.value = newState;
  };
  const handleDraw = (payload: any) => {
    strokesToRender.value.push(payload);
  };
  const handleChat = (msg: any) => {
    chatMessages.value.push(msg);
  };
  const handleClear = () => {
    strokesToRender.value = [];
  };

  let timerInterval: any = null;

  onMounted(() => {
    socket.value?.on('game_state_update', handleUpdate);
    socket.value?.on('draw_event', handleDraw);
    socket.value?.on('chat_message', handleChat);
    socket.value?.on('clear_canvas', handleClear);
    socket.value?.on('pinturillo:clear', handleClear);
    socket.value?.on('round_start', handleClear);
    socket.value?.on('turn_start', handleClear);
    socket.value?.on('draw_history_sync', (history: any[]) => {
      strokesToRender.value = history || [];
    });
    socket.value?.emit('request_game_state');
    
    timerInterval = setInterval(() => {
      if (state.value && state.value.timeRemaining > 0) {
        state.value.timeRemaining--;
      }
    }, 1000);
  });

  onUnmounted(() => {
    socket.value?.off('game_state_update', handleUpdate);
    socket.value?.off('draw_event', handleDraw);
    socket.value?.off('chat_message', handleChat);
    socket.value?.off('clear_canvas', handleClear);
    socket.value?.off('pinturillo:clear', handleClear);
    socket.value?.off('round_start', handleClear);
    socket.value?.off('turn_start', handleClear);
    socket.value?.off('draw_history_sync');
    if (timerInterval) clearInterval(timerInterval);
  });

  const handleAction = {
    draw: (payload: any) => socket.value?.emit('pinturillo:draw', payload),
    chooseWord: (wordIndex: number) => socket.value?.emit('pinturillo:choose_word', { wordIndex }),
    guess: (word: string) => socket.value?.emit('pinturillo:chat', { text: word }),
    clear: () => {
      strokesToRender.value = [];
      socket.value?.emit('pinturillo:clear');
    }
  };

  return { state, strokesToRender, chatMessages, handleAction };
};
