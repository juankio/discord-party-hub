<template>
  <div class="fixed bottom-6 right-6 z-50 flex items-center justify-center">
    <button
      @click="toggleAudio"
      class="group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-md transition-all duration-500 ease-out hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 overflow-hidden"
      :class="[
        !audioStore.isMuted 
          ? 'shadow-[0_0_20px_rgba(var(--theme-color-rgb),0.3)] border-primary-500/50' 
          : 'shadow-none border-white/5 opacity-50 hover:opacity-100 grayscale'
      ]"
      aria-label="Toggle Audio"
    >
      <!-- Glow Underlay -->
      <div 
        class="absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ease-out"
        :style="{ backgroundColor: 'var(--theme-color)' }"
        :class="audioStore.isMuted ? 'opacity-0' : 'opacity-20 group-hover:opacity-40'"
      ></div>

      <!-- Inner Ring / Pro Max styling -->
      <div 
        class="absolute inset-0 rounded-full border border-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      ></div>

      <!-- Icon Container -->
      <div 
        class="relative z-10 text-white transition-all duration-500 ease-out flex items-center justify-center"
        :class="audioStore.isMuted ? 'scale-90 text-gray-500' : 'scale-100'"
        :style="!audioStore.isMuted ? { color: 'var(--theme-color)' } : {}"
      >
        <UIcon 
          v-if="!audioStore.isMuted"
          name="i-heroicons-speaker-wave" 
          class="h-6 w-6 drop-shadow-lg" 
        />
        <UIcon 
          v-else
          name="i-heroicons-speaker-x-mark" 
          class="h-6 w-6" 
        />
      </div>

      <!-- Sweep Effect -->
      <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-sweep"></div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAudioStore } from '~/stores/audioStore'
import { useGameSound } from '~/composables/useGameSound'

const audioStore = useAudioStore()

const { play: playToggleSound } = useGameSound('/sounds/lobby/lobby_join.ogg')

const toggleAudio = () => {
  audioStore.toggleMute()
  if (!audioStore.isMuted) {
    playToggleSound()
  }
}
</script>

<style scoped>
@keyframes sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-sweep {
  animation: sweep 1s ease-in-out infinite;
}
</style>
