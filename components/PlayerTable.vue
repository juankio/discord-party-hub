<template>
  <div class="relative w-full max-w-4xl aspect-[16/9] sm:aspect-[2/1] mx-auto mt-10 player-table-container">
    <!-- Mesa de Billar Vectorial 2D -->
    <div class="absolute inset-10 md:inset-8 bg-[#b87333] rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex p-3 md:p-5 table-surface">
      <!-- Paño Verde -->
      <div class="w-full h-full bg-[#109041] rounded-[1.5rem] md:rounded-[2.5rem] shadow-[inset_0_0_30px_rgba(0,0,0,0.4)] relative flex items-center justify-center border-4 border-[#0a662c]">
        
        <!-- Buchacas (Agujeros negros) -->
        <!-- Superior Izquierda -->
        <div class="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-8 h-8 md:w-12 md:h-12 bg-[#111] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] border border-black/50"/>
        <!-- Superior Medio -->
        <div class="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 w-8 h-8 md:w-12 md:h-12 bg-[#111] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] border border-black/50"/>
        <!-- Superior Derecha -->
        <div class="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-8 h-8 md:w-12 md:h-12 bg-[#111] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] border border-black/50"/>
        <!-- Inferior Izquierda -->
        <div class="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-8 h-8 md:w-12 md:h-12 bg-[#111] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] border border-black/50"/>
        <!-- Inferior Medio -->
        <div class="absolute -bottom-4 md:-bottom-5 left-1/2 -translate-x-1/2 w-8 h-8 md:w-12 md:h-12 bg-[#111] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] border border-black/50"/>
        <!-- Inferior Derecha -->
        <div class="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-8 h-8 md:w-12 md:h-12 bg-[#111] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] border border-black/50"/>

        <!-- Centro de la mesa (Info) -->
        <div class="text-center relative z-10 flex flex-col items-center p-6 bg-black/20 rounded-3xl backdrop-blur-sm border border-white/10">
          <p class="text-[10px] md:text-xs text-green-100 mb-2 uppercase tracking-[0.4em] font-black drop-shadow-md">Código de la sala</p>
          <h2 class="text-5xl md:text-7xl font-mono font-black text-white tracking-[0.2em] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] mb-4">{{ roomId }}</h2>
          <button 
            class="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
            @click="copyLink"
          >
            <UIcon name="i-lucide-copy" class="w-4 h-4" />
            Copiar Link
          </button>
        </div>
      </div>
    </div>

    <!-- Avatares de Jugadores -->
    <div 
      v-for="(player, index) in players" 
      :key="player.userId"
      class="absolute player-avatar w-16 h-16 md:w-20 md:h-20 bg-black rounded-full border-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col items-center overflow-visible"
      :style="[
        getAvatarPosition(index, players.length),
        { borderColor: player.color || '#f97316' }
      ]"
    >
      <div v-if="player.userId === hostUserId" class="absolute -top-4 -right-2 z-20 rotate-12 drop-shadow-md">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" stroke="#2c190d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/>
        </svg>
      </div>

      <!-- Overlay Offline -->
      <div v-if="player.isOffline" class="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center z-30 backdrop-blur-[2px]">
        <UIcon name="i-lucide-wifi-off" class="w-6 h-6 md:w-8 md:h-8 text-orange-500 animate-pulse" />
      </div>
      <span v-if="player.isOffline" class="absolute -top-6 text-[8px] md:text-[9px] font-black text-orange-400 bg-black/90 px-2 py-0.5 rounded border border-orange-500/50 whitespace-nowrap animate-pulse z-40">
        Reconectando...
      </span>

      <img :src="`/avatars/avatar-${player.avatarId}.svg?v=2`" class="w-full h-full rounded-full object-contain bg-[#151515]" :class="{'grayscale opacity-50': player.isOffline}">
      <span 
        class="absolute -bottom-6 text-[10px] font-black whitespace-nowrap px-2 py-0.5 rounded-md tracking-wider shadow-sm"
        :class="player.color === '#ffffff' ? 'text-black' : 'text-white'"
        :style="{ backgroundColor: player.color || '#f97316' }"
      >
        {{ player.nickname }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import anime from 'animejs'

const props = defineProps({
  roomId: { type: String, required: true },
  players: { type: Array as () => any[], required: true },
  hostUserId: { type: String, required: true }
})

const toast = useToast()

// Calcula posiciones en un óvalo (mesa)
const getAvatarPosition = (index: number, total: number) => {
  // Ajuste para el primer jugador abajo al centro
  const offset = Math.PI / 2
  const angle = (index / total) * Math.PI * 2 + offset
  // Usamos porcentajes para ser responsive
  const rx = 45 // radio X en porcentaje
  const ry = 40 // radio Y en porcentaje
  const cx = 50
  const cy = 50
  
  const x = cx + rx * Math.cos(angle)
  const y = cy + ry * Math.sin(angle)
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)' // Centrar sobre sus coordenadas
  }
}

watch(() => props.players.length, (newLength, oldLength) => {
  if (newLength > (oldLength || 0)) {
    // Animar la entrada del nuevo jugador
    setTimeout(() => {
      anime({
        targets: '.player-avatar',
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutElastic(1, .5)'
      })
    }, 50)
  }
})

onMounted(() => {
  anime({
    targets: '.table-surface',
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 1000,
    easing: 'easeOutExpo'
  })
})

const copyLink = () => {
  if (import.meta.client) {
    navigator.clipboard.writeText(window.location.href)
    toast.add({
      title: '¡Link copiado!',
      description: 'Envíalo a tus amigos por Discord para que se unan.',
      color: 'primary',
      icon: 'i-lucide-check-circle'
    })
  }
}
</script>
