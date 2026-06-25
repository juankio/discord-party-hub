<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95 translate-y-4"
            enter-to="opacity-100 scale-100 translate-y-0"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100 translate-y-0"
            leave-to="opacity-0 scale-95 translate-y-4"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-3xl bg-[#0f0f13] border border-white/10 p-6 sm:p-8 text-left align-middle shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all relative">
              <!-- Glow Background -->
              <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 pointer-events-none"></div>
              
              <DialogTitle as="h3" class="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                <UIcon name="i-lucide-bot" class="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                Configurar Bot
              </DialogTitle>

              <div class="space-y-8 relative z-10" v-if="bot">
                <!-- Info del Bot -->
                <div class="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div class="w-16 h-16 rounded-full overflow-hidden border-2" :style="{ borderColor: bot.color || '#f97316' }">
                    <img :src="`/avatars/avatar-${bot.avatarId}.svg?v=2`" class="w-full h-full object-cover bg-[#151515]">
                  </div>
                  <div>
                    <h4 class="text-white font-bold text-lg" :style="{ color: bot.color || '#f97316' }">{{ bot.nickname }}</h4>
                    <p class="text-xs text-gray-400 font-mono tracking-wider">ID: {{ bot.userId.substring(0, 8) }}</p>
                  </div>
                </div>

                <!-- Slider Dificultad -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-gray-300 uppercase tracking-widest">Dificultad</label>
                    <span class="text-xl font-black text-primary">{{ difficulty }}</span>
                  </div>
                  <URange 
                    v-model="difficulty" 
                    :min="1" 
                    :max="10" 
                    :step="1"
                    color="primary"
                    size="md"
                    class="w-full"
                  />
                  <div class="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    <span>Fácil</span>
                    <span>Imposible</span>
                  </div>
                </div>

                <!-- Botones de Acción -->
                <div class="flex flex-col gap-3 pt-4 border-t border-white/10">
                  <button 
                    @click="kickBot"
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-xl border border-red-500/20 hover:border-red-500/50 transition-all duration-300 font-bold text-sm tracking-widest uppercase group"
                  >
                    <UIcon name="i-lucide-user-x" class="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Expulsar Bot
                  </button>
                  <button 
                    @click="closeModal"
                    class="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 transition-all duration-300 font-bold text-sm tracking-widest uppercase"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { watchDebounced } from '@vueuse/core'

const props = defineProps<{
  isOpen: boolean
  bot: any
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'update-config', botId: string, difficulty: number): void
  (e: 'kick-bot', botId: string): void
}>()

const difficulty = ref(5)

// Inicializar dificultad cuando se abre con un bot nuevo
watch(() => props.bot, (newBot) => {
  if (newBot && newBot.difficulty) {
    difficulty.value = newBot.difficulty
  } else {
    difficulty.value = 5
  }
}, { immediate: true })

watchDebounced(
  difficulty,
  (newVal) => {
    if (props.bot && props.isOpen) {
      emit('update-config', props.bot.userId, newVal)
    }
  },
  { debounce: 500, maxWait: 1000 }
)

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