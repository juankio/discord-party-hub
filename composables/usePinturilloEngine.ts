import { ref, onMounted, onUnmounted } from 'vue';
import { useSocket } from '~/composables/useSocket';

export const usePinturilloEngine = (roomId: string) => {
  const { socket } = useSocket();
  const state = ref<any>(null);
  const strokesToRender = ref<any[]>([]);
  const chatMessages = ref<any[]>([]);
  
  const handleUpdate = (newState: any) => {
    state.value = newState;
  };
  const handleDraw = (payload: any) => {
    strokesToRender.value.push(payload);
  };
  const handleChat = (msg: any) => {
    chatMessages.value.push(msg);
  };

  let timerInterval: any = null;

  onMounted(() => {
    socket.value?.on('game_state_update', handleUpdate);
    socket.value?.on('draw_event', handleDraw);
    socket.value?.on('chat_message', handleChat);
    socket.value?.on('draw_history_sync', (history: any[]) => {
      strokesToRender.value = history;
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
    socket.value?.off('draw_history_sync');
    if (timerInterval) clearInterval(timerInterval);
  });

  const handleAction = {
    draw: (payload: any) => socket.value?.emit('pinturillo:draw', payload),
    chooseWord: (wordIndex: number) => socket.value?.emit('pinturillo:choose_word', { wordIndex }),
    guess: (word: string) => socket.value?.emit('pinturillo:chat', { text: word })
  };

  return { state, strokesToRender, chatMessages, handleAction };
};
