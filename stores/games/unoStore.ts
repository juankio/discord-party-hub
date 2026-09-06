import { defineStore } from 'pinia'

export const useUnoStore = defineStore('uno', {
  state: () => ({
    gameState: 'WAITING',
    currentTurnUserId: '',
    playDirection: 1,
    currentColor: '',
    pendingDraws: 0,
    topCard: null as any,
    actionRequiredFrom: '',
    winner: null as string | null,
    myHand: [] as any[],
    rivals: [] as any[],
    hasDrawnThisTurn: false,
    // Estado transitorio para animaciones de rivales
    rivalHoverIndex: {} as Record<string, number | null>
  }),
  actions: {
    updateState(state: any) {
      if (!state || !state.rivals) return;
      this.gameState = state.state
      this.currentTurnUserId = state.currentTurnUserId
      this.playDirection = state.playDirection
      this.currentColor = state.currentColor
      this.pendingDraws = state.pendingDraws
      this.topCard = state.topCard
      this.actionRequiredFrom = state.actionRequiredFrom
      this.winner = state.winner
      this.myHand = state.myHand
      this.rivals = state.rivals
      this.hasDrawnThisTurn = state.hasDrawnThisTurn
      
      // Inicializar el hover record si hay rivales nuevos
      if (this.rivals) {
        this.rivals.forEach(r => {
          if (this.rivalHoverIndex[r.userId] === undefined) {
            this.rivalHoverIndex[r.userId] = null;
          }
        })
      }
    },
    setRivalHover(userId: string, index: number | null) {
      this.rivalHoverIndex[userId] = index
    }
  }
})