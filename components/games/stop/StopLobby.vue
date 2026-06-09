<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-white p-4 relative overflow-hidden bg-[#0A0A0A]">
    <!-- Animated SVG Grid Background -->
    <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(#f97316 1px, transparent 1px); background-size: 30px 30px;"></div>

    <div class="relative z-10 w-full max-w-3xl bg-[#151515] border border-orange-500/30 rounded-[40px] shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-600/20 to-transparent p-6 sm:p-8 border-b border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <svg class="w-8 h-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <h2 class="text-3xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Tutti Frutti</h2>
            <p class="text-orange-400 font-bold uppercase tracking-widest text-xs mt-1">Configuración de la Partida</p>
          </div>
        </div>
        <div class="px-4 py-2 bg-black/50 border border-white/10 rounded-full font-black tracking-widest text-sm text-gray-300">
          <span class="text-orange-500">{{ players.length }}</span> / 8 Jugadores
        </div>
      </div>

      <!-- Config Body (Host) -->
      <div class="p-6 sm:p-8 flex-1 flex flex-col gap-8" v-if="isHost">
        
        <!-- Categorias -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <label class="text-sm font-black text-gray-400 tracking-widest uppercase">Categorías <span class="text-orange-500 ml-1">({{ categories.length }}/8)</span></label>
            <span class="text-xs font-bold text-red-400 uppercase tracking-widest" v-if="categories.length < 3">Mínimo 3</span>
          </div>
          
          <div class="flex flex-wrap gap-3 p-4 bg-black/30 rounded-2xl border border-white/5 min-h-[80px]">
            <div 
              v-for="(cat, idx) in categories" 
              :key="idx" 
              class="group px-4 py-2 bg-[#1A1A1A] border border-orange-500/50 hover:border-red-500 hover:bg-red-500/10 text-white font-bold uppercase tracking-wider text-sm rounded-xl cursor-pointer transition-all flex items-center gap-2"
              @click="removeCategory(idx)"
            >
              {{ cat }}
              <svg class="w-4 h-4 text-red-500 opacity-50 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            
            <span v-if="categories.length === 0" class="text-gray-500 font-bold uppercase tracking-widest text-sm self-center mx-auto">Sin categorías</span>
          </div>

          <div class="flex gap-3" v-if="categories.length < 8">
            <input 
              v-model="newCategory" 
              type="text"
              placeholder="Escribe una categoría..." 
              @keyup.enter="addCategory"
              class="flex-1 bg-black/50 border border-white/10 focus:border-orange-500 rounded-2xl px-5 py-3 text-white font-bold uppercase tracking-widest outline-none transition-all placeholder:text-gray-600"
            />
            <button 
              @click="addCategory" 
              :disabled="!newCategory.trim()"
              class="px-6 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 disabled:scale-100"
            >
              <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <div class="flex flex-wrap gap-2 mt-2">
            <button 
              v-for="preset in presetCategories" 
              :key="preset"
              @click="addPreset(preset)"
              :disabled="categories.includes(preset) || categories.length >= 8"
              class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 transition-all"
            >
              + {{ preset }}
            </button>
          </div>
        </div>

        <div class="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <!-- Rondas -->
        <div class="flex flex-col gap-4">
          <label class="text-sm font-black text-gray-400 tracking-widest uppercase flex items-center justify-between">
            Rondas de Juego
            <span class="text-orange-500 text-xl">{{ rounds }}</span>
          </label>
          <div class="flex items-center gap-4">
            <input 
              type="range" 
              v-model.number="rounds" 
              min="1" 
              max="10" 
              class="w-full accent-orange-500 bg-black/50 h-2 rounded-full appearance-none outline-none"
            />
          </div>
        </div>

      </div>

      <!-- Waiting State (Guest) -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 py-20 text-center gap-6">
        <div class="relative">
          <svg class="w-20 h-20 text-orange-500 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-10 h-10 bg-orange-500/20 rounded-full blur-md"></div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h3 class="text-3xl font-black text-white tracking-widest uppercase drop-shadow-md">Esperando al Host</h3>
          <p class="text-gray-400 uppercase tracking-widest text-sm font-bold">El capitán está configurando las reglas</p>
        </div>
      </div>

      <!-- Footer (Host) -->
      <div class="bg-black/40 p-6 border-t border-white/5 flex justify-between sm:justify-end gap-4" v-if="isHost">
        <button 
          class="px-8 py-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-black tracking-widest uppercase rounded-full transition-all"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
        <button 
          class="px-10 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white font-black tracking-widest uppercase rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:shadow-none"
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

const presetCategories = ['Nombre', 'Color', 'Animal', 'Cosa', 'País/Ciudad', 'Fruta/Verdura', 'Profesión', 'Marca', 'Película/Serie', 'Deporte']

const addCategory = () => {
  const cat = newCategory.value.trim()
  if (cat && categories.value.length < 8 && !categories.value.includes(cat)) {
    categories.value.push(cat)
    newCategory.value = ''
    emitConfig()
  }
}

const addPreset = (cat: string) => {
  if (categories.value.length < 8 && !categories.value.includes(cat)) {
    categories.value.push(cat)
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
  background: #f97316;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.6);
}
</style>
