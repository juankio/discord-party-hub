<template>
  <div class="flex flex-col items-center gap-4 w-full">
    <div v-if="playerStore.isLoggedIn" class="flex flex-col items-center gap-4">
      <div class="w-24 h-24 rounded-full bg-black border-4 flex items-center justify-center overflow-hidden transition-colors shadow-[0_0_30px_rgba(0,0,0,0.8)] relative" :style="{ borderColor: playerStore.color }">
        <img :src="playerStore.picture ? playerStore.picture : `/avatars/avatar-${playerStore.avatarId}.svg?v=3`" alt="Avatar" class="w-full h-full object-cover" >
      </div>
      <h2 class="text-white text-2xl font-black">¡Hola, <span :style="{ color: 'var(--theme-color)' }">{{ playerStore.nickname }}</span>!</h2>
      <p class="text-yellow-500 font-bold tracking-widest text-sm">🏆 VICTORIAS: {{ playerStore.totalWins || 0 }}</p>
      
      <button class="text-gray-500 hover:text-white text-xs font-bold transition-all mt-4 border border-white/10 px-4 py-2 rounded-full hover:bg-white/5" @click="logout">
        CERRAR SESIÓN
      </button>
    </div>

    <div v-else class="w-full flex flex-col gap-6 mt-4">
      <p class="text-gray-400 text-sm text-center">Inicia sesión con tu cuenta de Google para guardar tus victorias en el Leaderboard Global.</p>
      
      <GoogleLogin :callback="handleGoogleLogin" popup-type="TOKEN">
        <button class="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black px-6 py-4 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          CONTINUAR CON GOOGLE
        </button>
      </GoogleLogin>

      <div v-if="errorMsg" class="text-red-500 text-xs font-bold text-center mt-1">{{ errorMsg }}</div>
      <div v-if="isLoading" class="text-gray-400 text-xs font-bold text-center mt-1 animate-pulse">Iniciando sesión...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '~/stores/playerStore'

const playerStore = usePlayerStore()
const errorMsg = ref('')
const isLoading = ref(false)

const handleGoogleLogin = async (response: any) => {
  errorMsg.value = ''
  isLoading.value = true
  
  try {
    const res = await $fetch('/api/auth/google', {
      method: 'POST',
      body: { token: response.access_token }
    })
    
    if (res.error) {
      errorMsg.value = res.error
      return
    }

    if (res.token) {
      playerStore.setAccountAuth(res.token, res.user)
    }
  } catch (e: any) {
    errorMsg.value = e.data?.message || 'Error al conectar con el servidor'
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  playerStore.logout()
}
</script>
