<template>
  <Transition name="slide-panel">
    <div class="w-full max-w-[800px] mx-auto relative z-10 -mt-2 px-4 sm:px-8">
      <div class="bg-[#8b5a2b] rounded-b-3xl border-4 border-t-0 border-[#5c3a21] p-6 pt-8 shadow-sm relative flex flex-col gap-6">
        
        <!-- Categorias Grid -->
        <div class="flex flex-col gap-2">
          <h4 class="text-white/80 font-black text-[10px] tracking-[0.4em] uppercase text-center mb-1">
            Categorías <span class="text-[#f97316] ml-1">({{ rules.stopCategories.length }}/8)</span>
          </h4>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner">
            <div 
              v-for="(cat, idx) in rules.stopCategories" 
              :key="idx" 
              class="group bg-[#4a2e1b] border-2 border-[#3a2212] hover:border-red-500 hover:bg-[#5c3a21] text-white font-black uppercase tracking-wider text-[10px] sm:text-xs rounded-lg p-2 cursor-pointer transition-all flex items-center justify-between shadow-sm relative overflow-hidden"
              @click="removeCategory(Number(idx))"
            >
              <span class="truncate pr-4 z-10">{{ cat }}</span>
              <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2 z-0">
                 <svg class="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
            </div>
            
            <!-- Add new -->
            <div class="col-span-2 sm:col-span-4 flex gap-2 mt-2" v-if="rules.stopCategories.length < 8">
              <input 
                v-model="newCategory" 
                type="text"
                placeholder="Escribe una nueva..." 
                @keyup.enter="addCategory"
                class="flex-1 bg-[#2a1a0f] border-2 border-[#1a0f08] focus:border-[#d97706] rounded-lg px-4 py-2 text-white font-bold uppercase tracking-widest outline-none transition-all placeholder:text-[#5c3a21] text-xs shadow-inner"
              />
              <button 
                @click="addCategory" 
                :disabled="!newCategory.trim()"
                class="px-4 bg-[#109041] hover:bg-[#15b051] disabled:opacity-50 disabled:bg-[#109041] text-white border-b-4 border-[#0a5c28] disabled:border-[#0a5c28] rounded-lg font-black transition-all active:translate-y-1 active:border-b-0 disabled:active:translate-y-0 disabled:active:border-b-4"
              >
                <svg class="w-5 h-5 drop-shadow-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>

          <!-- Presets -->
          <div class="flex flex-wrap justify-center gap-2 mt-2">
              <button 
                v-for="preset in presetCategories" 
                :key="preset"
                @click="addPreset(preset)"
                :disabled="rules.stopCategories.includes(preset) || rules.stopCategories.length >= 8"
                class="px-3 py-1.5 bg-[#5c3a21] hover:bg-[#7d512a] disabled:bg-[#3a2212] border-2 border-[#3a2212] disabled:border-[#1a0f08] disabled:text-[#4a2e1b] rounded-lg text-[10px] font-black uppercase tracking-wider text-[#e5e7eb] transition-colors shadow-sm"
              >
                + {{ preset }}
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

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const rules = defineModel<any>('rules', { required: true })
const newCategory = ref('')

const presetCategories = ['NOMBRE', 'COLOR', 'ANIMAL', 'COSA', 'PAÍS', 'FRUTA', 'PROFESIÓN', 'MARCA']

// Init default values if missing
if (!rules.value.stopCategories) {
  rules.value.stopCategories = ['NOMBRE', 'ANIMAL', 'COLOR', 'COSA', 'FRUTA']
}
if (!rules.value.stopRounds) {
  rules.value.stopRounds = 5
}

const addCategory = () => {
  const cat = newCategory.value.trim().toUpperCase()
  if (cat && rules.value.stopCategories.length < 8 && !rules.value.stopCategories.includes(cat)) {
    rules.value.stopCategories.push(cat)
    newCategory.value = ''
  }
}

const addPreset = (cat: string) => {
  const upperCat = cat.toUpperCase()
  if (rules.value.stopCategories.length < 8 && !rules.value.stopCategories.includes(upperCat)) {
    rules.value.stopCategories.push(upperCat)
  }
}

const removeCategory = (idx: number) => {
  rules.value.stopCategories.splice(idx, 1)
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
