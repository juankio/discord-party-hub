<script setup lang="ts">
import { computed } from 'vue';
import { useParchisStore } from '~/stores/games/parchisStore';

const parchisStore = useParchisStore();

const sortedPlayers = computed(() => {
  return [...parchisStore.players].sort((a, b) => {
    // Sort primarily by crowned tokens, then eaten, then fewest died
    const aCrowned = a.stats?.crowned || 0;
    const bCrowned = b.stats?.crowned || 0;
    if (aCrowned !== bCrowned) return bCrowned - aCrowned;
    
    const aEaten = a.stats?.eaten || 0;
    const bEaten = b.stats?.eaten || 0;
    if (aEaten !== bEaten) return bEaten - aEaten;
    
    const aDied = a.stats?.died || 0;
    const bDied = b.stats?.died || 0;
    return aDied - bDied;
  });
});

const getColor = (colorStr: string) => {
  const map: Record<string, string> = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    cyan: "bg-cyan-500",
    pink: "bg-pink-500",
  };
  return map[colorStr] || "bg-gray-500";
};
</script>

<template>
  <div class="hidden xl:flex flex-col w-[320px] h-[600px] bg-[#1a0f08]/90 backdrop-blur-xl border border-orange-900/30 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/5 relative z-10 shrink-0">
    <!-- Header -->
    <div class="relative bg-gradient-to-b from-orange-900/40 to-transparent p-5 border-b border-orange-900/30">
      <div class="absolute inset-0 bg-orange-500/5 blur-[30px]"></div>
      <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 drop-shadow-md flex items-center gap-3 relative z-10">
        <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-amber-400" />
        CLASIFICACIÓN
      </h3>
    </div>

    <!-- Stats List -->
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
      <div 
        v-for="(player, idx) in sortedPlayers" 
        :key="player.userId"
        class="flex flex-col gap-2 p-3 bg-black/40 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all duration-300 relative overflow-hidden group"
        :class="idx === 0 ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30' : ''"
      >
        <div v-if="idx === 0" class="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/20 blur-[30px] rounded-full pointer-events-none"></div>

        <!-- Player Info -->
        <div class="flex items-center gap-3 relative z-10">
          <div class="relative">
            <div 
              class="w-10 h-10 rounded-full border-2 bg-cover bg-center shadow-lg bg-[#1a0f08]"
              :class="getColor(player.color).replace('bg-', 'border-')"
              :style="{ backgroundImage: player.avatar ? `url(/avatars/avatar-${player.avatar}.svg)` : 'none' }"
            ></div>
            <div 
              class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a0f08] shadow-inner"
              :class="getColor(player.color)"
            ></div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="font-bold text-white truncate flex items-center gap-2">
              <span class="truncate">{{ player.nickname }}</span>
              <UIcon v-if="idx === 0 && (player.stats?.crowned || 0) > 0" name="i-game-icons-crown" class="w-4 h-4 text-amber-400 flex-shrink-0" />
            </div>
            <div class="text-xs text-gray-500 capitalize">{{ player.color }}</div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-2 mt-2 relative z-10">
          <div class="flex flex-col items-center bg-white/5 rounded-lg py-1 px-2 border border-white/5 group-hover:bg-amber-500/10 transition-colors">
            <UIcon name="i-game-icons-podium-winner" class="w-4 h-4 text-amber-400 mb-1" />
            <span class="text-sm font-black text-white">{{ player.stats?.crowned || 0 }}</span>
            <span class="text-[9px] text-gray-400 uppercase tracking-wider">Meta</span>
          </div>
          <div class="flex flex-col items-center bg-white/5 rounded-lg py-1 px-2 border border-white/5 group-hover:bg-red-500/10 transition-colors">
            <UIcon name="i-game-icons-crossed-swords" class="w-4 h-4 text-red-400 mb-1" />
            <span class="text-sm font-black text-white">{{ player.stats?.eaten || 0 }}</span>
            <span class="text-[9px] text-gray-400 uppercase tracking-wider">Bajas</span>
          </div>
          <div class="flex flex-col items-center bg-white/5 rounded-lg py-1 px-2 border border-white/5 group-hover:bg-purple-500/10 transition-colors">
            <UIcon name="i-game-icons-skull-crossed-bones" class="w-4 h-4 text-purple-400 mb-1" />
            <span class="text-sm font-black text-white">{{ player.stats?.died || 0 }}</span>
            <span class="text-[9px] text-gray-400 uppercase tracking-wider">Muertes</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 165, 0, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 165, 0, 0.4);
}
</style>