import { defineStore } from 'pinia';

export interface ParchisTokenState {
  id: number;
  state: 'HOME' | 'TRACK' | 'META' | 'FINISHED';
  position: number; // For HOME, 0-3. For TRACK, 0-67. For META, 0-7.
}

export interface ParchisPlayer {
  userId: string;
  nickname: string;
  avatar: string | null;
  color: string;
  selectedFigure?: string;
  hasChosenFigure: boolean;
  score?: number;
  tokens: ParchisTokenState[];
}

export const useParchisStore = defineStore('parchis', {
  state: () => ({
    gameState: 'WAITING' as 'WAITING' | 'CHOOSING_TOKENS' | 'PLAYING' | 'FINISHED',
    players: [] as ParchisPlayer[],
    currentTurnIndex: 0,
    winner: null as string | null,
    // Add more state as needed later
  }),
  actions: {
    updateState(data: any) {
      if (!data) return;
      this.gameState = data.gameState || data.state || 'WAITING';
      this.players = data.players || [];
      this.currentTurnIndex = data.currentTurnIndex || 0;
      this.winner = data.winner || null;
    }
  }
});
