<template>
  <div class="min-h-screen p-4 sm:p-8 flex flex-col text-white relative z-10" style="color: var(--theme-text-color, white);">
    
    <div class="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-6">
      
      <!-- Top Hud -->
      <div class="flex justify-between items-start sm:items-center relative z-20 gap-4">
        
        <!-- Scoreboard/Round tag -->
        <div class="bg-[#3a2212] p-4 sm:p-5 rounded-2xl border-4 border-[#2a180c] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center gap-4 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px);"></div>
          <div class="relative z-10 flex flex-col">
            <span class="text-[#cdab84] font-black uppercase tracking-[0.3em] text-[10px] mb-1">Ronda</span>
            <span class="text-3xl font-black text-white drop-shadow-md leading-none">{{ currentRound }}<span class="text-xl text-[#7d512a]">/{{ totalRounds }}</span></span>
          </div>
        </div>
        
        <!-- Ruleta Madera -->
        <div class="relative flex flex-col items-center group">
          <div class="absolute -top-6 text-[#cdab84] font-black uppercase tracking-[0.4em] text-[10px]">Letra</div>
          <div class="w-24 h-24 sm:w-28 sm:h-28 bg-[#4a2e1b] rounded-2xl border-8 border-[#2a180c] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden relative">
            <div class="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px);"></div>
            <div class="absolute inset-2 bg-[#1a0f08] rounded-xl shadow-inner border-2 border-[#150a05]"></div>
            
            <div ref="letterReel" class="text-5xl sm:text-6xl font-black text-[#f97316] relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" :class="{ 'blur-[1px] opacity-70 scale-90': isRolling }">
              {{ displayLetter }}
            </div>
            
            <!-- Shaders/Highlights -->
            <div class="absolute top-1 left-2 right-2 h-3 bg-white/10 rounded-full blur-[2px] z-20 pointer-events-none"></div>
          </div>
        </div>

        <!-- Filler -->
        <div class="w-24 sm:w-32"></div>
      </div>

      <!-- Cuaderno Grid -->
      <div class="bg-[#e2d5c5] p-6 sm:p-8 rounded-3xl border-8 border-[#c9b29a] shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex-1 relative overflow-hidden flex flex-col">
        <!-- Espiral superior del cuaderno -->
        <div class="absolute top-0 left-0 right-0 h-4 bg-black/10 flex justify-around">
            <div v-for="i in 15" :key="i" class="w-4 h-8 bg-gray-400 rounded-full border-2 border-gray-600 shadow-sm -mt-2"></div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-6 relative z-10">
          <div 
            v-for="(cat, idx) in categories" 
            :key="idx"
            class="group flex flex-col gap-1 border-b-4 border-blue-300/40 relative"
          >
            <!-- Lineas de cuaderno -->
            <div class="absolute bottom-0 w-full h-px bg-blue-300/60"></div>
            
            <label class="text-[#8c6b5d] font-black uppercase tracking-widest text-xs sm:text-sm pl-2">{{ cat }}</label>
            <input 
              v-model="answers[cat]" 
              :disabled="isRolling || isFinished"
              type="text"
              class="w-full bg-transparent border-none outline-none text-[#2d201a] font-bold text-xl sm:text-2xl px-2 py-1 placeholder:text-[#bca495] placeholder:italic disabled:opacity-50 uppercase"
              placeholder="..."
              @input="checkCompletion"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
        </div>
        
        <!-- Marca de agua Stop -->
        <div class="absolute bottom-4 right-4 opacity-5 rotate-[-15deg] pointer-events-none">
           <span class="text-8xl font-black text-red-600 border-8 border-red-600 px-4 rounded-xl">STOP</span>
        </div>
      </div>

      <!-- STOP Button -->
      <div class="mt-4 flex justify-center pb-8 relative z-20">
        <button 
          ref="stopBtn"
          @click="callStop"
          :disabled="!canStop || isRolling || isFinished"
          class="relative w-full sm:w-[400px] h-[80px] rounded-3xl text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] transition-all duration-100 flex items-center justify-center border-t-4 border-white/20 disabled:border-t-0"
          :class="canStop && !isFinished ? 'bg-[#dc2626] text-white hover:bg-[#b91c1c] shadow-[0_8px_0_#7f1d1d,0_15px_20px_rgba(0,0,0,0.5)] cursor-pointer' : 'bg-[#3a2212] text-[#cdab84] shadow-[0_8px_0_#2a180c,0_15px_20px_rgba(0,0,0,0.5)] cursor-not-allowed opacity-80'"
          style="transform: translateY(0);"
          onmousedown="if(!this.disabled) { this.style.transform='translateY(8px)'; this.style.boxShadow='0 0px 0 #7f1d1d, 0 5px 10px rgba(0,0,0,0.4)'; }"
          onmouseup="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #7f1d1d, 0 15px 20px rgba(0,0,0,0.5)'; }"
          onmouseleave="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #7f1d1d, 0 15px 20px rgba(0,0,0,0.5)'; }"
        >
          <span class="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">¡Basta para Mí!</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import anime from 'animejs'

const props = defineProps<{
  categories: string[]
  currentRound: number
  totalRounds: number
  letter: string
  isFinished: boolean
}>()

const emit = defineEmits(['stop_call', 'update_answers'])

const answers = ref<Record<string, string>>({})
const isRolling = ref(true)
const displayLetter = ref('?')
const letterReel = ref(null)
const stopBtn = ref(null)

// Initialize answers
props.categories.forEach(c => answers.value[c] = '')

const canStop = computed(() => {
  return props.categories.every(cat => (answers.value[cat] || '').trim().length > 0)
})

const checkCompletion = () => {
  emit('update_answers', answers.value)
  if (canStop.value && stopBtn.value && !props.isFinished) {
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
  if (canStop.value && !props.isFinished) {
    emit('stop_call', answers.value)
  }
}

const rollLetter = () => {
  isRolling.value = true
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let dummyLoops = 20
  let currentLoop = 0
  
  const tick = () => {
    displayLetter.value = alphabet[Math.floor(Math.random() * alphabet.length)] || 'A'
    currentLoop++
    if (currentLoop < dummyLoops) {
      setTimeout(tick, 50 + (currentLoop * 5))
    } else {
      displayLetter.value = props.letter ?? 'A'
      isRolling.value = false
      
      // Pop animation for letter
      nextTick(() => {
        if (letterReel.value) {
          anime({
            targets: letterReel.value,
            scale: [0.5, 1.3, 1],
            color: ['#ffffff', '#f97316', '#f97316'],
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
          })
        }
      })
    }
  }
  
  tick()
}

watch(() => props.letter, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    // Clear answers
    Object.keys(answers.value).forEach(k => answers.value[k] = '')
    rollLetter()
  }
})

onMounted(() => {
  if (props.letter) {
    rollLetter()
  }
})
</script>
