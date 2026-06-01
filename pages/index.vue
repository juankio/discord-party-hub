<template>
  <div class="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 overflow-hidden relative">
    
    <!-- Header Decorativo -->
    <div class="absolute top-12 text-center header-anim opacity-0 -translate-y-5">
      <h1 class="text-4xl md:text-5xl font-black text-white pb-1 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        PARTY HUB
      </h1>
      <p class="text-gray-500 text-sm font-medium tracking-widest uppercase mt-1">Juega con fricción cero</p>
    </div>

    <!-- Contenedor Principal (Tarjeta) -->
    <div class="w-full max-w-[380px] bg-[#151515] p-6 rounded-3xl shadow-2xl relative z-10 mt-16 main-container opacity-0 scale-95 flex flex-col items-center gap-6 border border-white/5">
      
      <!-- Avatar Grande Seleccionado -->
      <div 
        class="w-24 h-24 rounded-full bg-black border-4 flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative"
        :style="{ borderColor: selectedColor }"
      >
        <img :src="`/avatars/avatar-${avatarId}.svg?v=2`" alt="Avatar" class="w-20 h-20 object-contain absolute bottom-0" />
      </div>

      <!-- Fila 1: Avatares -->
      <div class="flex gap-2 flex-wrap justify-center w-full px-2">
        <button 
          v-for="i in 8" :key="i"
          @click="avatarId = i"
          class="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-all duration-200 outline-none hover:scale-110 overflow-hidden"
          :class="[
            avatarId === i 
              ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#151515]' 
              : 'opacity-50 hover:opacity-100 border border-white/10'
          ]"
        >
          <img :src="`/avatars/avatar-${i}.svg?v=2`" :alt="`Avatar ${i}`" class="w-8 h-8 object-contain mt-2" />
        </button>
      </div>

      <!-- Fila 2: Colores -->
      <div class="flex gap-3 justify-center w-full mt-1">
        <button
          v-for="color in colors" :key="color.val"
          @click="selectedColor = color.val"
          class="w-6 h-6 rounded-full transition-all duration-200 outline-none hover:scale-110 shadow-inner"
          :style="{ backgroundColor: color.val }"
          :class="[
            selectedColor === color.val
              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515]'
              : 'opacity-60 hover:opacity-100'
          ]"
        ></button>
      </div>

      <!-- Input de Usuario -->
      <div class="w-full flex flex-col gap-1.5 mt-2">
        <label class="text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase ml-3">Nombre de Usuario</label>
        <input 
          v-model="nickname"
          type="text"
          placeholder="Ej: Impostor"
          class="w-full bg-black text-white px-5 py-3.5 rounded-2xl outline-none focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-gray-700 font-bold text-center tracking-wide"
        />
      </div>

      <!-- Botones (Crear / Unirse) -->
      <div class="w-full flex items-center justify-between gap-4 mt-2" v-if="!showJoinInput">
        <button 
          @click="showJoinInput = true"
          class="text-gray-500 hover:text-white text-sm font-bold transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] pl-2"
        >
          Tengo Código
        </button>
        
        <button 
          @click="handleCreateRoom"
          :disabled="!isValid"
          class="bg-[#f97316] hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]"
        >
          Crear Sala
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Join Input (Si hizo click en "Tengo Código") -->
      <div class="w-full flex flex-col gap-3 mt-2" v-else>
        <div class="flex items-center gap-2">
          <input 
            v-model="roomCode"
            type="text"
            placeholder="CÓDIGO (5 LETRAS)"
            class="flex-1 bg-black text-white px-4 py-3 rounded-2xl outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-mono font-bold tracking-[0.2em] text-center uppercase"
            maxlength="5"
          />
        </div>
        <div class="flex items-center justify-between w-full px-2">
          <button 
            @click="showJoinInput = false"
            class="text-gray-500 hover:text-white text-xs font-bold transition-colors"
          >
            CANCELAR
          </button>
          <button 
            @click="handleJoinRoom"
            :disabled="!isValid || roomCode.length < 5"
            class="bg-white hover:bg-gray-200 text-black px-8 py-2.5 rounded-full font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            UNIRSE
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '~/stores/playerStore'
import anime from 'animejs'

const router = useRouter()
const playerStore = usePlayerStore()

const avatarId = ref(playerStore.avatarId || 1)
const nickname = ref(playerStore.nickname || '')
const selectedColor = ref(playerStore.color || '#f97316') // Orange default

const showJoinInput = ref(false)
const roomCode = ref('')

const isValid = computed(() => nickname.value.trim().length >= 2)

const colors = [
  { val: '#ffffff' }, // Blanco
  { val: '#8b4513' }, // Marrón
  { val: '#ff69b4' }, // Rosa
  { val: '#4caf50' }, // Verde
  { val: '#9c27b0' }, // Morado
  { val: '#3b82f6' }, // Azul
  { val: '#f97316' }  // Naranja
]

const savePlayerAndRedirect = (roomId: string) => {
  playerStore.setPlayerSetup(nickname.value.trim(), avatarId.value, selectedColor.value)
  
  anime({
    targets: ['.main-container', '.header-anim'],
    opacity: 0,
    translateY: -30,
    scale: 0.95,
    duration: 400,
    easing: 'easeInQuad',
    complete: () => {
      router.push(`/sala/${roomId.toUpperCase()}`)
    }
  })
}

const handleCreateRoom = () => {
  if (!isValid.value) return
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let roomId = ''
  for (let i = 0; i < 5; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  savePlayerAndRedirect(roomId)
}

const handleJoinRoom = () => {
  if (!isValid.value || roomCode.value.length < 5) return
  savePlayerAndRedirect(roomCode.value)
}

onMounted(() => {
  document.body.style.backgroundColor = '#0A0A0A'
  
  anime({
    targets: '.header-anim',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 800,
    easing: 'easeOutExpo'
  })
  anime({
    targets: '.main-container',
    scale: [0.9, 1],
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: 100,
    easing: 'easeOutExpo'
  })
})
</script>

<style>
body {
  background-color: #0A0A0A !important;
}
</style>
