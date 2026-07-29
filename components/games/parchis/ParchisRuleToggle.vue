<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  label: string;
  description?: string;
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'change'): void;
}>();
</script>

<template>
  <label 
    class="group flex items-center justify-between bg-[#6d4621] hover:bg-[#7d512a] p-4 rounded-xl cursor-pointer transition-colors border-2 border-[#5c3a1b] border-b-[6px] shadow-sm relative z-10 w-full"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <div class="flex flex-col">
      <span class="text-[#f2f3f5] font-black text-xs sm:text-sm tracking-wide">{{ label }}</span>
      <span v-if="description" class="text-[10px] text-white/60 font-bold tracking-wider">{{ description }}</span>
    </div>
    <div class="w-14 h-8 shrink-0 rounded-full border-4 border-[#3a2212] transition-colors relative flex items-center shrink-0"
         :class="modelValue ? 'bg-[#109041]' : 'bg-[#151515]'">
      <div class="absolute w-6 h-6 bg-white rounded-full border-4 border-[#3a2212] transition-all"
           :class="modelValue ? 'right-0' : 'left-0'"/>
    </div>
    <input 
      type="checkbox" 
      :checked="modelValue" 
      :disabled="disabled" 
      @change="(e) => {
        $emit('update:modelValue', (e.target as HTMLInputElement).checked);
        $emit('change');
      }" 
      class="hidden"
    >
  </label>
</template>
