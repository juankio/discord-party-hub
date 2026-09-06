<template>
  <div class="h-full flex-1 flex flex-col overflow-hidden bg-[#152d1c] rounded-xl border-[8px] md:border-[16px] border-[#3a2211] relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_15px_30px_rgba(0,0,0,0.5)] font-sans">
    
    <!-- Felt Texture Overlay (GPU-accelerated pure gradient, zero CPU overhead) -->
    <div class="absolute inset-0 pointer-events-none opacity-80" style="background: radial-gradient(ellipse at center, #224b2e 0%, #173320 60%, #0d1e13 100%);"/>
    
    <!-- Table center markings (decorative) -->
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[70%] border-2 border-[#d8a872]/10 rounded-[120px] pointer-events-none shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]"/>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[30%] border border-[#d8a872]/5 rounded-[60px] pointer-events-none"/>

    <div class="flex-1 overflow-y-auto overscroll-contain flex flex-col justify-between p-2 sm:p-4 md:p-8 relative z-10 w-full">
      <!-- Top Row: Opponents (Scroll horizontal compacto en móviles para no empujar la mesa) -->
      <div class="w-full mb-2 sm:mb-4 overflow-x-auto scrollbar-hide py-1">
        <div class="flex items-center justify-start sm:justify-center gap-2 sm:gap-6 md:gap-12 min-w-max sm:min-w-0 mx-auto px-2 sm:px-0">
          <LiarsCup 
            v-for="opp in opponents" 
            :key="opp.id"
            :player-name="opp.name || opp.nickname || opp.username || 'Rival'"
            :dice-count="opp.diceCount"
            :dice-values="gameState?.state === 'RESOLUTION' ? (opp.diceValues || opp.dice) : undefined"
            :is-current-turn="activeTurnId === opp.id || activeTurnId === opp.userId"
            :force-reveal="gameState?.state === 'RESOLUTION'"
            class="shrink-0 transform scale-[0.85] sm:scale-100 origin-top"
          />
        </div>
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
      <div class="flex flex-col items-center justify-end w-full mt-2 sm:mt-4">
        
        <!-- Turn Indicator -->
        <div v-if="gameState?.state === 'BETTING' && isMyTurn" class="mb-2 sm:mb-3 text-center">
          <span class="bg-green-600/90 text-white font-black text-xs sm:text-sm md:text-base uppercase px-4 sm:px-6 py-1.5 rounded-full border border-green-400/50 shadow-[0_0_15px_rgba(34,197,94,0.4)] tracking-widest inline-flex items-center gap-2">
            <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-pulse" />
            ¡Es tu turno! Haz tu apuesta
          </span>
        </div>

        <div v-if="gameState?.state === 'BETTING' && isMyTurn" class="mb-4 sm:mb-6 md:mb-8 w-full flex justify-center animate-in slide-in-from-bottom-6 duration-300 pointer-events-auto">
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
            :player-name="'TÚ (' + (localPlayer.name || localPlayer.nickname || localPlayer.username || 'Tú') + ')'"
            :dice-count="localPlayer.diceCount"
            :dice-values="gameState?.myDice || localPlayer.diceValues || localPlayer.dice"
            :is-local="true"
            :is-current-turn="activeTurnId === localPlayer.id || activeTurnId === localPlayer.userId"
            :force-reveal="gameState?.state === 'RESOLUTION'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import LiarsCup from './LiarsCup.vue';
import LiarsBetting from './LiarsBetting.vue';
import LiarsBoardCenter from './LiarsBoardCenter.vue';
import { useLiarsAudio } from '@/composables/useLiarsAudio';

export type LiarsState = 'WAITING' | 'ROLLING' | 'BETTING' | 'RESOLUTION' | 'FINISHED';

export interface Player {
  id: string;
  userId?: string;
  name: string;
  nickname?: string;
  username?: string;
  diceCount: number;
  dice?: number[];
  diceValues?: number[];
}

export interface Bet {
  amount?: number;
  count?: number;
  face: number;
  playerId?: string;
  userId?: string;
}

export interface GameState {
  state: LiarsState;
  players: Player[];
  currentTurnId?: string;
  currentTurn?: string;
  currentPlayerId?: string;
  currentBet: Bet | null;
  totalDiceCount?: number;
  loserId?: string;
  loser?: string | { id?: string; userId?: string; name?: string };
  winnerId?: string;
  winner?: string | { id?: string; userId?: string; name?: string };
  myDice?: number[];
}

const props = defineProps<{
  gameState: GameState;
  localPlayerId: string;
}>();

const emit = defineEmits<{
  (e: 'action', action: { type: 'BET'; amount: number; count: number; face: number } | { type: 'CALL_LIAR' }): void;
  (e: 'leave'): void;
}>();

const { playRoll } = useLiarsAudio();

watch(() => props.gameState?.state, (newState) => {
  if (newState === 'ROLLING') {
    playRoll();
  }
});

const localPlayer = computed(() => {
  if (!props.gameState?.players) return null;
  return props.gameState.players.find(p => p.userId === props.localPlayerId || p.id === props.localPlayerId) || null;
});

const opponents = computed(() => {
  if (!props.gameState?.players) return [];
  return props.gameState.players.filter(p => p.userId !== props.localPlayerId && p.id !== props.localPlayerId);
});

const activeTurnId = computed(() => {
  return props.gameState?.currentTurnId || props.gameState?.currentTurn || props.gameState?.currentPlayerId || '';
});

const isMyTurn = computed(() => {
  const activeId = activeTurnId.value;
  if (!activeId) return false;
  return activeId === props.localPlayerId || activeId === localPlayer.value?.id || activeId === localPlayer.value?.userId;
});

const betPlayerName = computed(() => {
  if (!props.gameState?.currentBet) return '';
  const betPlayerId = props.gameState.currentBet.playerId || props.gameState.currentBet.userId;
  if (!betPlayerId) return 'Alguien';
  const p = props.gameState.players?.find(p => p.id === betPlayerId || p.userId === betPlayerId);
  return p ? (p.name || p.nickname || p.username || 'Alguien') : 'Alguien';
});

const loserName = computed(() => {
  const loser = props.gameState?.loserId || props.gameState?.loser;
  if (!loser) return '';
  if (typeof loser === 'object' && loser.name) return loser.name;
  const loserId = typeof loser === 'object' ? (loser.id || loser.userId) : loser;
  const p = props.gameState.players?.find(p => p.id === loserId || p.userId === loserId);
  return p ? (p.name || p.nickname || p.username || 'Alguien') : (typeof loser === 'string' && isNaN(Number(loser)) ? loser : 'Alguien');
});

const winnerName = computed(() => {
  const winner = props.gameState?.winnerId || props.gameState?.winner;
  if (!winner) return '';
  if (typeof winner === 'object' && winner.name) return winner.name;
  const winnerId = typeof winner === 'object' ? (winner.id || winner.userId) : winner;
  const p = props.gameState.players?.find(p => p.id === winnerId || p.userId === winnerId);
  return p ? (p.name || p.nickname || p.username || 'Alguien') : (typeof winner === 'string' && isNaN(Number(winner)) ? winner : 'Alguien');
});

// Calculate total dice on the board matching the bet (wildcard 1 + actual face)
const totalDiceFaceCount = computed(() => {
  if (!props.gameState?.currentBet || !props.gameState?.players) return 0;
  const targetFace = props.gameState.currentBet.face;
  let count = 0;
  for (const player of props.gameState.players) {
    const diceList = player.diceValues || player.dice;
    if (diceList && Array.isArray(diceList)) {
      for (const val of diceList) {
        if (val === targetFace || val === 1) { // 1 is usually wildcard
          count++;
        }
      }
    }
  }
  return count;
});

const handlePlaceBet = (bet: { amount?: number; count?: number; face: number }) => {
  const count = bet.count ?? bet.amount ?? 1;
  emit('action', { type: 'BET', amount: count, count, face: bet.face });
};

const handleCallLiar = () => {
  emit('action', { type: 'CALL_LIAR' });
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
