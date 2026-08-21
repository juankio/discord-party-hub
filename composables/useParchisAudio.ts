import { useGameSound } from './useGameSound';

export function useParchisAudio() {
  const { play: playDice } = useGameSound('/sounds/parchis/dice.ogg');
  const { play: playMove } = useGameSound('/sounds/parchis/move.ogg');
  const { play: playCapture } = useGameSound('/sounds/parchis/capture.ogg');
  const { play: playGoal } = useGameSound('/sounds/parchis/goal.ogg');

  return {
    playDice,
    playMove,
    playCapture,
    playGoal
  };
}