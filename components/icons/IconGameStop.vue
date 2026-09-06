<template>
  <div class="w-16 h-20 bg-yellow-300 border border-yellow-500 rounded-sm shadow-md flex flex-col overflow-hidden relative rotate-3">
    <div class="h-3 w-full bg-red-600 border-b border-red-800 flex justify-evenly items-center">
      <div v-for="i in 3" :key="i" class="w-1 h-1 bg-black rounded-full opacity-40"/>
    </div>
    <div class="flex-1 w-full" style="background-image: repeating-linear-gradient(transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 6px);"/>
    <div class="absolute inset-0 flex items-center justify-center pt-2">
      <span class="text-red-600 font-black text-sm tracking-tight -rotate-12 bg-yellow-300 px-1 border-2 border-red-600 rounded">STOP</span>
    </div>
  </div>
</template>
