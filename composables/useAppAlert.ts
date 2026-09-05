import { ref, type Ref } from 'vue'

export interface AlertOptions {
  title: string
  description: string
  type?: 'info' | 'warning' | 'error' | 'success'
  icon?: string
  actionText?: string
  onAction?: () => void
  autoCloseMs?: number // Por defecto 4000ms. Si es 0 o undefined en casos críticos, requiere click manual.
}

const isOpen: Ref<boolean> = ref(false)
const alertData: Ref<AlertOptions | null> = ref(null)
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

export const useAppAlert = () => {
  const closeAlert = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      autoCloseTimer = null
    }
    isOpen.value = false
  }

  const showAlert = (options: AlertOptions) => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      autoCloseTimer = null
    }

    alertData.value = {
      type: 'info',
      ...options
    }
    isOpen.value = true

    const timeout = options.autoCloseMs !== undefined ? options.autoCloseMs : 4000
    if (timeout > 0) {
      autoCloseTimer = setTimeout(() => {
        closeAlert()
      }, timeout)
    }
  }

  return {
    isOpen,
    alertData,
    showAlert,
    closeAlert
  }
}
