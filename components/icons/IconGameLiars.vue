<template>
  <div class="flex items-end justify-center w-20 h-20 relative">
    <div class="w-14 h-16 bg-[#8b4513] border-2 border-[#4a250a] shadow-lg flex items-center justify-center relative z-10" style="clip-path: polygon(15% 0, 85% 0, 100% 100%, 0% 100%)">
      <UIcon name="i-lucide-skull" class="w-6 h-6 text-orange-200 opacity-70" />
    </div>
    <div class="absolute bottom-1 -right-1 w-4 h-4 bg-red-700 border border-red-900 rounded-sm shadow-md flex items-center justify-center rotate-12 z-20">
      <div class="w-1 h-1 bg-white rounded-full"/>
    </div>
    <div class="absolute bottom-2 -left-2 w-4 h-4 bg-white border border-gray-300 rounded-sm shadow-md flex items-center justify-center -rotate-12 z-20">
      <div class="grid grid-cols-2 grid-rows-2 gap-[2px]">
        <div class="w-0.5 h-0.5 bg-black rounded-full"/><div class="w-0.5 h-0.5 bg-black rounded-full"/>
        <div class="w-0.5 h-0.5 bg-black rounded-full"/><div class="w-0.5 h-0.5 bg-black rounded-full"/>
      </div>
    </div>
  </div>
</template>
