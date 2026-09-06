<template>
  <div class="h-full w-full flex-1 p-4 sm:p-8 flex flex-col text-white relative z-10 overflow-hidden" style="color: var(--theme-text-color, white);">
    
    <div class="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-6">
      
      <!-- Top Hud (Centrado simétrico con grid) -->
      <div class="grid grid-cols-3 items-center relative z-20 gap-2 sm:gap-4 w-full">
        
        <!-- Scoreboard/Round tag -->
        <div class="justify-self-start bg-[#3a2212] p-3 sm:p-5 rounded-2xl border-2 sm:border-4 border-[#2a180c] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center gap-2 sm:gap-4 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px);"/>
          <div class="relative z-10 flex flex-col">
            <span class="text-[#cdab84] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] mb-0.5 sm:mb-1">Ronda</span>
            <span class="text-2xl sm:text-3xl font-black text-white drop-shadow-md leading-none">{{ currentRound }}<span class="text-lg sm:text-xl text-[#7d512a]">/{{ totalRounds }}</span></span>
          </div>
        </div>
        
        <!-- Ruleta Madera (Component) - Centro limpio -->
        <div class="justify-self-center flex justify-center">
          <StopLetterReel :letter="letter" @rolling="(val) => isRolling = val" />
        </div>

        <!-- Filler simétrico -->
        <div class="justify-self-end w-8 sm:w-16"/>
      </div>

      <!-- Cuaderno Grid -->
      <div class="bg-[#e2d5c5] p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-[#c9b29a] shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex-1 relative overflow-hidden flex flex-col min-h-0">
        <!-- Espiral superior del cuaderno -->
        <div class="absolute top-0 left-0 right-0 h-3 sm:h-4 bg-black/10 flex justify-around">
            <div v-for="i in 15" :key="i" class="w-3 sm:w-4 h-6 sm:h-8 bg-gray-400 rounded-full border-2 border-gray-600 shadow-sm -mt-2"/>
        </div>
        
        <!-- Alerta Pánico (Basta) -->
        <div v-if="panicMode" class="absolute inset-0 bg-red-600/20 z-0 pointer-events-none animate-pulse"/>
        <div v-if="panicMode" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none rotate-12 opacity-30">
          <span class="text-6xl sm:text-8xl md:text-9xl font-black text-red-600 border-4 sm:border-8 border-red-600 px-4 rounded-xl drop-shadow-lg">¡TIEMPO!</span>
        </div>

        <!-- Contenedor scrolleable de categorías -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar-notebook pr-2 mt-4 sm:mt-6 relative z-10">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            <div 
              v-for="(cat, idx) in categories" 
              :key="idx"
              class="group flex flex-col gap-1 border-b-2 sm:border-b-4 border-blue-300/40 relative"
            >
              <!-- Lineas de cuaderno -->
              <div class="absolute bottom-0 w-full h-px bg-blue-300/60"/>
              
              <label class="text-[#8c6b5d] font-black uppercase tracking-widest text-xs sm:text-sm pl-2">{{ cat }}</label>
              <input 
                v-model="answers[cat]" 
                :disabled="isRolling || isFinished || panicMode || localFinished"
                type="text"
                class="w-full bg-transparent border-none outline-none text-[#2d201a] font-bold text-lg sm:text-2xl px-2 py-1 placeholder:text-[#bca495] placeholder:italic disabled:opacity-50 uppercase"
                placeholder="..."
                autocomplete="off"
                spellcheck="false"
                @input="checkCompletion"
              >
            </div>
          </div>
        </div>
        
        <!-- Marca de agua Stop -->
        <div class="absolute bottom-4 right-4 opacity-5 rotate-[-15deg] pointer-events-none">
           <span class="text-6xl sm:text-8xl font-black text-red-600 border-4 sm:border-8 border-red-600 px-4 rounded-xl">STOP</span>
        </div>
      </div>

      <!-- STOP Button (Accesible con altura mínima garantizada) -->
      <div class="mt-2 sm:mt-4 flex justify-center pb-4 sm:pb-8 relative z-20 shrink-0">
        <button 
          ref="stopBtn"
          :disabled="!canStop || isRolling || isFinished || panicMode || localFinished"
          class="relative min-h-[56px] sm:min-h-[76px] w-full sm:w-[400px] h-auto py-3 sm:py-4 px-4 rounded-2xl sm:rounded-3xl text-xl sm:text-3xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-150 flex items-center justify-center border-t-4 border-white/20 disabled:border-t-0 active:scale-95"
          :class="canStop && !isFinished && !panicMode && !localFinished ? 'bg-gradient-to-b from-[#ef4444] to-[#b91c1c] text-white hover:from-[#f87171] hover:to-[#dc2626] shadow-[0_6px_0_#7f1d1d,0_15px_20px_rgba(220,38,38,0.5)] active:translate-y-[6px] active:shadow-[0_0px_0_#7f1d1d,0_5px_10px_rgba(220,38,38,0.4)] cursor-pointer ring-4 ring-red-400/50' : 'bg-[#3a2212] text-[#cdab84] shadow-[0_6px_0_#2a180c,0_15px_20px_rgba(0,0,0,0.5)] cursor-not-allowed opacity-80'"
          @click.prevent="callStop"
        >
          <span class="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center">{{ panicMode ? 'RECOLECTANDO...' : (localFinished ? '¡ESPERANDO!' : '¡Basta para Mí!') }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const props = defineProps<{
  categories: string[]
  currentRound: number
  totalRounds: number
  letter: string
  isFinished: boolean
  panicMode: boolean
}>()

const emit = defineEmits(['stop_call', 'update_answers'])

const answers = ref<Record<string, string>>({})
const isRolling = ref(true)
const localFinished = ref(false)
const stopBtn = ref(null)

// Initialize answers
props.categories.forEach(c => answers.value[c] = '')

const canStop = computed(() => {
  return props.categories.every(cat => (answers.value[cat] || '').trim().length > 0)
})

const checkCompletion = () => {
  emit('update_answers', answers.value)
  if (canStop.value && stopBtn.value && !props.isFinished && !props.panicMode && !localFinished.value) {
    anime.remove(stopBtn.value)
    anime({
      targets: stopBtn.value,
      scale: [1, 1.02],
      duration: 600,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    })
  } else if (!canStop.value && stopBtn.value) {
    anime.remove(stopBtn.value)
    anime({
      targets: stopBtn.value,
      scale: 1,
      duration: 300,
      easing: 'easeOutQuad'
    })
  }
}

const callStop = () => {
  if (canStop.value && !props.isFinished && !props.panicMode && !localFinished.value) {
    localFinished.value = true
    if (stopBtn.value) {
      anime.remove(stopBtn.value)
      anime({
        targets: stopBtn.value,
        scale: 0.95,
        duration: 100,
        easing: 'easeOutQuad',
        direction: 'alternate'
      })
    }
    emit('stop_call', answers.value)
  }
}

watch(() => props.letter, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    // Clear answers
    Object.keys(answers.value).forEach(k => answers.value[k] = '')
  }
})

onUnmounted(() => {
  if (stopBtn.value) {
    anime.remove(stopBtn.value)
  }
})
</script>
