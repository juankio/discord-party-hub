<template>
  <div>
    <Transition name="loader-fade" @after-leave="destroyLoader">
      <AppLoader v-if="!isServerReady" />
    </Transition>

    <div :class="{ 'opacity-0 h-0 overflow-hidden': !isServerReady, 'transition-opacity duration-1000 opacity-100': isServerReady }">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <UNotifications />
      <GameAudioController />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Howler } from 'howler'
import { usePlayerStore } from '~/stores/playerStore'
import { useAudioStore } from '~/stores/audioStore'
import AppLoader from '~/components/core/AppLoader.vue'
import GameAudioController from '~/components/core/GameAudioController.vue'

useSeoMeta({
  ogTitle: 'Discord Party Hub',
  ogDescription: 'Tu hub de juegos en tiempo real. ¡Entra a jugar wachoo o te cagas!',
  ogImage: 'https://discord-party-hub.vercel.app/banner.jpg?v=4',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterImage: 'https://discord-party-hub.vercel.app/banner.jpg?v=4'
})

const isServerReady = ref(false)
const showLayout = ref(false)

const playerStore = usePlayerStore()
const audioStore = useAudioStore()

const destroyLoader = () => {
  showLayout.value = true;
}

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
  audioStore.initAudio()
  updateThemeColor(playerStore.color || '#f97316')

  const unlockAudio = () => {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume()
    }
    document.removeEventListener('click', unlockAudio)
    document.removeEventListener('touchstart', unlockAudio)
  }
  document.addEventListener('click', unlockAudio)
  document.addEventListener('touchstart', unlockAudio)

  const config = useRuntimeConfig()
  const baseUrl = (config.public.socketUrl || 'http://localhost:3001').replace(/\/$/, '')
  const healthUrl = `${baseUrl}/api/health`

  const checkHealth = async () => {
    try {
      const res = await fetch(healthUrl)
      if (res.ok) {
        isServerReady.value = true
        return
      }
    } catch (e) {
      // Ignorar error, servidor apagado o levantando en Azure
    }
    // Reintentar cada 2 segundos
    setTimeout(checkHealth, 2000)
  }

  checkHealth()
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
* {
  -webkit-tap-highlight-color: transparent;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
body {
  background-color: #0A0A0A !important; /* Discord dark */
  background-image: url('/doodles.svg');
  background-repeat: repeat;
  background-attachment: fixed;
  color: #f2f3f5;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  overscroll-behavior: none;
  user-select: none;
}
input, textarea, select {
  user-select: auto;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  display: none;
}

.custom-scrollbar-wood::-webkit-scrollbar { width: 8px; }
.custom-scrollbar-wood::-webkit-scrollbar-track { background: #2c190d; border-radius: 4px; }
.custom-scrollbar-wood::-webkit-scrollbar-thumb { background: #5c3a21; border-radius: 4px; border: 1px solid #2c190d; }
.custom-scrollbar-wood::-webkit-scrollbar-thumb:hover { background: #7a4f2d; }

.custom-scrollbar-notebook::-webkit-scrollbar { width: 6px; }
.custom-scrollbar-notebook::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-notebook::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 4px; }
.custom-scrollbar-notebook::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.4); }

/* Glow helpers */
.neon-glow {
  box-shadow: 0 0 15px rgba(88, 101, 242, 0.5);
}

/* Transitions */
.loader-fade-leave-active {
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.loader-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
button:focus { outline: none !important; box-shadow: none !important; }
</style>
