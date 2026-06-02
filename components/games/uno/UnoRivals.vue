<template>
  <div class="flex-1 flex justify-center items-start pt-12 gap-8 z-10 w-full">
    <div v-for="rival in rivals" :key="rival.userId" class="flex flex-col items-center relative">
      <!-- Avatar -->
      <div class="w-16 h-16 rounded-full border-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10 transition-colors"
           :style="{ borderColor: rival.color || '#f97316' }"
           :class="{'neon-glow': currentTurnUserId === rival.userId}">
        <img :src="`/avatars/avatar-${rival.avatarId}.svg?v=2`" class="w-full h-full object-cover rounded-full bg-[#151515]" />
        
        <!-- Mini Cards Hand -->
        <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 flex justify-center w-max pointer-events-none">
          <div class="flex -space-x-2">
            <div v-for="n in Math.min(rival.cardCount, 8)" :key="n" 
                 class="w-4 h-6 bg-gray-800 border border-gray-500 rounded-[2px] shadow-md transform rotate-[-5deg]">
              <div class="w-full h-full bg-red-800 rounded-[2px] opacity-80" 
                   style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 2px);"></div>
            </div>
            <div v-if="rival.cardCount > 8" class="w-4 h-6 bg-black border border-gray-500 rounded-[2px] flex items-center justify-center text-[8px] font-bold text-white z-10 -ml-1">
              +
            </div>
          </div>
        </div>
      </div>

      <span class="mt-4 text-sm font-bold text-gray-300">{{ rival.nickname }}</span>
      
      <!-- Botón de Denuncia -->
      <UButton v-if="rival.cardCount === 1 && !rival.hasYelledUno" 
               size="xs" color="red" class="absolute -bottom-6 whitespace-nowrap animate-bounce z-20"
               @click="$emit('challenge', rival.userId)">
        ¡Denunciar!
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  rivals: { type: Array as () => any[], required: true },
  currentTurnUserId: { type: String, required: true }
})

defineEmits(['challenge'])
</script>

<style scoped>
.neon-glow {
  box-shadow: 0 0 20px currentColor, inset 0 0 10px currentColor;
  animation: pulse-glow 1.5s infinite alternate;
}
@keyframes pulse-glow {
  from { filter: drop-shadow(0 0 5px currentColor); }
  to { filter: drop-shadow(0 0 15px currentColor); }
}
</style>
