<template>
  <button 
    @click="$emit('leave')"
    class="absolute top-4 left-4 z-[100] group flex items-center gap-2 bg-[#8b2323] hover:bg-[#a52a2a] active:bg-[#6b1b1b] text-red-50 px-4 py-2 rounded border-b-4 border-[#4a1212] active:border-b-0 active:translate-y-1 transition-all shadow-md font-bold uppercase tracking-widest text-xs"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
    <span class="hidden sm:inline-block">Volver a la Sala</span>
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'leave'): void
}>()
</script>
