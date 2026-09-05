import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { useAppAlert, type AlertOptions } from '../composables/useAppAlert'

describe('useAppAlert Composable', () => {
  const { isOpen, alertData, showAlert, closeAlert } = useAppAlert()

  beforeEach(() => {
    closeAlert()
    alertData.value = null
  })

  afterEach(() => {
    closeAlert()
    alertData.value = null
  })

  it('should initialize with closed state and null data', () => {
    expect(isOpen.value).toBe(false)
    expect(alertData.value).toBeNull()
  })

  it('should open alert and set data with default type info', () => {
    showAlert({
      title: 'Mesa Creada',
      description: 'Tu sala está lista para jugar.'
    })

    expect(isOpen.value).toBe(true)
    expect(alertData.value?.title).toBe('Mesa Creada')
    expect(alertData.value?.description).toBe('Tu sala está lista para jugar.')
    expect(alertData.value?.type).toBe('info')
  })

  it('should preserve custom alert type, icon, and actionText', () => {
    const customOptions: AlertOptions = {
      title: '¡Peligro!',
      description: 'El tiempo se acaba.',
      type: 'warning',
      icon: 'i-lucide-alert-triangle',
      actionText: 'APURAR'
    }

    showAlert(customOptions)

    expect(isOpen.value).toBe(true)
    expect(alertData.value?.type).toBe('warning')
    expect(alertData.value?.icon).toBe('i-lucide-alert-triangle')
    expect(alertData.value?.actionText).toBe('APURAR')
  })

  it('should close manually when closeAlert is called', () => {
    showAlert({
      title: 'Aviso',
      description: 'Mensaje de prueba',
      autoCloseMs: 0
    })

    expect(isOpen.value).toBe(true)
    closeAlert()
    expect(isOpen.value).toBe(false)
  })

  it('should auto-close after specified autoCloseMs', async () => {
    showAlert({
      title: 'Temporal',
      description: 'Se cierra en 50ms',
      autoCloseMs: 50
    })

    expect(isOpen.value).toBe(true)
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(isOpen.value).toBe(false)
  })

  it('should NOT auto-close if autoCloseMs is 0', async () => {
    showAlert({
      title: 'Crítico',
      description: 'Requiere confirmación manual',
      autoCloseMs: 0
    })

    expect(isOpen.value).toBe(true)
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(isOpen.value).toBe(true)
  })

  it('should cancel previous timer when new alert is shown', async () => {
    showAlert({
      title: 'Primero',
      description: 'Va a ser reemplazado',
      autoCloseMs: 40
    })

    showAlert({
      title: 'Segundo',
      description: 'Nuevo mensaje',
      autoCloseMs: 100
    })

    await new Promise((resolve) => setTimeout(resolve, 50))
    // A los 50ms el primero hubiera cerrado, pero fue reemplazado por el segundo de 100ms
    expect(isOpen.value).toBe(true)
    expect(alertData.value?.title).toBe('Segundo')

    await new Promise((resolve) => setTimeout(resolve, 70))
    expect(isOpen.value).toBe(false)
  })
})
