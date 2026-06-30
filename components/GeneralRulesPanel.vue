<template>
  <Transition name="slide-panel">
    <div class="w-full max-w-[800px] mx-auto relative z-10 -mt-2 px-4 sm:px-8">
      <div class="bg-[#1e1e1e] rounded-b-3xl border-4 border-t-0 border-[#333] p-6 pt-8 shadow-sm relative">
        <h4 class="text-white/80 font-black text-[10px] tracking-[0.4em] uppercase mb-5 text-center">
          Ajustes Generales de Sala
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 relative z-10">
          <label
            v-for="(rule, key) in rulesList" :key="key" 
            class="group flex items-center justify-between gap-2 sm:gap-0 bg-[#2a2a2a] hover:bg-[#333] p-3 sm:p-4 rounded-xl cursor-pointer transition-colors border-2 border-[#111] border-b-[6px] shadow-sm"
            :class="{'md:col-span-2': rule.fullWidth}">
            <span class="text-[#f2f3f5] font-black text-xs tracking-wide">{{ rule.label }}</span>
            
            <div
              class="w-14 h-8 rounded-full border-4 border-[#111] transition-colors relative flex items-center"
              :class="rules[key] ? 'bg-[#109041]' : 'bg-[#151515]'">
              <div
                class="absolute w-6 h-6 bg-white rounded-full border-4 border-[#111] transition-all"
                :class="rules[key] ? 'right-0' : 'left-0'"/>
            </div>
            
            <input v-model="rules[key]" type="checkbox" :disabled="!isHost" class="hidden" >
          </label>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const rules = defineModel<any>('rules', { required: true })

defineProps({
  isHost: { type: Boolean, default: false }
});

const rulesList = {
  extendedLobby: { label: 'Lobby Extendido (hasta 8 jugadores)', fullWidth: true },
  autoNicknames: { label: 'Generar apodos (novios hp, copión, etc.)', fullWidth: true }
}

// Inicializar nueva regla
if (rules.value.autoNicknames === undefined) {
  rules.value.autoNicknames = true;
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
