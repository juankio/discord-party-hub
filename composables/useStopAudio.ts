import { useGameSound } from './useGameSound';

export function useStopAudio() {
  const { play: playRoundStart } = useGameSound('/sounds/stop/round_start.ogg');
  const { play: playBasta } = useGameSound('/sounds/stop/basta.ogg');
  const { play: playTick } = useGameSound('/sounds/stop/tick.ogg');

  return {
    playRoundStart,
    playBasta,
    playTick
  };
}