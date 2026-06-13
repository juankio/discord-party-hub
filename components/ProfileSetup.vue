<template>
  <div class="flex flex-col items-center gap-4 w-full pb-4">
    <!-- Avatar Grande Seleccionado -->
    <div 
      class="w-24 h-24 rounded-full bg-black border-4 flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative"
      :style="{ borderColor: color }"
    >
      <img :src="`/avatars/avatar-${avatarId}.svg?v=3`" alt="Avatar" class="w-20 h-20 object-contain absolute bottom-0" >
    </div>

    <!-- Fila 1: Avatares -->
    <div class="w-full overflow-x-auto py-2 custom-scrollbar">
      <div class="flex gap-2 w-max px-2">
        <button 
          v-for="i in 24" :key="i"
          class="w-10 h-10 shrink-0 rounded-full bg-black flex items-center justify-center transition-all duration-200 outline-none hover:scale-110"
          :class="[
            avatarId === i 
              ? 'ring-2 ring-offset-2 ring-offset-[#151515] z-10' 
              : 'opacity-50 hover:opacity-100 border border-white/10'
          ]"
          :style="avatarId === i ? { '--tw-ring-color': 'var(--theme-color)' } : {}"
          @click="$emit('update:avatarId', i)"
        >
          <img :src="`/avatars/avatar-${i}.svg?v=3`" :alt="`Avatar ${i}`" class="w-8 h-8 object-contain" >
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

    <!-- Fila 3: Estilo de Ficha (Parchís) -->
    <div class="flex flex-col items-center gap-2 w-full mt-1">
      <label class="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">Estilo de Ficha</label>
      <div class="flex gap-4 justify-center w-full">
        <!-- Gem -->
        <button 
          class="w-10 h-10 rounded-full transition-all duration-300 outline-none hover:scale-110 shadow-inner relative flex items-center justify-center bg-gradient-to-tr from-cyan-400 to-blue-600"
          :class="[
            tokenType === 'gem'
              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515]'
              : 'opacity-50 hover:opacity-100'
          ]"
          @click="$emit('update:tokenType', 'gem')"
        >
          <div class="absolute inset-1 rounded-full border-t border-white/50"></div>
          <div class="w-2 h-2 bg-white/50 rounded-full absolute top-2 right-2 blur-[1px]"></div>
        </button>

        <!-- Wood -->
        <button 
          class="w-10 h-10 rounded-full transition-all duration-300 outline-none hover:scale-110 shadow-inner relative flex items-center justify-center bg-[#8b5a2b] border-[3px] border-[#5c3a21]"
          :class="[
            tokenType === 'wood'
              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515]'
              : 'opacity-50 hover:opacity-100'
          ]"
          @click="$emit('update:tokenType', 'wood')"
        >
          <div class="w-full h-full rounded-full border border-black/30 absolute inset-0"></div>
        </button>

        <!-- Metal -->
        <button 
          class="w-10 h-10 rounded-full transition-all duration-300 outline-none hover:scale-110 shadow-inner relative flex items-center justify-center bg-gray-400 border-[3px] border-gray-500"
          :class="[
            tokenType === 'metal'
              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515]'
              : 'opacity-50 hover:opacity-100'
          ]"
          @click="$emit('update:tokenType', 'metal')"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-full"></div>
        </button>
      </div>
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
  tokenType: { type: String, default: 'gem' },
  nickname: { type: String, required: true }
})
defineEmits(['update:avatarId', 'update:color', 'update:tokenType', 'update:nickname'])

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
