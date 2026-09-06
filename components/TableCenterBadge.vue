<template>
  <div class="text-center relative z-10 flex flex-col items-center p-2 sm:p-2.5 md:p-3.5 bg-black/40 backdrop-blur-[2px] rounded-xl sm:rounded-2xl border border-white/15 w-[85%] sm:w-auto max-w-[240px] sm:max-w-[280px] md:max-w-[340px] shadow-lg">
    <p class="text-[8px] sm:text-[9px] md:text-[10px] text-green-200/90 mb-0.5 uppercase tracking-[0.25em] sm:tracking-[0.35em] font-black drop-shadow">Código de la sala</p>
    <h2 class="text-base sm:text-xl md:text-4xl font-mono font-black text-white tracking-[0.12em] sm:tracking-[0.2em] drop-shadow-md mb-1.5 sm:mb-2 truncate w-full px-2">{{ roomId }}</h2>
    
    <div class="flex items-center gap-2 justify-center w-full">
      <!-- Botón Copiar Link -->
      <button 
        class="copy-btn-anim flex items-center justify-center gap-1.5 sm:gap-2 min-h-[36px] sm:min-h-[40px] px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 border hover:scale-105 active:scale-95 hover:brightness-110 shadow-[3px_3px_0_rgba(0,0,0,0.8)]"
        :class="isCopied ? 'bg-green-600 border-green-400 text-white shadow-green-500/50' : 'bg-black/60 text-white border-white/20 shadow-black/50'"
        @click="copyLink"
      >
        <UIcon :name="isCopied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-3.5 h-3.5" />
        {{ isCopied ? '¡Copiado!' : 'Copiar Link' }}
      </button>

      <!-- Botón Añadir Bot con feedback pro -->
      <button
        v-if="isHost && allowBots"
        class="add-bot-anim flex items-center justify-center gap-1.5 sm:gap-2 min-h-[36px] sm:min-h-[40px] px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 border shadow-[3px_3px_0_rgba(0,0,0,0.8)]"
        :class="[
          isTableFull 
            ? (canExpandLobby 
                ? 'bg-amber-600/80 hover:bg-amber-500 border-amber-400/60 text-amber-50 active:scale-95' 
                : 'bg-zinc-800/80 border-zinc-600/50 text-zinc-400 opacity-60 cursor-not-allowed')
            : 'bg-blue-600/70 hover:bg-blue-500 hover:scale-105 active:scale-95 hover:brightness-110 text-white border-blue-400/50'
        ]"
        :title="isTableFull ? (canExpandLobby ? 'Mesa llena. Expande el lobby en las reglas para añadir más.' : 'Capacidad máxima alcanzada (8/8).') : 'Añadir Bot'"
        @click="handleAddBot"
      >
        <UIcon :name="isTableFull ? (canExpandLobby ? 'i-lucide-user-x' : 'i-lucide-ban') : 'i-lucide-bot'" class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">{{ isTableFull ? (canExpandLobby ? 'Mesa Llena (+)' : 'Máx. 8/8') : 'Añadir Bot' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import anime from 'animejs'
import { useAppAudio } from '~/composables/useAppAudio'

const props = defineProps<{
  roomId: string
  isHost: boolean
  allowBots: boolean
  isTableFull: boolean
  canExpandLobby: boolean
  playersCount: number
  maxAllowed: number
  selectedGame: string
}>()

const emit = defineEmits<{
  'add-bot': [difficulty: number]
}>()

const { showAlert } = useAppAlert()
const isCopied = ref(false)
const { playBot, playCopyLink, playUiClick } = useAppAudio()

const handleAddBot = () => {
  playUiClick()
  if (props.isTableFull) {
    anime({
      targets: '.add-bot-anim',
      translateX: [-6, 6, -4, 4, -2, 2, 0],
      duration: 350,
      easing: 'easeInOutQuad'
    })
    if (props.selectedGame === 'parchis' && props.canExpandLobby) {
      showAlert({
        title: `Mesa de Parchís completa (${props.playersCount}/${props.maxAllowed})`,
        description: 'Abre "Reglas de la Mesa" para ampliar el tablero a 6 u 8 puestos.',
        type: 'warning',
        icon: 'i-lucide-info'
      })
    } else if (props.canExpandLobby) {
      showAlert({
        title: `Mesa llena (${props.playersCount}/${props.maxAllowed})`,
        description: 'Abre "Ajustes Generales" y activa el Lobby Extendido para añadir hasta 8 participantes.',
        type: 'warning',
        icon: 'i-lucide-info'
      })
    } else {
      showAlert({
        title: 'Capacidad máxima alcanzada (8/8)',
        description: 'La sala ha alcanzado el límite físico de 8 jugadores.',
        type: 'error',
        icon: 'i-lucide-ban'
      })
    }
    return
  }
  playBot()
  emit('add-bot', 5)
}

const copyLink = () => {
  if (import.meta.client) {
    playUiClick()
    playCopyLink()
    navigator.clipboard.writeText(window.location.href)
    anime({ targets: '.copy-btn-anim', scale: [1, 1.15, 1], duration: 400, easing: 'easeInOutQuad' })
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2500)
    if (props.isTableFull) {
      showAlert({
        title: '¡Link copiado! (Mesa Completa)',
        description: props.canExpandLobby 
          ? `La sala está completa (${props.playersCount}/${props.maxAllowed}). Recuerda activar el Lobby Extendido en las reglas para que puedan unirse.`
          : 'La sala está al límite máximo (8/8). Alguien debe salir para que otro pueda entrar.',
        type: 'warning',
        icon: 'i-lucide-alert-triangle'
      })
    } else {
      showAlert({
        title: '¡Link copiado!',
        description: 'Envíalo a tus amigos por Discord para que se unan.',
        type: 'success',
        icon: 'i-lucide-check-circle'
      })
    }
  }
}
</script>
