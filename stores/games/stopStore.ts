import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayerStore } from '~/stores/playerStore'

export const useStopStore = defineStore('stopStore', () => {
  const playerStore = usePlayerStore()

  const gameState = ref<'LOBBY' | 'PLAYING' | 'VERIFYING' | 'SCORING' | 'FINISHED'>('LOBBY')
  const categories = ref<string[]>([])
  const rounds = ref(5)
  const currentRound = ref(1)
  const currentLetter = ref('')
  const players = ref<any[]>([])
  
  // 🔥 BUG FIX: isHost relies on playerStore.hostUserId. If the user navigates directly to /stop, 
  // they might miss the 'room_update' event because they didn't join the room socket channel correctly, 
  // but useSocket handles 'join_room' globally.
  const isHost = computed(() => playerStore.userId !== '' && playerStore.userId === playerStore.hostUserId)
  
  // Verification/Scoring state
  const verifyingData = ref<any[]>([])
  const roundScores = ref<Record<string, number>>({})

  const updateState = (data: any) => {
    if (!data) return
    // Support the case where backend sends `{ state: { state: 'LOBBY', ... } }` or just the flat object
    const payload = (data.state && typeof data.state === 'object') ? data.state : data
    
    if (payload.categories !== undefined) {
      if (payload.state) gameState.value = payload.state
      if (payload.categories) categories.value = payload.categories
      if (payload.totalRounds) rounds.value = payload.totalRounds
      if (payload.currentRound) currentRound.value = payload.currentRound
      if (payload.currentLetter) currentLetter.value = payload.currentLetter
      if (payload.players) players.value = payload.players
      if (payload.verifyingData) verifyingData.value = payload.verifyingData
      if (payload.roundScores) roundScores.value = payload.roundScores
    }
  }

  const bindEvents = (socketInstance: any) => {
    if (!socketInstance) return

    socketInstance.off('game_state_update')
    socketInstance.off('stop_called')
    
    socketInstance.on('game_state_update', (data: any) => {
      updateState(data)
    })
    
    socketInstance.on('stop_called', (data: any) => {
      // Manejar alert de stop_called si es necesario
    })
  }

  const unbindEvents = (socketInstance: any) => {
    if (!socketInstance) return
    socketInstance.off('game_state_update')
    socketInstance.off('stop_called')
  }

  return {
    gameState,
    categories,
    rounds,
    currentRound,
    currentLetter,
    players,
    isHost,
    verifyingData,
    roundScores,
    updateState,
    bindEvents,
    unbindEvents
  }
})
