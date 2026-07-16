import { useGameSound } from './useGameSound';

export function useUnoAudio() {
  const { play: playDraw } = useGameSound('/sounds/uno/draw.ogg');
  const { play: playPlay } = useGameSound('/sounds/uno/play.ogg');
  const { play: playTurn } = useGameSound('/sounds/uno/turn.ogg');
  const { play: playPenalty } = useGameSound('/sounds/uno/penalty.ogg');

  return {
    playDraw,
    playPlay,
    playTurn,
    playPenalty
  };
}