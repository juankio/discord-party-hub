import { onMounted, onUnmounted, watch } from 'vue';
import { useUnoDrawFx } from './uno/useUnoDrawFx';
import { useUnoPlayFx } from './uno/useUnoPlayFx';
import { useUnoActionFx } from './uno/useUnoActionFx';
import { useUnoAudio } from './useUnoAudio';

export function useUnoAnimations(unoStore: any, playerStore: any, socket: any) {
  const { drawCardAnimation, executeRivalDrew } = useUnoDrawFx(socket, playerStore);
  const { playCardAnimation, executeRivalPlayed, watchTopCard } = useUnoPlayFx(socket, unoStore);
  const { executeActionFx } = useUnoActionFx(unoStore);
  const { playDraw, playPlay, playTurn, playPenalty } = useUnoAudio();

  // Reproducir sonido de turno cuando cambie
  watch(() => unoStore.currentTurnUserId, (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && oldVal !== undefined) {
      playTurn();
    }
  });

  const wrappedDrawCardAnimation = () => {
    playDraw();
    return drawCardAnimation();
  };

  const wrappedPlayCardAnimation = (id: string) => {
    playPlay();
    return playCardAnimation(id);
  };

  const handleRivalAnimation = (e: CustomEvent) => {
    const { action, userId, cardsCount, targetId } = e.detail;
    
    if (action.startsWith('action_')) {
      if (action.includes('draw') || action === 'action_wild_draw4') {
        playPenalty();
      }
      executeActionFx(action, userId, targetId);
      return;
    }
    
    if (action === 'rival_drew') {
      playDraw();
      executeRivalDrew(cardsCount, userId);
      return;
    }
    
    if (action === 'rival_played') {
      playPlay();
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
    playCardAnimation: wrappedPlayCardAnimation,
    drawCardAnimation: wrappedDrawCardAnimation
  };
}
