<template>
  <div class="relative w-full max-w-4xl aspect-video sm:aspect-[2/1] mx-auto mt-10 player-table-container">
    <!-- Mesa Virtual -->
    <div class="absolute inset-8 bg-[#2b2d31] rounded-[3rem] border border-gray-700 shadow-2xl flex items-center justify-center table-surface">
      <div class="text-center">
        <p class="text-sm text-gray-400 mb-2 uppercase tracking-widest">Código de la sala</p>
        <h2 class="text-4xl md:text-5xl font-mono font-black text-white tracking-widest">{{ roomId }}</h2>
        <UButton 
          icon="i-lucide-copy" 
          size="sm" 
          color="gray" 
          variant="ghost" 
          class="mt-2"
          @click="copyLink"
        >
          Copiar Link
        </UButton>
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
