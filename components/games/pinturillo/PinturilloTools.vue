<script setup lang="ts">
const props = defineProps<{
  currentColor: string;
  currentThickness: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:color', color: string): void;
  (e: 'update:thickness', thickness: number): void;
  (e: 'clear'): void;
}>();

const colors = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FFA500', // Orange
  '#800080', // Purple
  '#A52A2A', // Brown
  '#FFC0CB', // Pink
];

const thicknesses = [
  { value: 5, label: 'Fino' },
  { value: 12, label: 'Medio' },
  { value: 24, label: 'Grueso' },
];

function selectColor(color: string) {
  if (props.disabled) return;
  emit('update:color', color);
}

function selectThickness(val: number) {
  if (props.disabled) return;
  emit('update:thickness', val);
}
</script>

<template>
  <div class="flex flex-col md:flex-row items-center justify-between bg-[#4a3628] p-4 rounded-xl border-b-[8px] border-[#2e2016] shadow-xl gap-6"
       :class="{ 'opacity-50 pointer-events-none': disabled }">
    
    <!-- Colors (Watercolor Pans) -->
    <div class="flex gap-2 flex-wrap justify-center bg-[#6b4e36] p-2 rounded-lg border-b-4 border-[#4a3628] shadow-inner">
      <button
        v-for="color in colors"
        :key="color"
        @click="selectColor(color)"
        class="relative w-12 h-12 bg-[#d2b48c] rounded-md border-b-4 border-[#8b5a2b] flex items-center justify-center transition-transform hover:-translate-y-1 active:translate-y-0 active:border-b-0"
        :class="currentColor === color ? '-translate-y-2 drop-shadow-md border-b-[6px]' : ''"
        :title="color"
      >
        <div class="w-8 h-8 rounded-sm shadow-inner" :style="{ backgroundColor: color, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }"></div>
        <span class="sr-only">Seleccionar color {{ color }}</span>
      </button>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-4 shrink-0">
      <!-- Eraser (Physical Pink Rubber) -->
      <button
        @click="selectColor('#f4e4bc')"
        class="shrink-0 w-16 h-10 bg-[#f4a7a7] rounded-md border-b-[6px] border-[#c07a7a] flex items-center justify-center transition-transform hover:-translate-y-1 active:translate-y-0 active:border-b-0 shadow-md"
        :class="currentColor === '#f4e4bc' ? '-translate-y-2 drop-shadow-lg' : ''"
        title="Goma de borrar"
      >
        <span class="text-xs font-black text-white uppercase drop-shadow-sm rotate-[-5deg]">Goma</span>
      </button>

      <!-- Clear Canvas (Trash Can) -->
      <button
        @click="emit('clear')"
        class="shrink-0 px-4 py-2 bg-[#d32f2f] text-white font-bold rounded-md border-b-[6px] border-[#9a0007] flex items-center justify-center transition-transform hover:-translate-y-1 active:translate-y-0 active:border-b-0 shadow-md"
        title="Limpiar Lienzo"
      >
        <span class="text-lg leading-none">🗑️</span>
      </button>

      <!-- Thickness -->
      <div class="flex gap-2 bg-[#6b4e36] p-2 rounded-lg border-b-4 border-[#4a3628] shadow-inner">
        <button
          v-for="t in thicknesses"
          :key="t.value"
          @click="selectThickness(t.value)"
          class="flex items-center justify-center w-10 h-10 rounded-md bg-[#8b5a2b] border-b-4 border-[#5c3a21] transition-transform hover:-translate-y-1 active:translate-y-0 active:border-b-0"
          :class="currentThickness === t.value ? '-translate-y-1 drop-shadow-md' : ''"
        >
          <div class="bg-[#2e2016] rounded-full shadow-inner" :style="{ width: t.value + 'px', height: t.value + 'px' }"></div>
        </button>
      </div>
    </div>
  </div>
</template>
