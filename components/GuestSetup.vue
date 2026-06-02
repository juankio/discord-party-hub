<template>
  <div class="w-full flex flex-col items-center gap-6">
    <!-- Componente unificado de configuración de perfil -->
    <ProfileSetup 
      :avatarId="avatarId"
      :color="color"
      :nickname="nickname"
      @update:avatarId="$emit('update:avatarId', $event)"
      @update:color="$emit('update:color', $event)"
      @update:nickname="$emit('update:nickname', $event)"
    />

    <!-- Botones (Crear / Unirse) -->
    <div class="w-full flex items-center justify-between gap-4 mt-2" v-if="!showJoinInput">
      <button 
        @click="showJoinInput = true"
        class="text-gray-500 hover:text-white text-sm font-bold transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] pl-2"
      >
        Tengo Código
      </button>
      
      <button 
        @click="$emit('createRoom')"
        :disabled="!isValid"
        class="disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
        style="background-color: var(--theme-color); box-shadow: 0 0 15px rgba(var(--theme-color-rgb), 0.3);"
        onmouseover="if(!this.disabled) { this.style.filter='brightness(1.1)'; this.style.boxShadow='0 0 20px rgba(var(--theme-color-rgb), 0.5)'; }"
        onmouseout="if(!this.disabled) { this.style.filter='none'; this.style.boxShadow='0 0 15px rgba(var(--theme-color-rgb), 0.3)'; }"
      >
        Crear Sala
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Join Input (Si hizo click en "Tengo Código") -->
    <div class="w-full flex flex-col gap-3 mt-2" v-else>
      <div class="flex items-center gap-2">
        <input 
          :value="roomCode"
          @input="$emit('update:roomCode', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="CÓDIGO (5 LETRAS)"
          class="flex-1 bg-black text-white px-4 py-3 rounded-2xl outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-mono font-bold tracking-[0.2em] text-center uppercase"
          maxlength="5"
        />
      </div>
      <div class="flex items-center justify-between w-full px-2">
        <button 
          @click="showJoinInput = false"
          class="text-gray-500 hover:text-white text-xs font-bold transition-colors"
        >
          CANCELAR
        </button>
        <button 
          @click="$emit('joinRoom')"
          :disabled="!isValid || roomCode.length < 5"
          class="bg-white hover:bg-gray-200 text-black px-8 py-2.5 rounded-full font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          UNIRSE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  avatarId: { type: Number, required: true },
  color: { type: String, required: true },
  nickname: { type: String, required: true },
  roomCode: { type: String, required: true },
  isValid: { type: Boolean, required: true }
})

defineEmits(['update:avatarId', 'update:color', 'update:nickname', 'update:roomCode', 'createRoom', 'joinRoom'])

const showJoinInput = ref(false)
</script>
