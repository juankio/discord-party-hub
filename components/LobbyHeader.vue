<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8 header-anim w-full">
    <h1 class="text-2xl sm:text-3xl font-black text-white text-center sm:text-left">
      Sala: <span class="text-primary">{{ roomId }}</span> 
      <span class="text-gray-500 text-lg sm:text-xl ml-2">{{ playersCount }}/{{ maxPlayers }}</span>
    </h1>
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Botón Editar Perfil -->
      <button 
        @click="$emit('open-edit')"
        class="group relative flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-black/40 hover:bg-white/5 text-gray-300 hover:text-white rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-110 shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 focus-visible:ring-0"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_var(--theme-color,rgba(249,115,22,0.2))] rounded-xl pointer-events-none"></div>
        <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110" style="color: var(--theme-color); filter: drop-shadow(0 0 4px var(--theme-color));" />
        <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Editar Perfil</span>
      </button>

      <!-- Botón Salir -->
      <button 
        @click="$emit('leave-room')"
        class="group relative flex items-center gap-2 p-2.5 sm:px-5 sm:py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-110 shadow-[0_4px_14px_0_rgba(239,68,68,0.1)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.2)] overflow-hidden font-bold text-sm backdrop-blur-md outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 focus-visible:ring-0"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)] rounded-xl pointer-events-none"></div>
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <span class="hidden sm:inline-block relative z-10 tracking-wide drop-shadow-md">Salir</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  roomId: string;
  playersCount: number;
  maxPlayers: number;
}>();

defineEmits(['open-edit', 'leave-room']);
</script>
