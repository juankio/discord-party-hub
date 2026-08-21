import { useGameSound } from './useGameSound';

export function useLiarsAudio() {
  const { play: playRoll } = useGameSound('/sounds/liars/roll.mp3');
  const { play: playBet } = useGameSound('/sounds/liars/bet.mp3');
  const { play: playCall } = useGameSound('/sounds/liars/call.mp3');

  return {
    playRoll,
    playBet,
    playCall
  };
}
