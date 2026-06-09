<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 relative z-10 w-full" style="color: var(--theme-text-color, white);">

    <!-- Contenedor Principal Flat 2D -->
    <div class="w-full max-w-[800px] mx-auto bg-[#4a2e1b] rounded-3xl border-8 border-[#7d512a] shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative z-20">
      
      <!-- Fondo textura sutil -->
      <div class="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px);"></div>

      <!-- Header -->
      <div class="bg-[#3a2212] p-6 border-b-4 border-[#2a180c] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 shadow-lg">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-yellow-400 border-4 border-red-600 rounded-lg shadow-md flex items-center justify-center rotate-3 transform">
             <span class="text-red-600 font-black text-xs tracking-tighter -rotate-12 bg-yellow-400 px-1 border-2 border-red-600 rounded">STOP</span>
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Tutti Frutti</h2>
            <p class="text-[#cdab84] font-bold uppercase tracking-widest text-[10px] mt-1 drop-shadow-md">Configuración de la Partida</p>
          </div>
        </div>
        <div class="px-4 py-2 bg-[#1a0f08] border-2 border-[#5c3a21] rounded-xl font-black tracking-widest text-xs text-[#cdab84] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]">
          <span class="text-white">{{ players.length }}</span> / 8 Jugadores
        </div>
      </div>

      <!-- Config Body (Host) -->
      <div class="p-6 sm:p-8 flex-1 flex flex-col gap-8 bg-[#8b5a2b] relative z-10" v-if="isHost">
        
        <h4 class="text-white/80 font-black text-[10px] tracking-[0.4em] uppercase text-center mb-[-10px]">
          Categorías <span class="text-[#f97316] ml-1">({{ categories.length }}/8)</span>
        </h4>
        
        <!-- Categorias Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner">
          <div 
            v-for="(cat, idx) in categories" 
            :key="idx" 
            class="group bg-[#4a2e1b] border-2 border-[#3a2212] hover:border-red-500 hover:bg-[#5c3a21] text-white font-black uppercase tracking-wider text-[10px] sm:text-xs rounded-lg p-2 cursor-pointer transition-all flex items-center justify-between shadow-sm relative overflow-hidden"
            @click="removeCategory(idx)"
          >
            <span class="truncate pr-4 z-10">{{ cat }}</span>
            <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2 z-0">
               <svg class="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          </div>
          
          <!-- Add new -->
          <div class="col-span-2 sm:col-span-4 flex gap-2 mt-2" v-if="categories.length < 8">
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
        <div class="flex flex-wrap justify-center gap-2">
            <button 
              v-for="preset in presetCategories" 
              :key="preset"
              @click="addPreset(preset)"
              :disabled="categories.includes(preset) || categories.length >= 8"
              class="px-3 py-1.5 bg-[#5c3a21] hover:bg-[#7d512a] disabled:bg-[#3a2212] border-2 border-[#3a2212] disabled:border-[#1a0f08] disabled:text-[#4a2e1b] rounded-lg text-[10px] font-black uppercase tracking-wider text-[#e5e7eb] transition-colors shadow-sm"
            >
              + {{ preset }}
            </button>
        </div>

        <div class="h-1 w-full bg-[#5c3a21] rounded-full my-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>

        <!-- Rondas -->
        <div class="flex flex-col items-center gap-4 bg-[#6d4621] p-4 rounded-xl border-4 border-[#5c3a21] shadow-inner">
          <label class="text-[10px] font-black text-[#e5e7eb] tracking-[0.4em] uppercase flex items-center justify-between w-full">
            Rondas de Juego
            <span class="text-[#f97316] text-xl drop-shadow-md">{{ rounds }}</span>
          </label>
          <div class="flex items-center gap-4 w-full">
            <input 
              type="range" 
              v-model.number="rounds" 
              min="1" 
              max="10" 
              class="w-full h-4 bg-[#2a1a0f] rounded-full outline-none appearance-none border-2 border-[#1a0f08] shadow-inner"
              style="--thumb-color: #f97316;"
            />
          </div>
        </div>

      </div>

      <!-- Waiting State (Guest) -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 py-20 text-center gap-6 bg-[#8b5a2b] relative z-10">
        
        <!-- Loading spinner customizado madera -->
        <div class="relative w-24 h-24 bg-[#5c3a21] rounded-full border-8 border-[#3a2212] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
            <div class="absolute w-full h-full border-8 border-transparent border-t-[#f97316] rounded-full animate-spin"></div>
            <div class="w-8 h-8 bg-[#2a1a0f] rounded-full shadow-inner"></div>
        </div>

        <div class="flex flex-col gap-2">
          <h3 class="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Esperando al Host</h3>
          <p class="text-[#cdab84] uppercase tracking-[0.2em] text-xs font-bold drop-shadow-md">El capitán está configurando las reglas</p>
        </div>
      </div>

      <!-- Footer (Host) -->
      <div class="bg-[#3a2212] p-6 border-t-4 border-[#2a180c] flex justify-center sm:justify-end gap-4 relative z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]" v-if="isHost">
        <button 
          class="px-6 py-3 bg-[#4a2e1b] hover:bg-[#5c3a21] text-[#cdab84] hover:text-white font-black tracking-widest uppercase rounded-xl border-2 border-[#2a180c] transition-colors text-sm shadow-sm"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
        <button 
          class="px-8 py-3 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:bg-[#f97316] text-white font-black tracking-[0.2em] uppercase rounded-xl border-b-4 border-[#c2410c] disabled:border-[#c2410c] shadow-[0_5px_15px_rgba(0,0,0,0.4)] transition-all active:translate-y-1 active:border-b-0 disabled:active:translate-y-0 disabled:active:border-b-4 text-sm"
          @click="startGame" 
          :disabled="categories.length < 3"
        >
          ¡A Jugar!
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isHost: boolean
  players: any[]
  initialCategories: string[]
  initialRounds: number
}>()

const emit = defineEmits(['start', 'update_config', 'cancel'])

const categories = ref<string[]>([...props.initialCategories])
const rounds = ref(props.initialRounds || 5)
const newCategory = ref('')

const presetCategories = ['Nombre', 'Color', 'Animal', 'Cosa', 'País', 'Fruta', 'Profesión', 'Marca']

const addCategory = () => {
  const cat = newCategory.value.trim().toUpperCase()
  if (cat && categories.value.length < 8 && !categories.value.includes(cat)) {
    categories.value.push(cat)
    newCategory.value = ''
    emitConfig()
  }
}

const addPreset = (cat: string) => {
  const upperCat = cat.toUpperCase()
  if (categories.value.length < 8 && !categories.value.includes(upperCat)) {
    categories.value.push(upperCat)
    emitConfig()
  }
}

const removeCategory = (idx: number) => {
  categories.value.splice(idx, 1)
  emitConfig()
}

const emitConfig = () => {
  emit('update_config', {
    categories: categories.value,
    rounds: rounds.value
  })
}

watch(rounds, () => {
  emitConfig()
})

const startGame = () => {
  emit('start', {
    categories: categories.value,
    rounds: rounds.value
  })
}
</script>

<style scoped>
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
