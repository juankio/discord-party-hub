<script setup lang="ts">
defineProps<{
  bgClass?: string
  isFinished?: boolean
  winnerMessage?: string
}>()

defineEmits<{
  (e: 'leave'): void
}>()
</script>

<template>
  <div class="h-[100dvh] w-full overflow-hidden flex flex-col relative" :class="bgClass || 'bg-zinc-950'">
    <GameExitButton @leave="$emit('leave')" />
    
    <div class="flex-1 w-full h-full overflow-hidden relative">
      <slot />
    </div>

    <GameVictoryModal 
      :is-open="isFinished || false" 
      :winner-message="winnerMessage || '¡Juego Terminado!'" 
      @lobby="$emit('leave')" 
    />
  </div>
</template>
