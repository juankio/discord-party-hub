import { useGameSound } from './useGameSound';

export function usePinturilloAudio() {
  const { play: playDraw, stop: stopDraw } = useGameSound('/sounds/pinturillo/draw.mp3', { loop: true });
  const { play: playCorrect } = useGameSound('/sounds/pinturillo/correct.mp3');
  const { play: playClose } = useGameSound('/sounds/pinturillo/close.mp3');

  return {
    playDraw,
    stopDraw,
    playCorrect,
    playClose
  };
}
