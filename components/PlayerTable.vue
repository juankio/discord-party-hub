<template>
  <div class="relative w-full max-w-[820px] mx-auto mt-3 sm:mt-5 px-12 sm:px-14 flex items-center justify-center player-table-container">
    <div class="relative w-full aspect-[2/1] bg-[#b87333] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex p-2.5 sm:p-3.5 table-surface">
      <div class="w-full h-full bg-[#109041] rounded-[1.5rem] md:rounded-[2rem] shadow-inner relative flex items-center justify-center border-4 border-[#0a662c]">
        
        <!-- Buchacas -->
        <div class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>

        <!-- Sillas Externas (Con margen lateral protegido para evitar recortes) -->
        <div v-if="paddedPlayers.length >= 7" class="absolute -left-9 sm:-left-12 top-1/2 -translate-y-1/2 w-11 sm:w-14 h-20 sm:h-24 bg-[#b87333] rounded-l-[2rem] shadow-[inset_-3px_0_8px_rgba(0,0,0,0.3)] border-y-4 border-l-4 border-[#8f5825] -z-10 flex items-center justify-start pl-2 sm:pl-3 transition-all duration-500">
          <div class="w-3.5 sm:w-4 h-10 sm:h-14 bg-[#8f5825] rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] opacity-80"/>
        </div>
        <div v-if="paddedPlayers.length === 8" class="absolute -right-9 sm:-right-12 top-1/2 -translate-y-1/2 w-11 sm:w-14 h-20 sm:h-24 bg-[#b87333] rounded-r-[2rem] shadow-[inset_3px_0_8px_rgba(0,0,0,0.3)] border-y-4 border-r-4 border-[#8f5825] -z-10 flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500">
          <div class="w-3.5 sm:w-4 h-10 sm:h-14 bg-[#8f5825] rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] opacity-80"/>
        </div>

        <!-- Info central -->
        <TableCenterBadge
          :room-id="roomId"
          :is-host="isHost"
          :allow-bots="allowBots"
          :is-table-full="isTableFull"
          :can-expand-lobby="canExpandLobby"
          :players-count="players.length"
          :max-allowed="maxAllowed"
          :selected-game="selectedGame"
          @add-bot="$emit('add-bot', $event)"
        />

        <!-- Avatares -->
        <div class="absolute inset-0 pointer-events-none z-20">
          <PlayerSeat
            v-for="player in paddedPlayers" 
            :key="player.userId"
            :player="player"
            :position="getAvatarPosition(player.seatIndex, paddedPlayers.length)"
            :is-host="isHost"
            :host-user-id="hostUserId"
            :local-player-color="playerStore.color"
            @avatar-click="!player.isLocked && (player.isEmpty ? $emit('change-seat', player.seatIndex) : $emit('avatar-click', player))"
            @locked-click="handleLockedClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import anime from 'animejs'
import { usePlayerStore } from '~/stores/playerStore'
import { useAppAudio } from '~/composables/useAppAudio'
import PlayerSeat from './PlayerSeat.vue'
import TableCenterBadge from './TableCenterBadge.vue'
import { getAvatarPositionLogic } from '~/utils/tableGeometry'

const props = defineProps({
  roomId: { type: String, required: true },
  players: { type: Array as () => any[], required: true },
  hostUserId: { type: String, required: true },
  selectedGame: { type: String, required: true }
})

defineEmits<{
  'add-bot': [difficulty: number]
  'avatar-click': [player: any]
  'change-seat': [seatIndex: number]
}>()

const { playTableExpand, playTableShrink, playUiClick } = useAppAudio()
const toast = useToast()
const playerStore = usePlayerStore()
const allowBots = computed(() => ['uno', 'parchis', 'liars'].includes(props.selectedGame))
const isHost = computed(() => props.hostUserId === playerStore.userId)

const maxAllowed = computed(() => {
  if (props.selectedGame === 'parchis') return playerStore.roomRules?.parchisBoardSize || 4
  return playerStore.roomRules?.extendedLobby ? 8 : 6
})

const isTableFull = computed(() => props.players.length >= maxAllowed.value)
const canExpandLobby = computed(() => {
  if (props.selectedGame === 'parchis') {
    return (playerStore.roomRules?.parchisBoardSize || 4) < 8
  }
  return !playerStore.roomRules?.extendedLobby
})

const handleLockedClick = (player: any) => {
  playUiClick()
  if (isHost.value) {
    if (props.selectedGame === 'parchis' && canExpandLobby.value) {
      toast.add({
        title: 'Asiento de Parchís bloqueado',
        description: 'Abre "Reglas de la Mesa" y amplía el tablero a 6 u 8 puestos para habilitarlo.',
        color: 'amber',
        icon: 'i-lucide-lock'
      })
    } else if (canExpandLobby.value) {
      toast.add({
        title: 'Asiento bloqueado (Lobby 6 Jugadores)',
        description: 'Abre "Ajustes Generales" y activa "Lobby Extendido" para desbloquear los puestos 7 y 8.',
        color: 'amber',
        icon: 'i-lucide-lock'
      })
    }
  } else {
    toast.add({
      title: 'Asiento bloqueado',
      description: 'Pídele al anfitrión que amplíe la capacidad de la sala en los ajustes.',
      color: 'amber',
      icon: 'i-lucide-lock'
    })
  }
}

const paddedPlayers = computed(() => {
  const max = maxAllowed.value
  const visualTotal = 8
  const current = new Array(visualTotal).fill(null)
  
  const isSeatLocked = (i: number, m: number) => {
    if (m < 8 && (i === 2 || i === 6)) return true
    if (m <= 4 && (i === 0 || i === 4)) return true
    return false
  }

  const playersWithoutValidSeat: any[] = []
  props.players.forEach(player => {
    if (
      player.seatIndex !== undefined && 
      player.seatIndex >= 0 && 
      player.seatIndex < visualTotal && 
      !isSeatLocked(player.seatIndex, max) &&
      current[player.seatIndex] === null
    ) {
      current[player.seatIndex] = player
    } else {
      playersWithoutValidSeat.push(player)
    }
  })

  playersWithoutValidSeat.forEach(player => {
    const emptyIdx = current.findIndex((p, i) => p === null && !isSeatLocked(i, max))
    if (emptyIdx !== -1) current[emptyIdx] = { ...player, seatIndex: emptyIdx }
  })

  for (let i = 0; i < current.length; i++) {
    if (current[i] === null) {
      current[i] = { isEmpty: true, isLocked: isSeatLocked(i, max), seatIndex: i, userId: `empty-${i}` }
    } else if (current[i].seatIndex === undefined) {
      current[i] = { ...current[i], seatIndex: i }
    }
  }
  return current
})

const getAvatarPosition = (index: number, total: number) => getAvatarPositionLogic(index, total, 0)

watch(() => maxAllowed.value, (newLen, oldLen) => {
  if (oldLen > 0) {
    if (newLen > oldLen) playTableExpand()
    else if (newLen < oldLen) playTableShrink()
  }
})

onMounted(() => {
  anime({
    targets: '.table-surface', scale: [0.8, 1], opacity: [0, 1],
    duration: 1000, easing: 'easeOutExpo'
  })
})
</script>

<style scoped>
.player-table-container {
  --hole-offset-x: 0rem;
  --hole-offset-y: 0rem;
  --hole-mid-y: 0rem;
  --side-chair-offset: 1.5rem;
}
@media (min-width: 640px) {
  .player-table-container {
    --side-chair-offset: 1.75rem;
  }
}
@media (min-width: 768px) {
  .player-table-container {
    --side-chair-offset: 2rem;
  }
}
</style>
