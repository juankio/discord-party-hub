<template>
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
</template>

<script setup lang="ts">
import anime from 'animejs'

const props = defineProps<{
  letter: string
}>()

const emit = defineEmits(['rolling'])

const isRolling = ref(true)
const displayLetter = ref('?')
const letterReel = ref(null)

const rollLetter = () => {
  isRolling.value = true
  emit('rolling', true)
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
      emit('rolling', false)
      
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
    rollLetter()
  }
})

onMounted(() => {
  if (props.letter) {
    rollLetter()
  }
})
</script>
