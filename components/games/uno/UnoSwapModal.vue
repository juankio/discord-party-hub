<template>
  <div v-if="isOpen" class="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
    <h2 class="text-4xl font-black mb-8 drop-shadow-lg text-white">Intercambiar Cartas</h2>
    <p class="text-gray-300 mb-8">Elige un rival para intercambiar tu mano</p>
    <div class="flex gap-6 flex-wrap justify-center max-w-2xl">
      <div 
        v-for="rival in rivals" 
        :key="rival.userId"
        class="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform p-4 rounded-2xl bg-[#151515] border-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        :style="{ borderColor: rival.color || '#f97316' }"
        @click="$emit('select', rival.userId)"
      >
        <img :src="`/avatars/avatar-${rival.avatarId}.svg?v=2`" class="w-20 h-20 object-cover rounded-full bg-[#151515] mb-4">
        <span class="text-lg font-bold text-gray-100">{{ rival.nickname }}</span>
        <span class="text-xs text-gray-400 mt-1">{{ rival.cardCount }} cartas</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isOpen: { type: Boolean, required: true },
  rivals: { type: Array as () => any[], required: true }
})
defineEmits(['select'])
</script>