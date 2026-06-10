<template>
  <div v-if="isVisible" class="flex flex-col gap-6 w-full max-w-sm mx-auto mt-10 room-actions">
    <UButton 
      size="xl" 
      color="primary" 
      block 
      class="h-16 text-xl font-bold shadow-lg shadow-[#5865F2]/40 hover:shadow-[#5865F2]/60 transition-shadow create-btn"
      @click="createRoom"
    >
      <UIcon name="i-lucide-plus" class="w-6 h-6 mr-2" />
      Crear Sala Nueva
    </UButton>

    <div class="flex items-center gap-4">
      <div class="h-px bg-gray-700 flex-1"/>
      <span class="text-gray-400 text-sm font-medium">O</span>
      <div class="h-px bg-gray-700 flex-1"/>
    </div>

    <div class="flex gap-2">
      <UInput 
        v-model="roomCode" 
        size="lg" 
        placeholder="Código (ej. XJ9KL)" 
        class="flex-1 bg-[#2b2d31]"
        :ui="{ base: 'uppercase text-center font-mono tracking-widest' }"
        @keyup.enter="joinRoom"
      />
      <UButton 
        size="lg" 
        color="gray" 
        variant="solid" 
        class="font-semibold"
        :disabled="roomCode.length < 3"
        @click="joinRoom"
      >
        Entrar
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import anime from 'animejs'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create', 'join'])
const roomCode = ref('')

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      anime({
        targets: '.room-actions',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: 'easeOutExpo'
      })
    }, 100)
  }
})

const createRoom = () => emit('create')
const joinRoom = () => {
  if (roomCode.value) emit('join', roomCode.value.toUpperCase())
}
</script>
