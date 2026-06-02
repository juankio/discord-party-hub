<template>
  <Transition name="slide-panel">
    <div class="w-full max-w-[800px] mx-auto relative z-10 -mt-2 px-8">
      <div class="bg-[#8b5a2b] rounded-b-3xl border-4 border-t-0 border-[#5c3a21] p-6 pt-8 shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative">
        <h4 class="text-white/80 font-black text-[10px] tracking-[0.4em] uppercase mb-5 text-center drop-shadow-sm">
          Reglas de la Mesa
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          <label
v-for="(rule, key) in rulesList" :key="key" 
                 class="group flex items-center justify-between bg-black/20 hover:bg-black/30 p-3 rounded-xl cursor-pointer transition-colors border border-black/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]"
                 :class="{'md:col-span-2': key === 'interceptExact'}">
            <span class="text-[#f2f3f5] font-bold text-xs tracking-wide">{{ rule.label }}</span>
            <div
class="w-12 h-6 rounded-full border-2 border-black/40 relative transition-colors duration-200"
                 :style="rules[key] ? { backgroundColor: 'var(--theme-color)' } : { backgroundColor: '#3a2212' }">
              <div
class="absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full shadow-[0_2px_2px_rgba(0,0,0,0.4)] transition-transform duration-300"
                   :class="rules[key] ? 'right-0.5' : 'left-0.5'"/>
            </div>
            <input v-model="rules[key]" type="checkbox" class="hidden" >
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
