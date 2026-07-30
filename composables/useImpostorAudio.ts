import { useGameSound } from './useGameSound';

export function useImpostorAudio() {
  const { play: playReveal } = useGameSound('/sounds/impostor/reveal.mp3');
  const { play: playVote } = useGameSound('/sounds/impostor/vote.mp3');
  const { play: playResults } = useGameSound('/sounds/impostor/results.mp3');

  return {
    playReveal,
    playVote,
    playResults
  };
}
