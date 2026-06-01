<template>
  <div class="relative w-full max-w-4xl aspect-video sm:aspect-[2/1] mx-auto mt-10 player-table-container">
    <!-- Mesa Virtual -->
    <div class="absolute inset-8 bg-[#151515] rounded-[3rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center table-surface relative overflow-hidden">
      <!-- Glow sutil en el centro -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]"></div>
      
      <div class="text-center relative z-10 flex flex-col items-center">
        <p class="text-[10px] text-gray-500 mb-2 uppercase tracking-[0.4em] font-black">Código de la sala</p>
        <h2 class="text-5xl md:text-7xl font-mono font-black text-white tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-4">{{ roomId }}</h2>
        <button 
          @click="copyLink"
          class="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10 hover:border-white/20"
        >
          <UIcon name="i-lucide-copy" class="w-4 h-4" />
          Copiar Link
        </button>
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
      <img :src="`/avatars/avatar-${player.avatarId}.svg?v=2`" class="w-full h-full rounded-full object-contain bg-[#151515]" />
      <span 
        class="absolute -bottom-6 text-[10px] font-black text-white whitespace-nowrap px-2 py-0.5 rounded-md tracking-wider"
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
  players: { type: Array as () => any[], required: true }
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
