<script setup lang="ts">
// Shell component for now
</script>

<template>
  <div class="flex items-center justify-center h-full w-full bg-gray-900 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
    <!-- Grid/Pro-line background -->
    <div class="absolute inset-0 bg-[url('/img/grid.svg')] opacity-10 pointer-events-none"></div>
    
    <div class="relative z-10 text-center">
      <UIcon name="i-lucide-construction" class="w-20 h-20 text-orange-500 mx-auto mb-4 animate-pulse" />
      <h2 class="text-3xl font-black text-white tracking-widest">TABLERO EN CONSTRUCCIÓN</h2>
      <p class="text-gray-400 mt-2 max-w-md mx-auto">
        Pronto podrás tirar los dados y mover tus fichas. Prepárate para la batalla.
      </p>
    </div>
  </div>
</template>
