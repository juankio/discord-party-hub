<script setup lang="ts">
import { computed } from 'vue'

export interface GamePlayer {
  avatarId: string | number
  nickname: string
  isOffline?: boolean
  color?: string
}

const props = withDefaults(defineProps<{
  player: GamePlayer
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}>(), {
  size: 'md',
  showName: true
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-10 h-10'
    case 'lg': return 'w-24 h-24'
    case 'md':
    default: return 'w-16 h-16'
  }
})

const textSize = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs max-w-[64px]'
    case 'lg': return 'text-base max-w-[120px]'
    case 'md':
    default: return 'text-sm max-w-[80px]'
  }
})

const avatarUrl = computed(() => {
  return `/avatars/avatar-${props.player.avatarId}.svg`
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-1.5">
    <div 
      class="relative rounded-full border-[3px] overflow-hidden flex items-center justify-center bg-zinc-800 shadow-lg transition-transform duration-300 hover:scale-105"
      :class="[sizeClasses, player.isOffline ? 'opacity-70 grayscale' : '']"
      :style="{ borderColor: player.color || '#52525b' }"
    >
      <img :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
      
      <div v-if="player.isOffline" class="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
        <div class="i-lucide-wifi-off text-red-500 w-1/2 h-1/2 drop-shadow-md"></div>
      </div>
    </div>
    
    <div 
      v-if="showName" 
      class="px-2.5 py-0.5 rounded-full bg-black/80 font-bold text-center truncate shadow-sm border border-zinc-700/50 backdrop-blur-sm"
      :class="textSize"
      :style="{ color: player.color || '#e4e4e7' }"
    >
      {{ player.nickname }}
    </div>
  </div>
</template>
