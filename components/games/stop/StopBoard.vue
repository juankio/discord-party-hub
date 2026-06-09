<template>
  <div class="min-h-screen bg-slate-900 flex flex-col p-4 text-white relative overflow-hidden">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8 relative z-10">
      <div class="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-lg backdrop-blur-sm">
        <div class="text-slate-400 font-semibold uppercase tracking-wider text-sm">Ronda</div>
        <div class="text-3xl font-black text-primary-400">{{ currentRound }}/{{ totalRounds }}</div>
      </div>
      
      <!-- Roulette Letter -->
      <div class="relative flex flex-col items-center">
        <div class="text-slate-400 font-semibold uppercase tracking-wider text-sm mb-2">Letra</div>
        <div class="w-24 h-24 bg-slate-800 rounded-xl border-2 border-primary-500 shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center justify-center overflow-hidden">
          <div ref="letterReel" class="text-5xl font-black text-white" :class="{ 'blur-[2px] text-primary-300': isRolling }">
            {{ displayLetter }}
          </div>
        </div>
      </div>

      <div class="w-32"></div> <!-- Spacer for balance -->
    </div>

    <!-- Inputs Grid -->
    <div class="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 flex-1">
      <div 
        v-for="(cat, idx) in categories" 
        :key="idx"
        class="bg-slate-800/50 p-4 rounded-xl border border-slate-700 transition-all duration-300 focus-within:border-primary-500 focus-within:bg-slate-800 focus-within:shadow-[0_0_10px_rgba(56,189,248,0.2)]"
      >
        <label class="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">{{ cat }}</label>
        <UInput 
          v-model="answers[cat]" 
          :disabled="isRolling || isFinished"
          variant="none"
          size="xl"
          class="bg-slate-900/50 rounded-lg text-xl"
          placeholder="..."
          @update:model-value="checkCompletion"
        />
      </div>
    </div>

    <!-- STOP Button -->
    <div class="mt-8 flex justify-center relative z-10 pb-8">
      <button 
        ref="stopBtn"
        @click="callStop"
        :disabled="!canStop || isRolling || isFinished"
        class="group relative overflow-hidden rounded-full font-black text-4xl px-16 py-6 transition-all duration-500"
        :class="canStop && !isFinished ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-700'"
      >
        <span class="relative z-10 drop-shadow-md">¡BASTA PARA MÍ!</span>
        <div v-if="canStop && !isFinished" class="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
      </button>
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
      scale: [1, 1.05],
      boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 30px rgba(239,68,68,0.8)'],
      duration: 800,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    })
  } else if (!canStop.value && stopBtn.value) {
    anime.remove(stopBtn.value)
    anime({
      targets: stopBtn.value,
      scale: 1,
      boxShadow: '0 0 0px rgba(239,68,68,0)',
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
            scale: [0.5, 1.2, 1],
            color: ['#ffffff', '#38bdf8', '#ffffff'],
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
