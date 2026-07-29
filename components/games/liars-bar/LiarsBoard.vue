<template>
  <div class="w-full h-full min-h-[700px] bg-[#1a3822] rounded-xl border-[12px] md:border-[20px] border-[#3a2211] relative overflow-hidden flex flex-col justify-between p-4 md:p-8 shadow-[inset_0_0_120px_rgba(0,0,0,0.9),0_20px_40px_rgba(0,0,0,0.5)] font-sans">
    
    <!-- Felt Texture Overlay -->
    <div class="absolute inset-0 opacity-[0.15] pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E'); mix-blend-mode: multiply;"></div>
    
    <!-- Table center markings (decorative) -->
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[70%] border-2 border-[#d8a872]/10 rounded-[120px] pointer-events-none shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[30%] border border-[#d8a872]/5 rounded-[60px] pointer-events-none"></div>

    <!-- Top Row: Opponents -->
    <div class="flex justify-center flex-wrap gap-4 md:gap-12 z-10 w-full mb-4">
      <LiarsCup 
        v-for="opp in opponents" 
        :key="opp.id"
        :player-name="opp.name"
        :dice-count="opp.diceCount"
        :dice-values="gameState?.state === 'RESOLUTION' ? opp.diceValues : undefined"
        :is-current-turn="gameState?.currentTurnId === opp.id"
        :force-reveal="gameState?.state === 'RESOLUTION'"
      />
    </div>

    <!-- Center Area: Current Bet & Game Status -->
    <LiarsBoardCenter
      :game-state="gameState?.state"
      :current-bet="gameState?.currentBet"
      :bet-player-name="betPlayerName"
      :total-dice-face-count="totalDiceFaceCount"
      :loser-name="loserName"
      :winner-name="winnerName"
    />

    <!-- Bottom Row: Local Player & Controls -->
    <div class="flex flex-col items-center justify-end z-10 w-full mt-4">
      
      <!-- Turn Indicator -->
      <div v-if="gameState?.state === 'BETTING' && isMyTurn" class="mb-4 text-center animate-bounce">
        <span class="bg-green-500 text-white font-black text-xl md:text-3xl uppercase px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.8)] border-4 border-white/20 tracking-widest block">
          ¡Es tu turno! Haz tu apuesta
        </span>
      </div>

      <div v-if="gameState?.state === 'BETTING' && isMyTurn" class="mb-6 md:mb-10 w-full flex justify-center animate-in slide-in-from-bottom-12 duration-500 pointer-events-auto">
        <LiarsBetting 
          :current-bet="gameState?.currentBet"
          :total-dice-count="gameState?.totalDiceCount"
          @place-bet="handlePlaceBet"
          @call-liar="handleCallLiar"
        />
      </div>

      <div class="flex justify-center w-full pointer-events-auto mt-auto">
        <LiarsCup 
          v-if="localPlayer"
          :player-name="'TÚ (' + localPlayer.name + ')'"
          :dice-count="localPlayer.diceCount"
          :dice-values="localPlayer.diceValues"
          :is-local="true"
          :is-current-turn="gameState?.currentTurnId === localPlayer.id"
          :force-reveal="gameState?.state === 'RESOLUTION'"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LiarsCup from './LiarsCup.vue';
import LiarsBetting from './LiarsBetting.vue';
import LiarsBoardCenter from './LiarsBoardCenter.vue';

export type LiarsState = 'WAITING' | 'ROLLING' | 'BETTING' | 'RESOLUTION' | 'FINISHED';

export interface Player {
  id: string;
  userId?: string;
  name: string;
  diceCount: number;
  diceValues?: number[];
}

export interface Bet {
  amount: number;
  face: number;
  playerId: string;
}

export interface GameState {
  state: LiarsState;
  players: Player[];
  currentTurnId: string;
  currentBet: Bet | null;
  totalDiceCount: number;
  loserId?: string;
  winnerId?: string;
}

const props = defineProps<{
  gameState: GameState;
  localPlayerId: string;
}>();

const emit = defineEmits<{
  (e: 'action', action: { type: 'BET'; amount: number; face: number } | { type: 'CALL_LIAR' }): void;
  (e: 'leave'): void;
}>();

const localPlayer = computed(() => props.gameState?.players?.find(p => p.userId === props.localPlayerId || p.id === props.localPlayerId));
const opponents = computed(() => props.gameState?.players?.filter(p => p.userId !== props.localPlayerId && p.id !== props.localPlayerId) || []);

const isMyTurn = computed(() => props.gameState?.currentTurnId === props.localPlayerId || props.gameState?.currentTurnId === localPlayer.value?.id);

const betPlayerName = computed(() => {
  if (!props.gameState?.currentBet) return '';
  const p = props.gameState?.players?.find(p => p.id === props.gameState.currentBet!.playerId);
  return p ? p.name : 'Alguien';
});

const loserName = computed(() => {
  if (!props.gameState?.loserId) return '';
  const p = props.gameState?.players?.find(p => p.id === props.gameState.loserId);
  return p ? p.name : 'Alguien';
});

const winnerName = computed(() => {
  if (!props.gameState?.winnerId) return '';
  const p = props.gameState?.players?.find(p => p.id === props.gameState.winnerId);
  return p ? p.name : 'Alguien';
});

// Calculate total dice on the board matching the bet (wildcard 1 + actual face)
const totalDiceFaceCount = computed(() => {
  if (!props.gameState?.currentBet || !props.gameState?.players) return 0;
  const targetFace = props.gameState.currentBet.face;
  let count = 0;
  for (const player of props.gameState.players) {
    if (player.diceValues) {
      for (const val of player.diceValues) {
        if (val === targetFace || val === 1) { // 1 is usually wildcard
          count++;
        }
      }
    }
  }
  return count;
});

const handlePlaceBet = (bet: { amount: number, face: number }) => {
  emit('action', { type: 'BET', ...bet });
};

const handleCallLiar = () => {
  emit('action', { type: 'CALL_LIAR' });
};
</script>
