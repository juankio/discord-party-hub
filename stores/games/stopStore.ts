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
  
  const isHost = computed(() => playerStore.userId !== '' && playerStore.userId === playerStore.hostUserId)
  
  // Verification/Scoring state
  const verifyingData = ref<any[]>([])
  const roundScores = ref<Record<string, number>>({})

  const updateState = (data: any) => {
    if (!data) return
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
    updateState
  }
})
