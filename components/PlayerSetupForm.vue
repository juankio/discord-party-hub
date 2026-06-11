<template>
  <div class="flex flex-col items-center gap-4 w-full max-w-sm mx-auto mt-8 setup-form">
    <h2 class="text-xl font-semibold text-gray-200">2. ¿Cómo te llamas?</h2>
    <UInput 
      v-model="internalName"
      size="xl"
      color="primary"
      variant="outline"
      placeholder="Tu apodo"
      class="w-full text-center text-xl font-bold bg-[#2b2d31] rounded-xl"
      :ui="{ base: 'text-center' }"
    />
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
const internalName = ref(props.modelValue)

watch(internalName, (newVal) => {
  emit('update:modelValue', newVal)
})

watch(() => props.modelValue, (newVal) => {
  internalName.value = newVal
})

onMounted(() => {
  anime({
    targets: '.setup-form',
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: 400,
    easing: 'easeOutExpo'
  })
})
</script>
