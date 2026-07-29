<template>
  <div
    class="player-avatar pointer-events-auto absolute w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-black rounded-full border-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col items-center overflow-visible transition-all duration-500"
    :class="{ 'cursor-pointer hover:scale-110 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:z-50': isBot && isHost }"
    :style="{
      left: position.left,
      top: position.top,
      transform: position.transform,
      borderColor: playerColor,
      boxShadow: `0 0 15px ${playerColor}80`
    }"
    @click="$emit('avatar-click', player)"
  >
    <div v-if="isHostPlayer" class="absolute -top-4 -right-2 z-20 rotate-12 drop-shadow-md">
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
      class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black whitespace-nowrap px-2 py-0.5 rounded-md tracking-wider shadow-sm max-w-[70px] sm:max-w-[100px] truncate"
      :class="playerColor === '#ffffff' ? 'text-black' : 'text-white'"
      :style="{ backgroundColor: playerColor }"
    >
      {{ player.nickname }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  player: any;
  position: { left: string; top: string; transform: string };
  isHost: boolean; // Is the current user the host?
  hostUserId: string; // The host's user ID
}>();

defineEmits<{
  (e: 'avatar-click', player: any): void;
}>();

const isBot = computed(() => props.player.isBot);
const isHostPlayer = computed(() => props.player.userId === props.hostUserId);
const playerColor = computed(() => props.player.color || '#f97316');
</script>
