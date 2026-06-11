<template>
  <Transition name="slide-panel">
    <div class="w-full max-w-[800px] mx-auto relative z-10 -mt-2 px-4 sm:px-8">
      <div class="bg-[#8b5a2b] rounded-b-3xl border-4 border-t-0 border-[#5c3a21] p-6 pt-8 shadow-sm relative flex flex-col gap-6">
        
        <!-- Categorias Grid -->
        <StopCategoriesEditor v-model:rules="rules" />

        <div class="h-1 w-full bg-[#5c3a21] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>

        <!-- Letras Prohibidas -->
        <div class="flex flex-col items-center gap-4 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner relative z-10">
          <label class="text-[10px] font-black text-[#e5e7eb] tracking-[0.4em] uppercase flex items-center justify-between w-full">
            Letras Prohibidas
            <span class="text-red-400 text-sm drop-shadow-md">{{ rules.bannedLetters?.length || 0 }}</span>
          </label>
          <div class="flex flex-wrap justify-center gap-1.5 w-full">
            <button 
              v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')" 
              :key="letter"
              @click="toggleBannedLetter(letter)"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded border-2 font-black text-[10px] sm:text-xs flex items-center justify-center transition-all shadow-sm"
              :class="rules.bannedLetters?.includes(letter) 
                ? 'bg-[#991b1b] border-[#7f1d1d] text-white/50 shadow-inner' 
                : 'bg-[#b48554] border-[#d4a373] text-[#4a2e1b] hover:bg-[#c49564] hover:-translate-y-0.5'"
            >
              {{ letter }}
            </button>
          </div>
        </div>

        <div class="h-1 w-full bg-[#5c3a21] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>

        <!-- Rondas -->
        <div class="flex flex-col items-center gap-4 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner relative z-10">
          <label class="text-[10px] font-black text-[#e5e7eb] tracking-[0.4em] uppercase flex items-center justify-between w-full">
            Rondas de Juego
            <span class="text-[#f97316] text-xl drop-shadow-md">{{ rules.stopRounds }}</span>
          </label>
          <div class="flex items-center gap-4 w-full">
            <input 
              type="range" 
              v-model.number="rules.stopRounds" 
              min="1" 
              max="10" 
              class="w-full h-4 bg-[#2a1a0f] rounded-full outline-none appearance-none border-2 border-[#1a0f08] shadow-inner"
              style="--thumb-color: #f97316;"
            />
          </div>
        </div>

        <div class="h-1 w-full bg-[#5c3a21] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>

        <!-- Tiempo de Revisión -->
        <div class="flex flex-col items-center gap-4 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner relative z-10">
          <label class="text-[10px] font-black text-[#e5e7eb] tracking-[0.4em] uppercase flex items-center justify-between w-full">
            Tiempo de Revisión
            <span class="text-[#f97316] text-xl drop-shadow-md">{{ rules.verificationTime }}s</span>
          </label>
          <div class="flex items-center justify-center gap-2 sm:gap-4 w-full">
            <button 
              v-for="time in [15, 30, 45, 60]" 
              :key="time"
              @click="rules.verificationTime = time"
              class="flex-1 py-2 rounded-lg border-2 font-black text-xs sm:text-sm flex items-center justify-center transition-all shadow-sm"
              :class="rules.verificationTime === time 
                ? 'bg-[#991b1b] border-[#7f1d1d] text-white shadow-inner scale-105' 
                : 'bg-[#b48554] border-[#d4a373] text-[#4a2e1b] hover:bg-[#c49564] hover:-translate-y-0.5'"
            >
              {{ time }}s
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

const rules = defineModel<any>('rules', { required: true })

// Init default values if missing
if (!rules.value.stopCategories) {
  rules.value.stopCategories = ['NOMBRE', 'ANIMAL', 'COLOR', 'COSA', 'FRUTA']
}
if (!rules.value.stopRounds) {
  rules.value.stopRounds = 5
}
if (!rules.value.bannedLetters) {
  rules.value.bannedLetters = ['W', 'X', 'Y', 'Z']
}
if (!rules.value.verificationTime) {
  rules.value.verificationTime = 30
}

const toggleBannedLetter = (letter: string) => {
  const index = rules.value.bannedLetters.indexOf(letter)
  if (index === -1) {
    rules.value = { 
      ...rules.value, 
      bannedLetters: [...rules.value.bannedLetters, letter] 
    }
  } else {
    rules.value = { 
      ...rules.value, 
      bannedLetters: rules.value.bannedLetters.filter((_: any, i: number) => i !== index) 
    }
  }
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

input[type=range] {
  -webkit-appearance: none;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: var(--thumb-color, #f97316);
  cursor: pointer;
  border: 4px solid #fff;
  box-shadow: 0 0 5px rgba(0,0,0,0.8);
}
</style>
