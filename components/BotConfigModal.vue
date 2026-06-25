<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeModal"></div>

        <!-- Modal Wrapper (Billiard Aesthetic) -->
        <div class="relative w-full max-w-sm bg-[#8b5a2b] rounded-2xl border-4 border-[#5c3a21] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <!-- Inner Container -->
          <div class="bg-[#2a1a0f] rounded-xl shadow-[inset_0_5px_15px_rgba(0,0,0,0.9)] p-6 relative flex flex-col items-center w-full">
            
            <!-- Title -->
            <h3 class="text-white font-black tracking-widest uppercase text-xl sm:text-2xl mb-6 flex items-center gap-3 w-full justify-center">
              <UIcon name="i-lucide-bot" class="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              Configurar Bot
            </h3>

            <div class="space-y-8 w-full" v-if="bot">
              <!-- Bot Info -->
              <ProfileSetup 
                v-model:nickname="tempNickname" 
                v-model:avatar-id="tempAvatarId" 
                v-model:color="tempColor" 
                class="w-full"
                :style="{ '--theme-color': tempColor }"
              />

              <!-- Difficulty Slider -->
              <div class="space-y-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-black text-gray-400 uppercase tracking-widest">Dificultad</label>
                  <span class="text-xl font-black text-orange-500">{{ tempDifficulty }}</span>
                </div>
                <URange 
                  v-model="tempDifficulty" 
                  :min="1" 
                  :max="10" 
                  :step="1"
                  color="orange"
                  size="md"
                  class="w-full"
                />
                <div class="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  <span>Fácil</span>
                  <span>Imposible</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col gap-4 pt-2">
                <button 
                  @click="saveConfig"
                  class="w-full px-4 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl border-t-2 border-white/20 transition-all duration-100 font-black text-sm tracking-widest uppercase shadow-[0_6px_0_rgba(0,0,0,0.6),0_10px_15px_rgba(0,0,0,0.4)] active:translate-y-[6px] active:shadow-none"
                >
                  Guardar Cambios
                </button>
                <button 
                  @click="kickBot"
                  class="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl border-t-2 border-white/20 transition-all duration-100 font-black text-sm tracking-widest uppercase shadow-[0_6px_0_rgba(0,0,0,0.6),0_10px_15px_rgba(0,0,0,0.4)] active:translate-y-[6px] active:shadow-none group"
                >
                  <UIcon name="i-lucide-user-x" class="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Expulsar Bot
                </button>
                <button 
                  @click="closeModal"
                  class="w-full px-4 py-4 bg-[#5c3a21] hover:bg-[#6c4a31] text-white rounded-2xl border-t-2 border-white/20 transition-all duration-100 font-black text-sm tracking-widest uppercase shadow-[0_6px_0_rgba(0,0,0,0.6),0_10px_15px_rgba(0,0,0,0.4)] active:translate-y-[6px] active:shadow-none"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  bot: any
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'update-config', botId: string, config: { difficulty: number, nickname: string, avatarId: number, color: string }): void
  (e: 'kick-bot', botId: string): void
}>()

const tempDifficulty = ref(5)
const tempNickname = ref('')
const tempAvatarId = ref(1)
const tempColor = ref('#f97316')

// Inicializar cuando se abre con un bot nuevo
watch(() => props.bot, (newBot) => {
  if (newBot) {
    tempDifficulty.value = newBot.difficulty ?? 5
    tempNickname.value = newBot.nickname ?? ''
    tempAvatarId.value = Number(newBot.avatarId) || 1
    tempColor.value = newBot.color ?? '#f97316'
  }
}, { immediate: true })

const saveConfig = () => {
  if (props.bot && props.isOpen) {
    emit('update-config', props.bot.userId, {
      difficulty: tempDifficulty.value,
      nickname: tempNickname.value,
      avatarId: tempAvatarId.value,
      color: tempColor.value
    })
    closeModal()
  }
}

const closeModal = () => {
  emit('update:isOpen', false)
}

const kickBot = () => {
  if (props.bot) {
    emit('kick-bot', props.bot.userId)
    closeModal()
  }
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
