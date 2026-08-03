<template>
  <div class="relative w-[92%] sm:w-full max-w-4xl min-h-[220px] sm:min-h-[0px] aspect-[4/3] sm:aspect-[2/1] mx-auto mt-6 sm:mt-10 player-table-container">
    <div class="absolute inset-3 sm:inset-6 md:inset-8 bg-[#b87333] rounded-[2rem] md:rounded-[3rem] shadow-2xl flex p-2 sm:p-3 md:p-5 table-surface">
      <div class="w-full h-full bg-[#109041] rounded-[1.5rem] md:rounded-[2.5rem] shadow-inner relative flex items-center justify-center border-4 border-[#0a662c]">
        
        <!-- Buchacas -->
        <div class="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 md:-top-6 md:-left-6 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute -top-4 sm:-top-5 md:-top-6 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 md:-top-6 md:-right-6 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 md:-bottom-6 md:-left-6 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute -bottom-4 sm:-bottom-5 md:-bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 md:-bottom-6 md:-right-6 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#111] rounded-full shadow-inner border border-black/50"/>

        <!-- Sillas Externas -->
        <div v-if="paddedPlayers.length >= 7" class="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-20 sm:h-24 bg-[#b87333] rounded-l-[2rem] shadow-[inset_-3px_0_8px_rgba(0,0,0,0.3)] border-y-4 border-l-4 border-[#8f5825] -z-10 flex items-center justify-start pl-2 sm:pl-3 transition-all duration-500">
          <div class="w-4 h-12 bg-[#8f5825] rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] opacity-80"></div>
        </div>
        <div v-if="paddedPlayers.length === 8" class="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-20 sm:h-24 bg-[#b87333] rounded-r-[2rem] shadow-[inset_3px_0_8px_rgba(0,0,0,0.3)] border-y-4 border-r-4 border-[#8f5825] -z-10 flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500">
          <div class="w-4 h-12 bg-[#8f5825] rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] opacity-80"></div>
        </div>

        <!-- Info central -->
        <div class="text-center relative z-10 flex flex-col items-center p-3 sm:p-6 bg-black/30 rounded-2xl sm:rounded-3xl border border-white/10 w-[90%] sm:w-auto max-w-full">
          <p class="text-[9px] sm:text-[10px] md:text-xs text-green-100 mb-1 sm:mb-2 uppercase tracking-[0.2em] sm:tracking-[0.4em] font-black drop-shadow-md">Código de la sala</p>
          <h2 class="text-2xl sm:text-5xl md:text-7xl font-mono font-black text-white tracking-[0.1em] sm:tracking-[0.2em] drop-shadow-md mb-3 sm:mb-4 truncate w-full px-2">{{ roomId }}</h2>
          <div class="flex flex-col items-center gap-2 w-full mt-2">
            <div class="flex items-center gap-2 justify-center w-full">
              <button 
                class="copy-btn-anim flex items-center gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 border"
                :class="isCopied ? 'bg-green-600 hover:bg-green-500 border-green-400 text-white' : 'bg-black/40 hover:bg-black/60 text-white border-white/20'"
                @click="copyLink"
              >
                <UIcon :name="isCopied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-4 h-4" />
                {{ isCopied ? '¡Copiado!' : 'Copiar Link' }}
              </button>
              <button
                v-if="isHost && allowBots"
                class="add-bot-anim flex items-center gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border bg-blue-600/40 hover:bg-blue-600/80 hover:scale-105 active:scale-95 text-white border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]"
                @click="handleAddBot"
                title="Añadir Bot"
              >
                <UIcon name="i-lucide-bot" class="w-4 h-4" />
                <span class="hidden sm:inline">Añadir Bot</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Avatares -->
        <div class="absolute inset-0 pointer-events-none z-20">
          <PlayerSeat
            v-for="(player, index) in paddedPlayers" 
            :key="player.userId"
            :player="player"
            :position="getAvatarPosition(player.seatIndex, paddedPlayers.length)"
            :is-host="isHost"
            :host-user-id="hostUserId"
            :local-player-color="playerStore.color"
            @avatar-click="!player.isLocked && (player.isEmpty ? $emit('change-seat', player.seatIndex) : $emit('avatar-click', player))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import anime from 'animejs'
import { usePlayerStore } from '~/stores/playerStore'
import { useAppAudio } from '~/composables/useAppAudio'
import PlayerSeat from './PlayerSeat.vue'
import { getAvatarPositionLogic } from '~/utils/tableGeometry'

const props = defineProps({
  roomId: { type: String, required: true },
  players: { type: Array as () => any[], required: true },
  hostUserId: { type: String, required: true },
  selectedGame: { type: String, required: true }
})

