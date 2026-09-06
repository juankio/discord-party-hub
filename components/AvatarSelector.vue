<template>
  <div class="flex flex-col items-center gap-4">
    <h2 class="text-xl font-semibold text-gray-200">1. Elige tu Avatar</h2>
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-4 p-4 bg-[#2b2d31] rounded-2xl border border-gray-700 shadow-xl">
      <div 
        v-for="i in 6" :key="i"
        class="avatar-item cursor-pointer transition-all duration-300 transform relative"
        :class="{ 'scale-110 neon-glow z-10': modelValue === i, 'opacity-50 hover:opacity-100 hover:scale-105': modelValue !== i }"
        @click="selectAvatar(i)"
      >
        <img :src="`/avatars/avatar-${i}.svg`" class="w-16 h-16 rounded-xl" :alt="`Avatar ${i}`" >
        <div v-if="modelValue === i" class="absolute -bottom-2 -right-2 bg-[#5865F2] rounded-full p-1 border-2 border-[#1e1f22]">
          <UIcon name="i-lucide-check" class="text-white w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const selectAvatar = (id: number) => {
  emit('update:modelValue', id)
  anime({
    targets: '.avatar-item',
    scale: (el: Element, i: number) => i === (id - 1) ? 1.1 : 1,
    duration: 300,
    easing: 'easeOutElastic(1, .8)'
  })
}

onMounted(() => {
  anime({
    targets: '.avatar-item',
    translateY: [20, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    duration: 800,
    easing: 'easeOutExpo'
  })
})
</script>
