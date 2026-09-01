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
    <HomeRoomControls class="mt-2" :room-code="roomCode" :is-valid="isValid" @update:room-code="$emit('update:roomCode', $event)" @create-room="$emit('createRoom')" @join-room="$emit('joinRoom')" />
  </div>
</template>

<script setup lang="ts">

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
