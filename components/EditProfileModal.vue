<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="close"></div>

        <!-- Modal Wrapper (Billiard Aesthetic) -->
        <div class="relative w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#8b5a2b] rounded-2xl border-4 border-[#5c3a21] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <!-- Inner Container -->
          <div class="bg-[#2a1a0f] rounded-xl shadow-[inset_0_5px_15px_rgba(0,0,0,0.9)] p-4 relative flex flex-col w-full min-w-0 overflow-hidden">
            <!-- Glow Decorativo -->
            <div class="absolute -top-12 -left-12 w-48 h-48 opacity-20 blur-[80px] pointer-events-none transition-colors duration-500 rounded-full" :style="{ backgroundColor: localColor }" />
            <div class="absolute -bottom-12 -right-12 w-48 h-48 opacity-20 blur-[80px] pointer-events-none transition-colors duration-500 rounded-full" :style="{ backgroundColor: localColor }" />

            <!-- Header -->
            <h3 class="text-white font-black tracking-widest uppercase text-xl sm:text-2xl mb-4 flex items-center gap-3 w-full justify-center z-10 relative">
              <UIcon name="i-heroicons-pencil-square" class="w-6 h-6 sm:w-8 sm:h-8" :style="{ color: localColor }" />
              EDITAR PERFIL
            </h3>

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
              <div class="space-y-4 bg-black/20 p-4 rounded-2xl border border-white/5 w-full">
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 ml-2">Nombre de Usuario</label>
                  <input 
                    v-model="localNickname"
                    type="text"
                    placeholder="Ej: Impostor"
                    class="w-full bg-[#1a1a1a] border border-white/5 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 transition-all placeholder:text-gray-600 font-bold text-center tracking-wide shadow-inner"
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
                            ? 'ring-2 ring-offset-2 ring-offset-[#2a1a0f] z-10 scale-110' 
                            : 'opacity-50 hover:opacity-100 border border-white/5'
                        ]"
                        :style="localAvatarId === i ? { '--tw-ring-color': localColor } : {}"
                        @click="selectAvatar(i)"
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
                          ? 'ring-2 ring-white ring-offset-4 ring-offset-[#2a1a0f] scale-110'
                          : 'opacity-40 hover:opacity-100'
                      ]"
                      @click="selectColor(c.val)"
                    />
                  </div>
                </div>
              </div>

              <!-- Acción -->
              <div class="flex flex-col gap-3 mt-4">
                <button 
                  class="w-full px-4 py-4 text-white rounded-2xl border-t-2 border-white/20 transition-all duration-100 font-black text-sm tracking-widest uppercase shadow-[0_6px_0_rgba(0,0,0,0.6),0_10px_15px_rgba(0,0,0,0.4)] active:translate-y-[6px] active:shadow-none"
                  :style="{ backgroundColor: localColor }"
                  @click="save"
                >
                  Guardar Cambios
                </button>
                <button @click="close" class="w-full px-4 py-4 bg-[#5c3a21] hover:bg-[#6c4a31] text-white rounded-2xl border-t-2 border-white/20 transition-all duration-100 font-black text-sm tracking-widest uppercase shadow-[0_6px_0_rgba(0,0,0,0.6),0_10px_15px_rgba(0,0,0,0.4)] active:translate-y-[6px] active:shadow-none">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/playerStore'
import { useAppAudio } from '~/composables/useAppAudio'

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
const { playUiClick } = useAppAudio()

const localNickname = ref(playerStore.nickname)
const localAvatarId = ref(playerStore.avatarId)
const localColor = ref(playerStore.color)

const selectAvatar = (id: number) => {
  localAvatarId.value = id
  playUiClick()
}

const selectColor = (val: string) => {
  localColor.value = val
  playUiClick()
}

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
  playUiClick()
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
