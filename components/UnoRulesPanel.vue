<template>
  <Transition name="slide-panel">
    <div class="w-full max-w-[800px] mx-auto relative z-10 -mt-2 px-8">
      <div class="bg-[#8b5a2b] rounded-b-3xl border-4 border-t-0 border-[#5c3a21] p-6 pt-8 shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative">
        <h4 class="text-white/80 font-black text-[10px] tracking-[0.4em] uppercase mb-5 text-center drop-shadow-sm">
          Reglas de la Mesa
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <label v-for="(rule, key) in rulesList" :key="key" 
                 class="group flex items-center justify-between bg-[#6d4621] hover:bg-[#5c3a1b] p-4 rounded-xl cursor-pointer transition-colors border border-[#4a2e15] shadow-[inset_0_2px_5px_rgba(0,0,0,0.3),_0_1px_0_rgba(255,255,255,0.1)]"
                 :class="{'md:col-span-2': key === 'interceptExact'}">
            <span class="text-[#f2f3f5] font-black text-xs tracking-wide drop-shadow-md">{{ rule.label }}</span>
            
            <!-- Billiard Switch Custom -->
            <div class="w-16 h-8 rounded-full border-[3px] border-[#2a1a0f] shadow-[inset_0_5px_10px_rgba(0,0,0,0.8),_0_2px_0_rgba(255,255,255,0.1)] relative transition-colors duration-300"
                 :class="rules[key] ? 'bg-[#109041]' : 'bg-[#151515]'">
              <!-- Rail Line (Taco / Riel) -->
              <div class="absolute top-1/2 left-2 right-2 h-1 -translate-y-1/2 rounded-full transition-colors duration-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]"
                   :style="rules[key] ? { backgroundColor: 'var(--theme-color)' } : { backgroundColor: '#333' }"></div>
              
              <!-- La Bola (Thumb) -->
              <div class="absolute top-[-1px] bottom-[-1px] w-8 h-8 rounded-full shadow-[inset_-3px_-3px_5px_rgba(0,0,0,0.6),_inset_2px_2px_4px_rgba(255,255,255,0.4),_0_3px_5px_rgba(0,0,0,0.6)] transition-all duration-300 flex items-center justify-center border border-black/20"
                   :class="rules[key] ? 'right-[-1px] bg-[#111] rotate-180' : 'left-[-1px] bg-[#f8f9fa] rotate-0'">
                   <!-- Centro de la bola -->
                   <div class="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
                     <span class="font-black text-[8px]" :class="rules[key] ? 'text-black' : 'text-gray-400'">8</span>
                   </div>
                   <!-- Brillo esférico -->
                   <div class="absolute top-1 left-1.5 w-2 h-1.5 bg-white/60 rounded-full rotate-[-45deg] blur-[0.5px]"></div>
              </div>
            </div>
            
            <input type="checkbox" v-model="rules[key]" class="hidden" />
          </label>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const rules = defineModel<Record<string, boolean>>('rules', { required: true })

const rulesList = {
  stackDrawCards: { label: 'Acumular +2 y +4' },
  playMultipleSame: { label: 'Tirar dobles (Mismo número)' },
  zeroAndSevenRules: { label: 'Regla del 0 (Pasa) y 7 (Cambia)' },
  drawUntilPlayable: { label: 'Robar hasta que salga carta' },
  interceptExact: { label: 'Intercepción exacta (Corte)' }
}
</script>

<style scoped>
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: top;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.9);
}
</style>
