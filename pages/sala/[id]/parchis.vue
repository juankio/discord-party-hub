<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <h1 class="text-4xl font-black text-white capitalize drop-shadow-md mb-4">parchis</h1>
    <p class="text-gray-400">Cargando motor del juego...</p>
    <UButton color="gray" variant="soft" class="mt-8" @click="$router.push(`/sala/${roomId}`)">Volver a la mesa</UButton>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const roomId = route.params.id as string
</script>
