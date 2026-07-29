import { ref, onMounted, onUnmounted } from 'vue';
import { useSocket } from '~/composables/useSocket';

export const useLiarsEngine = (roomId: string) => {
  const { socket } = useSocket();
  const state = ref<any>(null);
  
  const handleUpdate = (newState: any) => {
    state.value = newState;
  };

  onMounted(() => {
    socket.value?.on('game_state_update', handleUpdate);
  });

  onUnmounted(() => {
    socket.value?.off('game_state_update', handleUpdate);
  });

  const handleAction = {
    placeBid: (count: number, face: number) => socket.value?.emit('liars:place_bid', { count, face }),
    callLiar: () => socket.value?.emit('liars:call_liar')
  };

  return { state, handleAction };
};
