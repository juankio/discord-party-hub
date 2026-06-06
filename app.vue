<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { usePlayerStore } from '~/stores/playerStore'

useSeoMeta({
  ogTitle: 'Discord Party Hub',
  ogDescription: 'Tu hub de juegos en tiempo real. ¡Entra a jugar wachoo o te cagas!',
  ogImage: 'https://discord-party-hub.vercel.app/banner.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterImage: 'https://discord-party-hub.vercel.app/banner.jpg'
})

const playerStore = usePlayerStore()

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}` : '249, 115, 22';
}

const updateThemeColor = (color: string) => {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--theme-color', color)
    document.documentElement.style.setProperty('--theme-color-rgb', hexToRgb(color))
    document.documentElement.style.setProperty('--theme-text-color', color.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff')
  }
}

onMounted(() => {
  updateThemeColor(playerStore.color || '#f97316')
})

watch(() => playerStore.color, (newColor) => {
  updateThemeColor(newColor || '#f97316')
})
</script>

<style>
:root {
  --theme-color: #f97316;
  --theme-color-rgb: 249, 115, 22;
  --theme-text-color: #ffffff;
}

/* Estilos base Pro Max */
body {
  background-color: #0A0A0A !important; /* Discord dark */
  background-image: url('/doodles.svg');
  background-repeat: repeat;
  background-attachment: fixed;
  color: #f2f3f5;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0A0A0A; 
}
::-webkit-scrollbar-thumb {
  background: #2b2d31; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #383a40; 
}

/* Glow helpers */
.neon-glow {
  box-shadow: 0 0 15px rgba(88, 101, 242, 0.5);
}
</style>
