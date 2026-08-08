<script setup lang="ts">
import { ref } from 'vue'
import { ScrollText } from 'lucide-vue-next'

defineProps<{
  bgClass?: string
  isFinished?: boolean
  winnerMessage?: string
  rules?: string[]
}>()

defineEmits<{
  (e: 'leave'): void
}>()

const isRulesOpen = ref(false)
</script>

<template>
  <div class="h-[100dvh] w-full overflow-hidden flex flex-col relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" :class="bgClass || 'bg-zinc-950'">
    <GameExitButton @leave="$emit('leave')" />
    
    <div v-if="rules && rules.length > 0" 
         class="absolute right-4 z-[100] top-[max(1rem,env(safe-area-inset-top))]"
         @mouseleave="isRulesOpen = false">
      <button 
        class="w-12 h-12 rounded-full border-[4px] border-[#5c3a21] bg-[#f4e4bc] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        @click="isRulesOpen = !isRulesOpen"
        @mouseenter="isRulesOpen = true"
        aria-label="Reglas del Juego"
      >
        <ScrollText class="w-6 h-6 text-[#5c3a21]" />
      </button>

      <div 
        v-show="isRulesOpen" 
        class="absolute top-full right-0 mt-3 w-[85vw] max-w-sm sm:w-80 md:w-96 bg-[#f4e4bc] border-[4px] border-[#5c3a21] rounded-xl p-4 md:p-5 shadow-2xl origin-top-right transition-all"
      >
        <div class="flex items-center justify-between mb-3 border-b-2 border-[#5c3a21]/20 pb-2">
          <h3 class="text-lg md:text-xl font-bold text-[#5c3a21]">Reglas del Juego</h3>
        </div>
        <ul class="space-y-2.5 text-[#5c3a21] font-medium text-sm md:text-base max-h-[60vh] overflow-y-auto overscroll-contain custom-scrollbar-notebook pb-2 pr-1">
          <li v-for="(rule, index) in rules" :key="index" class="flex items-start gap-2.5">
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5c3a21] shrink-0"></span>
            <span class="leading-snug">{{ rule }}</span>
          </li>
        </ul>
      </div>
    </div>

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
