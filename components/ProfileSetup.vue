<template>
  <div class="flex flex-col items-center gap-4 w-full pb-4 min-w-0">
    <!-- Avatar Grande Seleccionado -->
    <div 
      class="rounded-full bg-black border-4 flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative"
      :class="[compact ? 'w-16 h-16 border-2' : 'w-24 h-24']"
      :style="{ borderColor: color }"
    >
      <img :src="`/avatars/avatar-${avatarId}.svg?v=3`" alt="Avatar" :class="[compact ? 'w-14 h-14' : 'w-20 h-20']" class="object-contain absolute bottom-0" >
    </div>

    <!-- Fila 1: Avatares -->
    <div class="w-full max-w-full overflow-x-auto py-2 custom-scrollbar flex min-w-0">
      <div class="flex gap-2 px-2 m-auto">
        <button 
          v-for="i in 24" :key="i"
          class="shrink-0 rounded-full bg-black flex items-center justify-center transition-all duration-200 outline-none hover:scale-110"
          :class="[
            compact ? 'w-8 h-8' : 'w-10 h-10',
            avatarId === i 
              ? 'ring-2 ring-offset-2 ring-offset-[#151515] z-10' 
              : 'opacity-50 hover:opacity-100 border border-white/10'
          ]"
          :style="avatarId === i ? { '--tw-ring-color': 'var(--theme-color)' } : {}"
          @click="$emit('update:avatarId', i)"
        >
          <img :src="`/avatars/avatar-${i}.svg?v=3`" :alt="`Avatar ${i}`" :class="[compact ? 'w-6 h-6' : 'w-8 h-8']" class="object-contain" >
        </button>
      </div>
    </div>

    <!-- Fila 2: Colores -->
    <div class="flex gap-3 justify-center flex-wrap w-full">
      <button
        v-for="c in colors" :key="c.val"
        class="w-6 h-6 rounded-full transition-all duration-200 outline-none hover:scale-110 shadow-inner"
        :style="{ backgroundColor: c.val }"
        :class="[
          color === c.val
            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515]'
            : 'opacity-60 hover:opacity-100'
        ]"
        @click="$emit('update:color', c.val)"
      />
    </div>

    <!-- Input de Usuario -->
    <div class="w-full flex flex-col gap-1.5">
      <label class="text-[10px] font-bold tracking-[0.2em] uppercase ml-3" style="color: var(--theme-color);">Nombre de Usuario</label>
      <input 
        :value="nickname"
        type="text"
        placeholder="Ej: Impostor"
        class="w-full bg-black text-white px-5 py-3.5 rounded-2xl outline-none focus:ring-1 transition-all placeholder:text-gray-500 font-bold text-center tracking-wide"
        style="--tw-ring-color: rgba(var(--theme-color-rgb), 0.5);"
        @input="$emit('update:nickname', ($event.target as HTMLInputElement).value)"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  avatarId: { type: Number, required: true },
  color: { type: String, required: true },
  nickname: { type: String, required: true },
  compact: { type: Boolean, default: false }
})
defineEmits(['update:avatarId', 'update:color', 'update:nickname'])

const colors = [
  { val: '#ff0000' }, // Blanco
  { val: '#8b4513' }, // Marrón
  { val: '#ff69b4' }, // Rosa
  { val: '#4caf50' }, // Verde
  { val: '#9c27b0' }, // Morado
  { val: '#3b82f6' }, // Azul
  { val: '#f97316' }  // Naranja
]
</script>
