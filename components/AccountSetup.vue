<template>
  <div class="flex flex-col items-center gap-4 w-full">
    <div v-if="playerStore.isLoggedIn" class="flex flex-col items-center gap-4">
      <div class="w-24 h-24 rounded-full bg-black border-4 flex items-center justify-center overflow-hidden transition-colors shadow-[0_0_30px_rgba(0,0,0,0.8)] relative" :style="{ borderColor: playerStore.color }">
        <img :src="`/avatars/avatar-${playerStore.avatarId}.svg?v=2`" alt="Avatar" class="w-20 h-20 object-contain absolute bottom-0" />
      </div>
      <h2 class="text-white text-2xl font-black">¡Hola, <span class="text-orange-500">{{ playerStore.nickname }}</span>!</h2>
      <p class="text-yellow-500 font-bold tracking-widest text-sm">🏆 VICTORIAS: {{ playerStore.totalWins || 0 }}</p>
      
      <button @click="logout" class="text-gray-500 hover:text-white text-xs font-bold transition-all mt-4 border border-white/10 px-4 py-2 rounded-full hover:bg-white/5">
        CERRAR SESIÓN
      </button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="w-full flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase ml-3">Usuario</label>
        <input v-model="username" type="text" required class="w-full bg-black text-white px-5 py-3.5 rounded-2xl outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-bold" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase ml-3">Contraseña</label>
        <input v-model="password" type="password" required class="w-full bg-black text-white px-5 py-3.5 rounded-2xl outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-bold" />
      </div>
      
      <div v-if="errorMsg" class="text-red-500 text-xs font-bold text-center mt-1">{{ errorMsg }}</div>

      <div class="flex gap-2 mt-2">
        <button type="submit" @click="isLogin = true" class="flex-1 bg-white hover:bg-gray-200 text-black py-3 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          INICIAR SESIÓN
        </button>
        <button type="submit" @click="isLogin = false" class="flex-1 bg-[#111] hover:bg-[#222] border border-white/10 text-white py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95">
          REGISTRARSE
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '~/stores/playerStore'

const playerStore = usePlayerStore()
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const isLogin = ref(true)

const handleSubmit = async () => {
  errorMsg.value = ''
  try {
    const endpoint = isLogin.value ? '/api/auth/login' : '/api/auth/register'
    const res = await $fetch(endpoint, {
      method: 'POST',
      body: { username: username.value, password: password.value }
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
  }
}

const logout = () => {
  playerStore.logout()
}
</script>
