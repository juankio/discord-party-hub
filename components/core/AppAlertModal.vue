<template>
  <Teleport to="body">
    <div
      v-if="isOpen && alertData"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      @click.self="closeAlert"
    >
      <div class="w-full max-w-sm sm:max-w-md bg-[#2a1a0f] border-4 border-[#5c3a21] rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] p-5 flex flex-col items-center text-center relative overflow-hidden alert-card">
        <div class="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20" :class="currentTheme.glow" />

        <button
          type="button"
          class="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-white rounded-lg hover:bg-black/30 transition-colors"
          aria-label="Cerrar alerta"
          @click="closeAlert"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>

        <div class="w-14 h-14 rounded-2xl flex items-center justify-center border-2 mb-3 shadow-inner" :class="currentTheme.badge">
          <UIcon :name="alertData.icon || currentTheme.icon" class="w-7 h-7" :class="currentTheme.iconColor" />
        </div>

        <h3 class="text-lg sm:text-xl font-mono font-black text-white uppercase tracking-wider mb-2">
          {{ alertData.title }}
        </h3>

        <p class="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed mb-5 max-w-xs">
          {{ alertData.description }}
        </p>

        <button
          type="button"
          class="min-h-[44px] px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center"
          :class="currentTheme.btn"
          @click="handleAction"
        >
          {{ alertData.actionText || 'ENTENDIDO' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, onUnmounted } from 'vue'
import anime from 'animejs'
import { useAppAlert } from '~/composables/useAppAlert'

const { isOpen, alertData, closeAlert } = useAppAlert()

const themeMap = {
  warning: {
    icon: 'i-lucide-alert-triangle',
    badge: 'bg-amber-500/20 border-amber-500/50',
    iconColor: 'text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    btn: 'bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1a0f] border-2 border-[#b45309]',
    glow: 'bg-[#f59e0b]'
  },
  error: {
    icon: 'i-lucide-alert-circle',
    badge: 'bg-red-500/20 border-red-500/50',
    iconColor: 'text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    btn: 'bg-[#ef4444] hover:bg-[#dc2626] text-white border-2 border-[#b91c1c]',
    glow: 'bg-[#ef4444]'
  },
  success: {
    icon: 'i-lucide-check-circle',
    badge: 'bg-emerald-500/20 border-emerald-500/50',
    iconColor: 'text-[#22c55e] drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    btn: 'bg-[#22c55e] hover:bg-[#16a34a] text-[#0f2a15] border-2 border-[#15803d]',
    glow: 'bg-[#22c55e]'
  },
  info: {
    icon: 'i-lucide-info',
    badge: 'bg-cyan-500/20 border-cyan-500/50',
    iconColor: 'text-[#06b6d4] drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]',
    btn: 'bg-[#06b6d4] hover:bg-[#0891b2] text-[#082f49] border-2 border-[#0e7490]',
    glow: 'bg-[#06b6d4]'
  }
} as const

const currentTheme = computed(() => {
  const type = alertData.value?.type || 'info'
  return themeMap[type] || themeMap.info
})

const handleAction = () => {
  if (alertData.value?.onAction) {
    alertData.value.onAction()
  }
  closeAlert()
}

watch(isOpen, async (opened) => {
  if (opened && import.meta.client) {
    await nextTick()
    anime.remove('.alert-card')
    anime({
      targets: '.alert-card',
      scale: [0.85, 1],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutBack'
    })
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    anime.remove('.alert-card')
  }
})
</script>
