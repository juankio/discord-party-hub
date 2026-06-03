<template>
  <div class="bg-[#111] border border-yellow-600/30 rounded-xl p-5 shadow-[0_0_20px_rgba(202,138,4,0.1)] w-full max-w-[420px] lg:max-w-[320px] mt-0">
    <div class="flex items-center gap-2 border-b border-yellow-600/30 pb-2 mb-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.984 3.984 0 01-2.973-1.317 4.01 4.01 0 01-4.054 0A3.984 3.984 0 015 15a3.989 3.989 0 01-2.656-1.02 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5.824 9.192l-1.298-4.045c.44-.22.89-.44 1.341-.66l1.246 3.889a3.984 3.984 0 00-1.289.816zM15.824 11.192a3.984 3.984 0 00-1.289-.816l1.246-3.889c.45.22.9.44 1.341.66l-1.298 4.045z" clip-rule="evenodd" />
      </svg>
      <h2 class="text-yellow-500 font-bold tracking-widest uppercase text-sm">Top Global</h2>
    </div>

    <div v-if="pending" class="text-center py-4 text-gray-500 text-xs">Cargando campeones...</div>
    <div v-else-if="error" class="text-center py-4 text-red-500 text-xs">Error al cargar</div>
    <div v-else class="flex flex-col gap-2">
      <div
v-for="(player, index) in leaderboard" :key="player.username" 
           class="flex items-center justify-between bg-black/50 p-2 rounded-lg border border-white/5 transition-all hover:bg-yellow-900/10 hover:border-yellow-600/30">
        <div class="flex items-center gap-3">
          <span class="text-yellow-600 font-black text-sm w-4 text-center">{{ index + 1 }}</span>
          <div class="w-6 h-6 rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/10" :style="{ borderColor: player.color }">
            <img :src="`/avatars/avatar-${player.avatarId}.svg?v=2`" class="w-5 h-5 object-contain mt-1" >
          </div>
          <span class="text-white font-bold text-xs">{{ player.username }}</span>
        </div>
        <div class="text-yellow-500 font-black text-sm">{{ player.totalWins }}<span class="text-yellow-800 text-[10px] ml-1">W</span></div>
      </div>
      
      <div v-if="leaderboard?.length === 0" class="text-center py-4 text-gray-500 text-xs italic">
        Aún no hay campeones.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: leaderboard, pending, error } = useFetch<any[]>('http://localhost:3001/api/leaderboard/top')
</script>
