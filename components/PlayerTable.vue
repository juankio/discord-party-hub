<template>
  <div class="relative w-full max-w-[740px] aspect-[4/3] sm:aspect-[16/9] mx-auto mt-4 sm:mt-6 px-10 sm:px-14 md:px-16 player-table-container">
    <div class="absolute inset-y-0 left-8 right-8 sm:left-12 sm:right-12 md:left-14 md:right-14 bg-[#b87333] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex p-2 sm:p-3 md:p-3.5 table-surface">
      <div class="w-full h-full bg-[#109041] rounded-[1.5rem] md:rounded-[2rem] shadow-inner relative flex items-center justify-center border-4 border-[#0a662c]">
        
        <!-- Buchacas -->
        <div class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>
        <div class="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] bg-[#111] rounded-full shadow-inner border border-black/50"/>

        <!-- Sillas Externas (Con margen lateral protegido para evitar recortes) -->
        <div v-if="paddedPlayers.length >= 7" class="absolute -left-9 sm:-left-12 md:-left-14 top-1/2 -translate-y-1/2 w-11 sm:w-14 md:w-16 h-20 sm:h-24 md:h-28 bg-[#b87333] rounded-l-[2rem] shadow-[inset_-3px_0_8px_rgba(0,0,0,0.3)] border-y-4 border-l-4 border-[#8f5825] -z-10 flex items-center justify-start pl-2 sm:pl-3 transition-all duration-500">
          <div class="w-3.5 sm:w-4 h-10 sm:h-14 bg-[#8f5825] rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] opacity-80"/>
        </div>
        <div v-if="paddedPlayers.length === 8" class="absolute -right-9 sm:-right-12 md:-right-14 top-1/2 -translate-y-1/2 w-11 sm:w-14 md:w-16 h-20 sm:h-24 md:h-28 bg-[#b87333] rounded-r-[2rem] shadow-[inset_3px_0_8px_rgba(0,0,0,0.3)] border-y-4 border-r-4 border-[#8f5825] -z-10 flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500">
          <div class="w-3.5 sm:w-4 h-10 sm:h-14 bg-[#8f5825] rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] opacity-80"/>
        </div>

        <!-- Info central -->
        <div class="text-center relative z-10 flex flex-col items-center p-2.5 sm:p-3 md:p-3.5 bg-black/40 backdrop-blur-[2px] rounded-xl sm:rounded-2xl border border-white/15 w-[85%] sm:w-auto max-w-[280px] sm:max-w-[340px] shadow-lg">
          <p class="text-[8px] sm:text-[9px] md:text-[10px] text-green-200/90 mb-0.5 uppercase tracking-[0.25em] sm:tracking-[0.35em] font-black drop-shadow">Código de la sala</p>
          <h2 class="text-lg sm:text-2xl md:text-4xl font-mono font-black text-white tracking-[0.12em] sm:tracking-[0.2em] drop-shadow-md mb-1.5 sm:mb-2 truncate w-full px-2">{{ roomId }}</h2>
          <div class="flex items-center gap-2 justify-center w-full">
            <button 
              class="copy-btn-anim flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold transition-all duration-300 border hover:scale-105 active:scale-95 hover:brightness-110 shadow-[3px_3px_0_rgba(0,0,0,0.8)]"
              :class="isCopied ? 'bg-green-600 border-green-400 text-white shadow-green-500/50' : 'bg-black/60 text-white border-white/20 shadow-black/50'"
              @click="copyLink"
            >
              <UIcon :name="isCopied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-3.5 h-3.5" />
              {{ isCopied ? '¡Copiado!' : 'Copiar Link' }}
            </button>
            <button
              v-if="isHost && allowBots"
              class="add-bot-anim flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold transition-all duration-300 border bg-blue-600/70 hover:bg-blue-500 hover:scale-105 active:scale-95 hover:brightness-110 text-white border-blue-400/50 shadow-[3px_3px_0_rgba(0,0,0,0.8)]"
              title="Añadir Bot"
              @click="handleAddBot"
            >
              <UIcon name="i-lucide-bot" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Añadir Bot</span>
            </button>
          </div>
        </div>

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
  'add-bot': [difficulty: number]
  'avatar-click': [player: any]
  'change-seat': [seatIndex: number]
}>()

const { playBot, playCopyLink, playTableExpand, playTableShrink, playUiClick } = useAppAudio()
const handleAddBot = () => { playUiClick(); playBot(); emit('add-bot', 5) }

const toast = useToast()
const playerStore = usePlayerStore()
const isCopied = ref(false)
const allowBots = computed(() => ['uno', 'parchis', 'liars'].includes(props.selectedGame))
const isHost = computed(() => props.hostUserId === playerStore.userId)

const maxAllowed = computed(() => {
  if (props.selectedGame === 'parchis') return playerStore.roomRules?.parchisBoardSize || 4
  return playerStore.roomRules?.extendedLobby ? 8 : 6
})

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

const copyLink = () => {
  if (import.meta.client) {
    playUiClick()
    playCopyLink()
    navigator.clipboard.writeText(window.location.href)
    anime({ targets: '.copy-btn-anim', scale: [1, 1.15, 1], duration: 400, easing: 'easeInOutQuad' })
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2500)
    toast.add({ title: '¡Link copiado!', description: 'Envíalo a tus amigos por Discord para que se unan.', color: 'primary', icon: 'i-lucide-check-circle' })
  }
}
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
