<template>
  <div v-if="isOpen" class="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
    <h2 class="text-4xl font-black mb-8 drop-shadow-lg text-white">Elige un color</h2>
    <div class="grid grid-cols-2 gap-6">
      <div class="w-32 h-32 bg-red-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.5)]" @click="$emit('select', 'red')"/>
      <div class="w-32 h-32 bg-blue-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.5)]" @click="$emit('select', 'blue')"/>
      <div class="w-32 h-32 bg-green-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.5)]" @click="$emit('select', 'green')"/>
      <div class="w-32 h-32 bg-yellow-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.5)]" @click="$emit('select', 'yellow')"/>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isOpen: { type: Boolean, required: true }
})
defineEmits(['select'])
</script>
