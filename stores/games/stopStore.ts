import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSocket } from '~/composables/useSocket'
import { usePlayerStore } from '~/stores/playerStore'

export const useStopStore = defineStore('stopStore', () => {
  const { socket } = useSocket()
  const playerStore = usePlayerStore()

  const gameState = ref<'LOBBY' | 'PLAYING' | 'VERIFYING' | 'SCORING' | 'FINISHED'>('LOBBY')
  const categories = ref<string[]>([])
  const rounds = ref(5)
  const currentRound = ref(1)
  const currentLetter = ref('')
  const players = ref<any[]>([])
  const isHost = ref(false)
  
  // Verification/Scoring state
  const verifyingData = ref<any[]>([])
  const roundScores = ref<Record<string, number>>({})

  const bindEvents = () => {
    if (!socket.value) return

    socket.value.on('game_state_update', (data: any) => {
      if (data.state) gameState.value = data.state
      if (data.categories) categories.value = data.categories
      if (data.totalRounds) rounds.value = data.totalRounds
      if (data.currentRound) currentRound.value = data.currentRound
      if (data.currentLetter) currentLetter.value = data.currentLetter
      if (data.players) players.value = data.players
      if (data.isHost !== undefined) isHost.value = data.isHost
      if (data.verifyingData) verifyingData.value = data.verifyingData
      if (data.roundScores) roundScores.value = data.roundScores
    })

    socket.value.on('stop_called', (data: any) => {
      // Transition to verifying or just alert
    })
  }

  const unbindEvents = () => {
    if (!socket.value) return
    socket.value.off('game_state_update')
    socket.value.off('stop_called')
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
    bindEvents,
    unbindEvents
  }
})
