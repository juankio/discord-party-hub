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
    rivals: [] as any[]
  }),
  actions: {
    updateState(state: any) {
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
    }
  }
})