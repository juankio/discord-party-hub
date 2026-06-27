import { defineStore } from 'pinia';
import { usePlayerStore } from '~/stores/playerStore';

export interface ParchisTokenState {
  id: number;
  state: 'HOME' | 'TRACK' | 'BOARD' | 'META' | 'FINISHED';
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
    diceValue: [] as number[],
    availableMoves: [] as number[],
    selectedDiceIndex: null as number | null,
    rules: {} as any,
  }),
  getters: {
    isMyTurn: (state) => {
      const playerStore = usePlayerStore();
      return state.players[state.currentTurnIndex]?.userId === playerStore.userId;
    }
  },
  actions: {
    updateState(data: any) {
      if (!data) return;
      this.gameState = data.gameState || data.state || 'WAITING';
      this.players = data.players || [];
      this.currentTurnIndex = data.currentTurnIndex || 0;
      this.winner = data.winner || null;
      this.diceValue = data.diceValue || [];
      this.availableMoves = data.availableMoves || [];
      if (data.rules) this.rules = data.rules;
    }
  }
});
