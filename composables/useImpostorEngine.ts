import { ref, onMounted, onUnmounted } from 'vue';
import { useSocket } from '~/composables/useSocket';

export const useImpostorEngine = (roomId: string) => {
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
    vote: (targetUserId: string) => socket.value?.emit('impostor:vote', { targetUserId }),
    ready: () => socket.value?.emit('impostor:ready')
  };

  return { state, handleAction };
};
