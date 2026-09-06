export type PinturilloGameState = 'WAITING' | 'CHOOSING_WORD' | 'DRAWING' | 'ROUND_RESULTS' | 'FINISHED';

export interface PinturilloPublicState {
  state: PinturilloGameState;
  currentDrawerId: string | null;
  currentWordLength: number;
  wordToDraw: string | null; // Only known to drawer
  wordOptions: string[]; // Options for drawer to choose
  round: number;
  maxRounds: number;
  timeRemaining: number;
  scores: Record<string, number>;
  guessedPlayers: string[]; // IDs of players who guessed correctly
}

export interface DrawingStroke {
  color: string;
  thickness: number;
  points: { x: number; y: number }[];
}

export interface DrawEvent {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  thickness: number;
}
