<template>
  <div class="flex flex-col items-center gap-4 w-full relative">
    
    <!-- Vista de Usuario Logueado (No Editando) -->
    <div v-if="playerStore.isLoggedIn && !isEditing" class="flex flex-col items-center gap-4 w-full transition-all duration-300">
      
      <!-- Botón Editar Flotante -->
      <button class="absolute top-0 right-0 p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all" title="Editar Perfil" @click="startEditing">
        <UIcon name="i-lucide-settings" class="w-5 h-5" />
      </button>

      <div class="w-24 h-24 rounded-full bg-black border-4 flex items-center justify-center overflow-hidden transition-colors shadow-[0_0_30px_rgba(0,0,0,0.8)] relative" :style="{ borderColor: playerStore.color }">
        <img :src="playerStore.picture ? playerStore.picture : `/avatars/avatar-${playerStore.avatarId}.svg?v=3`" alt="Avatar" class="w-full h-full object-cover" >
      </div>
      <h2 class="text-white text-2xl font-black text-center">¡Hola, <span :style="{ color: 'var(--theme-color)' }">{{ playerStore.nickname }}</span>!</h2>
      <div class="flex gap-4 w-full justify-center">
        <div class="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center flex-1">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Partidas</p>
          <p class="text-xl font-black text-white">{{ playerStore.gamesPlayed || 0 }}</p>
        </div>
        <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex flex-col items-center flex-1">
          <p class="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest">Victorias</p>
          <p class="text-xl font-black text-yellow-500">{{ playerStore.totalWins || 0 }}</p>
        </div>
      </div>
      <p v-if="playerStore.lastPlayed" class="text-xs text-gray-500 italic mt-[-8px]">Última partida: {{ new Date(playerStore.lastPlayed).toLocaleDateString() }}</p>
      
      <div class="w-full flex justify-end">
        <button class="text-red-400 hover:text-white text-xs font-bold transition-all border border-red-900/50 bg-red-950/20 px-4 py-2 rounded-full hover:bg-red-600/40 hover:border-red-500 hover:shadow-[0_0_10px_rgba(239,68,68,0.4)] mt-2" @click="logout">
          CERRAR SESIÓN
        </button>
      </div>
    </div>

    <!-- Vista de Edición de Perfil (Post-Login) -->
    <div v-else-if="playerStore.isLoggedIn && isEditing" class="flex flex-col items-center gap-4 w-full transition-all duration-300">
      <div class="flex items-center justify-between w-full px-2 mb-2 border-b border-white/10 pb-2">
        <h3 class="text-white font-bold tracking-widest uppercase text-xs">Editar Perfil</h3>
        <button class="text-gray-500 hover:text-white text-xs font-bold transition-colors" @click="isEditing = false">CANCELAR</button>
      </div>

      <!-- Selector de Avatar y Color base (Componente que ya tenemos) -->
      <ProfileSetup 
        v-model:avatar-id="editAvatarId"
        v-model:color="editColor"
        v-model:nickname="editNickname"
      />

      <!-- Toggle para foto de Google -->
      <div @click="editUseGooglePicture = !editUseGooglePicture" class="flex items-center justify-center gap-3 w-full bg-black/30 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-black/50 transition-colors mt-2">
        <span class="text-gray-300 text-xs font-bold">Usar mi foto de Google</span>
        <UToggle v-model="editUseGooglePicture" :ui="{ active: 'bg-[var(--theme-color)]' }" @click.stop />
      </div>

      <!-- Feedback -->
      <p v-if="errorMsg" class="text-red-500 text-xs font-bold">{{ errorMsg }}</p>
      <p v-if="isLoading" class="text-gray-400 text-xs font-bold animate-pulse">Guardando en la nube...</p>

      <!-- Guardar -->
      <button 
        :disabled="editNickname.trim().length < 2 || isLoading"
        class="w-full mt-2 px-7 py-3.5 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        style="background-color: var(--theme-color);"
        @click="saveProfile"
      >
        Guardar Cambios
      </button>
    </div>

    <!-- Vista de Invitado/No Logueado -->
    <div v-else class="w-full flex flex-col gap-6 mt-4">
      <p class="text-gray-400 text-sm text-center">Inicia sesión con tu cuenta de Google para guardar tus victorias en el Leaderboard Global.</p>
      
      <!-- Flujo OAuth Nativo de Redirección -->
      <a href="http://localhost:3001/api/auth/google/login" class="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black px-6 py-4 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] decoration-none">
        <svg class="w-6 h-6" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        CONTINUAR CON GOOGLE
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '~/stores/playerStore'

const playerStore = usePlayerStore()

const isEditing = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

// Estados temporales de edición
const editNickname = ref('')
const editAvatarId = ref(1)
const editColor = ref('#f97316')
const editUseGooglePicture = ref(true) // Si la apaga, picture se guardará vacío

const startEditing = () => {
  editNickname.value = playerStore.nickname
  editAvatarId.value = playerStore.avatarId
  editColor.value = playerStore.color
  editUseGooglePicture.value = playerStore.picture !== ''
  isEditing.value = true
}

const saveProfile = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    await playerStore.updateProfile({
      username: editNickname.value,
      avatarId: editAvatarId.value,
      color: editColor.value,
      useGooglePicture: editUseGooglePicture.value
    })
    isEditing.value = false
  } catch (e: any) {
    errorMsg.value = e.message || 'Error de conexión.'
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  playerStore.logout()
  isEditing.value = false
}
</script>
