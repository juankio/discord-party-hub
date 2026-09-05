<template>
  <div
    ref="seatRef"
    class="player-avatar pointer-events-auto absolute w-10 h-10 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] flex flex-col items-center justify-center rounded-full border-3 md:border-4 overflow-visible will-change-[top,left,transform]"
    :class="[
      player.isLocked ? 'cursor-pointer bg-black/80 border-red-500/60 shadow-none' : 
      (player.isEmpty ? 'cursor-pointer bg-black/40 border-dashed border-gray-600/50 shadow-none' : 'bg-black'),
      { 'cursor-pointer hover:z-50': isBot && isHost && !player.isEmpty && !player.isLocked }
    ]"
    :style="{
      left: position.left,
      top: position.top,
      transform: isHovered && !player.isLocked
        ? (player.isEmpty
          ? `${position.transform} scale(1.05)`
          : (isBot && isHost && !player.isEmpty ? `${position.transform} scale(1.1)` : position.transform))
        : position.transform,
      borderColor: player.isLocked ? '' : (player.isEmpty ? (isHovered ? localPlayerColorSafe : '') : playerColor),
      backgroundColor: player.isLocked ? '' : (player.isEmpty && isHovered ? 'rgba(0,0,0,0.6)' : ''),
      boxShadow: player.isLocked ? 'none' : (player.isEmpty
        ? (isHovered ? `0 0 16px ${localPlayerColorSafe}aa` : 'none')
        : (isHovered && isBot && isHost ? `0 0 20px rgba(255,255,255,0.4)` : `0 0 12px ${playerColor}80`)),
      transition: 'top 700ms cubic-bezier(0.68, -0.55, 0.27, 1.55), left 700ms cubic-bezier(0.68, -0.55, 0.27, 1.55), transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out, background-color 200ms ease-out'
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleClick"
  >
    <!-- Tooltip Asiento Bloqueado -->
    <div 
      v-if="isHovered && player.isLocked" 
      class="absolute z-[100] bg-[#3a2212] border-2 border-[#7d512a] px-2.5 py-1 rounded-lg flex flex-col items-center pointer-events-none whitespace-nowrap shadow-xl"
      :class="isTopSeat ? '-top-12 sm:-top-14' : '-bottom-12 sm:-bottom-14'"
    >
      <span class="text-white text-[11px] font-bold leading-tight">Lobby Limitado</span>
      <span class="text-yellow-500 text-[9px] font-bold leading-tight mt-0.5">Expande la mesa en las Reglas</span>
    </div>

    <!-- Overlay Offline -->
    <div v-if="player.isOffline && !player.isEmpty" class="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center z-30 backdrop-blur-[2px]">
      <UIcon name="i-lucide-wifi-off" class="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 animate-pulse" />
    </div>

    <img v-if="!player.isEmpty && !player.isLocked" :src="`/avatars/avatar-${player.avatarId}.svg?v=2`" class="w-full h-full rounded-full object-contain bg-[#151515]" :class="{'grayscale opacity-50': player.isOffline}">

    <UIcon v-if="player.isLocked" name="i-lucide-lock" class="text-red-500 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-60" />

    <!-- Corona de Host -->
    <div v-if="isHostPlayer && !player.isEmpty && !player.isLocked" class="absolute -top-3 -right-1 sm:-top-3.5 sm:-right-1.5 z-20 rotate-12 drop-shadow-md pointer-events-none">
      <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="#f59e0b" stroke="#2c190d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/>
      </svg>
    </div>

    <!-- Reconectando -->
    <span 
      v-if="player.isOffline && !player.isEmpty" 
      class="absolute left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-black text-orange-400 bg-black/90 px-1.5 py-0.5 rounded border border-orange-500/50 whitespace-nowrap animate-pulse z-40 pointer-events-none"
      :class="isTopSeat ? '-top-5 sm:-top-6' : '-bottom-5 sm:-bottom-6'"
    >
      Reconectando...
    </span>
    
    <!-- Etiqueta de Nombre / Estado -->
    <span 
      v-if="!player.isLocked"
      :title="player.nickname"
      class="absolute left-1/2 -translate-x-1/2 z-30 text-[9px] sm:text-[10px] md:text-[11px] font-black whitespace-nowrap px-1.5 sm:px-2 py-0.5 rounded-md tracking-wider shadow-sm max-w-[85px] sm:max-w-[140px] md:max-w-[180px] truncate transition-colors duration-200 pointer-events-none"
      :class="[
        isTopSeat ? '-top-5 sm:-top-6' : '-bottom-5 sm:-bottom-6',
        player.isEmpty ? (isHovered ? (localPlayerColorSafe === '#ffffff' ? 'text-black' : 'text-white') : 'text-white/60 bg-black/60') : (playerColor === '#ffffff' ? 'text-black' : 'text-white')
      ]"
      :style="{ backgroundColor: player.isEmpty ? (isHovered ? localPlayerColorSafe : '') : playerColor }"
    >
      {{ player.isEmpty ? (isHovered ? 'Mover aquí' : 'Libre') : player.nickname }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import anime from 'animejs';

const props = defineProps<{
  player: any;
  position: { left: string; top: string; transform: string };
  isHost: boolean;
  hostUserId: string;
  localPlayerColor?: string;
}>();

const emit = defineEmits<{
  (e: 'avatar-click', player: any): void;
  (e: 'locked-click', player: any): void;
}>();

const isHovered = ref(false);
const seatRef = ref<HTMLElement | null>(null);

const isBot = computed(() => props.player.isBot);
const isHostPlayer = computed(() => props.player.userId === props.hostUserId);
const playerColor = computed(() => props.player.color || '#f97316');
const localPlayerColorSafe = computed(() => props.localPlayerColor || '#f97316');

const isTopSeat = computed(() => {
  if (typeof props.player?.seatIndex === 'number') {
    return [1, 2, 3].includes(props.player.seatIndex);
  }
  return !props.position?.top?.includes('100%') && !props.position?.top?.includes('50%');
});

const handleClick = () => {
  if (props.player.isLocked) {
    if (seatRef.value) {
      anime({
        targets: seatRef.value,
        translateX: [-4, 4, -2, 2, 0],
        duration: 300,
        easing: 'easeInOutQuad'
      });
    }
    emit('locked-click', props.player);
    return;
  }
  emit('avatar-click', props.player);
};
</script>
