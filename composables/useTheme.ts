export const useTheme = () => {
  const updateThemeColors = (newColor: string) => {
    if (typeof window !== 'undefined') {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}` : '249, 115, 22';
      }
      document.documentElement.style.setProperty('--theme-color', newColor)
      document.documentElement.style.setProperty('--theme-color-rgb', hexToRgb(newColor))
      document.documentElement.style.setProperty('--theme-text-color', newColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff')
    }
  }

  return {
    updateThemeColors
  }
}
