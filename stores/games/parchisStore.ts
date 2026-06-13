import { defineStore } from 'pinia';

export interface ParchisPlayer {
  userId: string;
  username: string;
  avatar: string | null;
  color: string;
  figureId?: string;
  hasChosenFigure: boolean;
  score?: number;
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
