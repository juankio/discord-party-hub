<script setup lang="ts">
defineProps<{
  message: string
  icon?: string
}>()
</script>

<template>
  <div class="absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-black/80 backdrop-blur-sm z-50">
    <div 
      class="animate-spin text-6xl mb-6 text-primary"
      :class="icon || 'i-lucide-loader-2'"
    ></div>
    <h2 class="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-primary to-purple-500 animate-pulse drop-shadow-lg uppercase text-center px-4">
      {{ message }}
    </h2>
  </div>
</template>
