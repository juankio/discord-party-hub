<template>
  <UModal v-model="isOpen" prevent-close :ui="{ base: 'relative text-left rtl:text-right overflow-hidden flex flex-col', ring: '', shadow: 'shadow-2xl shadow-black/80', rounded: 'rounded-3xl', background: 'bg-[#111] dark:bg-[#111] border border-white/5' }">
    <div class="relative p-6 md:p-8 w-full max-w-md mx-auto">
      <!-- Glow Decorativo -->
      <div class="absolute -top-12 -left-12 w-48 h-48 bg-[var(--theme-color)] opacity-20 blur-[80px] pointer-events-none transition-colors duration-500 rounded-full" :style="{ backgroundColor: localColor }" />
      <div class="absolute -bottom-12 -right-12 w-48 h-48 bg-[var(--theme-color)] opacity-20 blur-[80px] pointer-events-none transition-colors duration-500 rounded-full" :style="{ backgroundColor: localColor }" />

      <!-- Header -->
      <div class="flex items-center justify-between mb-8 relative z-10">
        <h2 class="text-2xl font-black text-white tracking-wide">EDITAR <span class="text-white/30">PERFIL</span></h2>
        <button @click="close" class="text-gray-500 hover:text-white transition-colors">
          <UIcon name="i-lucide-x" class="w-6 h-6" />
        </button>
      </div>

      <!-- Contenido -->
      <div class="flex flex-col gap-8 relative z-10">
        <!-- Avatar Preview -->
        <div class="flex justify-center">
          <div 
            class="w-32 h-32 rounded-full bg-[#151515] border-4 flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative group"
            :style="{ borderColor: localColor, boxShadow: `0 0 30px ${localColor}30` }"
          >
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
            <img :src="`/avatars/avatar-${localAvatarId}.svg?v=3`" alt="Avatar" class="w-24 h-24 object-contain absolute bottom-0 transition-transform duration-300 group-hover:scale-110">
          </div>
        </div>

        <!-- Nickname Input -->
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 ml-2">Nombre de Usuario</label>
          <input 
            v-model="localNickname"
            type="text"
            placeholder="Ej: Impostor"
            class="w-full bg-[#1a1a1a] border border-white/5 text-white px-5 py-4 rounded-2xl outline-none focus:ring-1 transition-all placeholder:text-gray-600 font-bold text-center tracking-wide shadow-inner"
            :style="{ '--tw-ring-color': localColor }"
          >
        </div>

        <!-- Avatares (1 al 24) scrollable like ProfileSetup -->
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 ml-2">Avatar</label>
          <div class="w-full overflow-x-auto py-4 custom-scrollbar">
            <div class="flex gap-3 w-max px-2">
              <button 
                v-for="i in 24" :key="i"
                class="w-14 h-14 shrink-0 rounded-full bg-[#1a1a1a] flex items-center justify-center transition-all duration-300 outline-none hover:scale-110 shadow-lg relative overflow-hidden"
                :class="[
                  localAvatarId === i 
                    ? 'ring-2 ring-offset-2 ring-offset-[#111] z-10 scale-110' 
                    : 'opacity-50 hover:opacity-100 border border-white/5'
                ]"
                :style="localAvatarId === i ? { '--tw-ring-color': localColor } : {}"
                @click="localAvatarId = i"
              >
                <img :src="`/avatars/avatar-${i}.svg?v=3`" :alt="`Avatar ${i}`" class="w-12 h-12 object-contain absolute bottom-0" >
              </button>
            </div>
          </div>
        </div>

        <!-- Colores -->
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 ml-2">Color Temático</label>
          <div class="flex gap-3 justify-center flex-wrap">
            <button
              v-for="c in colors" :key="c.val"
              class="w-8 h-8 rounded-full transition-all duration-300 outline-none hover:scale-110 shadow-inner"
              :style="{ backgroundColor: c.val }"
              :class="[
                localColor === c.val
                  ? 'ring-2 ring-white ring-offset-4 ring-offset-[#111] scale-110'
                  : 'opacity-40 hover:opacity-100'
              ]"
              @click="localColor = c.val"
            />
          </div>
        </div>

        <!-- Acción -->
        <button 
          class="mt-4 w-full h-[60px] rounded-2xl text-lg font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
          :style="{ backgroundColor: localColor }"
          @click="save"
        >
          <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span class="relative z-10 text-white drop-shadow-md">Guardar Cambios</span>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePlayerStore } from '~/stores/playerStore'
import { useSocket } from '~/composables/useSocket'

const props = defineProps({
  isOpen: { type: Boolean, required: true }
})

const emit = defineEmits(['update:isOpen'])

const isOpen = computed({
  get: () => props.isOpen,
  set: (val) => emit('update:isOpen', val)
})

const playerStore = usePlayerStore()
const { updateProfile } = useSocket()

const localNickname = ref(playerStore.nickname)
const localAvatarId = ref(playerStore.avatarId)
const localColor = ref(playerStore.color)

const colors = [
  { val: '#ff0000' },
  { val: '#8b4513' },
  { val: '#ff69b4' },
  { val: '#4caf50' },
  { val: '#9c27b0' },
  { val: '#3b82f6' },
  { val: '#f97316' },
  { val: '#ef4444' } // Rojo extra
]

// Sincronizar al abrir
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    localNickname.value = playerStore.nickname
    localAvatarId.value = playerStore.avatarId
    localColor.value = playerStore.color
  }
})

const close = () => {
  isOpen.value = false
}

const save = () => {
  if (!localNickname.value.trim()) return

  const data = {
    nickname: localNickname.value,
    avatarId: localAvatarId.value,
    color: localColor.value
  }

  // Update Pinia (local optimistic)
  playerStore.setPlayerSetup(data.nickname, data.avatarId, data.color)
  
  // Emit to Server
  updateProfile(data)

  close()
}
</script>