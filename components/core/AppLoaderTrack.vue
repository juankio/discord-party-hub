<template>
  <svg class="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 400 300" fill="none">
    <path 
      class="track-path-base"
      d="M 200 150 C 280 50, 380 50, 380 150 C 380 250, 280 250, 200 150 C 120 50, 20 50, 20 150 C 20 250, 120 250, 200 150 Z" 
      stroke="rgba(255,255,255,0.05)" 
      stroke-width="4" 
    />
    <path 
      class="track-laser" 
      d="M 200 150 C 280 50, 380 50, 380 150 C 380 250, 280 250, 200 150 C 120 50, 20 50, 20 150 C 20 250, 120 250, 200 150 Z" 
      :stroke="currentCardColor" 
      stroke-width="6" 
      stroke-linecap="round"
      style="filter: drop-shadow(0 0 10px currentColor);"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps({
  currentCardColor: { type: String, required: true }
})
</script>