const emit = defineEmits<{
  (e: 'add-bot', difficulty: number): void
  (e: 'avatar-click', player: any): void
  (e: 'change-seat', seatIndex: number): void
}>()

const { playBot, playCopyLink, playSeatMove, playTableExpand, playTableShrink } = useAppAudio()
const handleAddBot = () => { playBot(); emit('add-bot', 5) }

const toast = useToast()
const playerStore = usePlayerStore()
const isCopied = ref(false)
const allowBots = computed(() => ['uno', 'parchis', 'liars'].includes(props.selectedGame))
const isHost = computed(() => props.hostUserId === playerStore.userId)

const localPlayerSeatIndex = computed(() => {
  const me = props.players.find(p => p.userId === playerStore.userId)
  return me ? me.seatIndex : null
})

const maxAllowed = computed(() => {
  let max = props.players.length;
  if (props.selectedGame === 'parchis') {
    max = playerStore.roomRules?.parchisBoardSize || 4;
  } else {
    max = playerStore.roomRules?.extendedLobby ? 8 : 6;
  }
  return max;
})

const paddedPlayers = computed(() => {
  // Capacidad REAL permitida por las reglas actuales
  const max = maxAllowed.value;
  
  // Pero el array visual SIEMPRE dibuja los 8 huecos de la mesa
  const visualTotal = 8;
  const current = new Array(visualTotal).fill(null);
  
  const isSeatLocked = (i: number, max: number) => {
    let locked = false;
    if (max < 8 && (i === 2 || i === 6)) locked = true; // Sillas de expansión (madera)
    if (max <= 4 && (i === 0 || i === 4)) locked = true; // Centros (dejamos solo las esquinas)
    return locked;
  };

  // Colocamos primero a los jugadores cuyas sillas sí son válidas y están libres
  const playersWithoutValidSeat = [];
  
  props.players.forEach(player => {
    if (
      player.seatIndex !== undefined && 
      player.seatIndex >= 0 && 
      player.seatIndex < visualTotal && 
      !isSeatLocked(player.seatIndex, max) &&
      current[player.seatIndex] === null // Aseguramos no sobreescribir si ya está ocupada
    ) {
      current[player.seatIndex] = player;
    } else {
      playersWithoutValidSeat.push(player);
    }
  });

  // Acomodamos a los demás en los huecos disponibles
  playersWithoutValidSeat.forEach(player => {
    const emptyIdx = current.findIndex((p, i) => p === null && !isSeatLocked(i, max));
    if (emptyIdx !== -1) {
      current[emptyIdx] = { ...player, seatIndex: emptyIdx };
    }
  });

  // Rellenamos los nulls con huecos vacíos (fantasmas)
  for (let i = 0; i < current.length; i++) {
    if (current[i] === null) {
      current[i] = {
        isEmpty: true,
        isLocked: isSeatLocked(i, max),
        seatIndex: i,
        userId: `empty-${i}`
      };
    } else if (current[i].seatIndex === undefined) {
      // Asegurar que el objeto renderizado sepa su seatIndex final si no lo trajo
      current[i] = { ...current[i], seatIndex: i };
    }
  }

  return current;
})

const getAvatarPosition = (index: number, total: number) => {
  // En el Lobby, usamos posiciones absolutas (normalizedMyIndex = 0)
  // para que si el jugador cambia a la silla 3, se vea físicamente viajar a la silla 3.
  return getAvatarPositionLogic(index, total, 0)
}

watch(() => maxAllowed.value, (newLen, oldLen) => {
  if (oldLen > 0) {
    if (newLen > oldLen) playTableExpand();
    else if (newLen < oldLen) playTableShrink();
  }
});

onMounted(() => {
  anime({
    targets: '.table-surface', scale: [0.8, 1], opacity: [0, 1],
    duration: 1000, easing: 'easeOutExpo'
  })
})

const copyLink = () => {
  if (import.meta.client) {
    playCopyLink()
    navigator.clipboard.writeText(window.location.href)
    anime({ targets: '.copy-btn-anim', scale: [1, 1.15, 1], duration: 400, easing: 'easeInOutQuad' })
    isCopied.value = true; setTimeout(() => { isCopied.value = false }, 2500)
    toast.add({ title: '¡Link copiado!', description: 'Envíalo a tus amigos por Discord para que se unan.', color: 'primary', icon: 'i-lucide-check-circle' })
  }
}
</script>

<style scoped>
.player-table-container {
  --hole-offset-x: 0.25rem;
  --hole-offset-y: 0.25rem;
  --hole-mid-y: 0rem;
}
@media (min-width: 768px) {
  .player-table-container { --hole-offset-x: 0.5rem; --hole-offset-y: 0.5rem; --hole-mid-y: 0.25rem; }
}
</style>
