import { ref, onMounted, onUnmounted } from 'vue';
import { useSocket } from '~/composables/useSocket';

export const usePinturilloEngine = (roomId: string) => {
  const { socket } = useSocket();
  const state = ref<any>(null);
  const strokesToRender = ref<any[]>([]);
  
  const handleUpdate = (newState: any) => {
    state.value = newState;
  };
  const handleDraw = (payload: any) => {
    strokesToRender.value.push(payload);
  };

  onMounted(() => {
    socket.value?.on('game_state_update', handleUpdate);
    socket.value?.on('draw_event', handleDraw);
  });

  onUnmounted(() => {
    socket.value?.off('game_state_update', handleUpdate);
    socket.value?.off('draw_event', handleDraw);
  });

  const handleAction = {
    draw: (payload: any) => socket.value?.emit('pinturillo:draw', payload),
    chooseWord: (wordIndex: number) => socket.value?.emit('pinturillo:choose_word', { wordIndex })
  };

  return { state, strokesToRender, handleAction };
};
