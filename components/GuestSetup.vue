<template>
  <div class="w-full flex flex-col items-center gap-6">
    <!-- Componente unificado de configuración de perfil -->
    <ProfileSetup 
      :avatar-id="avatarId"
      :color="color"
      :nickname="nickname"
      @update:avatar-id="$emit('update:avatarId', $event)"
      @update:color="$emit('update:color', $event)"
      @update:nickname="$emit('update:nickname', $event)"
    />

    <!-- Botones (Crear / Unirse) -->
    <HomeRoomControls class="mt-2" :roomCode="roomCode" @update:roomCode="$emit('update:roomCode', $event)" :isValid="isValid" @createRoom="$emit('createRoom')" @joinRoom="$emit('joinRoom')" />
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
