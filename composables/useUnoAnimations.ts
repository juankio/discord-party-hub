import { onMounted, onUnmounted } from 'vue';
import { useUnoDrawFx } from './uno/useUnoDrawFx';
import { useUnoPlayFx } from './uno/useUnoPlayFx';
import { useUnoActionFx } from './uno/useUnoActionFx';

export function useUnoAnimations(unoStore: any, playerStore: any, socket: any) {
  const { drawCardAnimation, executeRivalDrew } = useUnoDrawFx(socket, playerStore);
  const { playCardAnimation, executeRivalPlayed, watchTopCard } = useUnoPlayFx(socket, unoStore);
  const { executeActionFx } = useUnoActionFx(unoStore);

  const handleRivalAnimation = (e: CustomEvent) => {
    const { action, userId, cardsCount, targetId } = e.detail;
    
    if (action.startsWith('action_')) {
      executeActionFx(action, userId, targetId);
      return;
    }
    
    if (action === 'rival_drew') {
      executeRivalDrew(cardsCount, userId);
      return;
    }
    
    if (action === 'rival_played') {
      executeRivalPlayed(userId);
      return;
    }
  };

  watchTopCard();

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('uno:action', handleRivalAnimation as EventListener);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('uno:action', handleRivalAnimation as EventListener);
    }
  });

  return {
    playCardAnimation,
    drawCardAnimation
  };
}
