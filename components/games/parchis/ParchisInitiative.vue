<script setup lang="ts">
import { computed } from 'vue';
import { useParchisStore } from '~/stores/games/parchisStore';
import { usePlayerStore } from '~/stores/playerStore';
import { useSocket } from '~/composables/useSocket';

const parchisStore = useParchisStore();
const playerStore = usePlayerStore();
const { socket } = useSocket();

const props = defineProps<{
  players: any[]
}>();

const hasRolled = computed(() => {
  return parchisStore.initiativeRolls[playerStore.userId] !== undefined;
});

const myRoll = computed(() => {
  return parchisStore.initiativeRolls[playerStore.userId];
});

const rollInitiative = () => {
  if (socket.value && !hasRolled.value) {
    socket.value.emit("parchis:roll_initiative");
  }
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="relative w-full max-w-2xl bg-gray-900/90 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center overflow-hidden">
      <!-- Glow -->
      <div class="absolute inset-0 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      
      <h2 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2 text-center drop-shadow-lg">
        TIRADA DE INICIATIVA
      </h2>
      <p class="text-gray-400 mb-8 text-center text-lg">
        Lanza los dados para decidir quién elige asiento primero.
      </p>

      <!-- Grid of players -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full mb-10">
        <div 
          v-for="player in players" 
          :key="player.userId"
          class="flex flex-col items-center gap-3"
        >
          <div class="relative group">
            <div 
              class="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-800 border-2 flex items-center justify-center overflow-hidden shadow-lg transition-all duration-300"
              :class="parchisStore.initiativeRolls[player.userId] ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-gray-700'"
            >
              <img v-if="player.avatar" :src="player.avatar" class="w-full h-full object-cover" />
              <UIcon v-else name="i-heroicons-user" class="w-10 h-10 text-gray-500" />

              <!-- Dice result overlay -->
              <div 
                v-if="parchisStore.initiativeRolls[player.userId]"
                class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center"
              >
                <div class="text-4xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                  {{ parchisStore.initiativeRolls[player.userId] }}
                </div>
              </div>
            </div>
            
            <div class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center bg-gray-900 border-2 border-gray-800 shadow-md">
              <UIcon v-if="parchisStore.initiativeRolls[player.userId]" name="i-heroicons-check" class="w-5 h-5 text-green-500" />
              <UIcon v-else name="i-heroicons-ellipsis-horizontal" class="w-5 h-5 text-gray-500 animate-pulse" />
            </div>
          </div>
          
          <div class="text-center font-bold text-gray-200 truncate w-full px-2" :class="player.userId === playerStore.userId ? 'text-indigo-300' : ''">
            {{ player.nickname }}
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        v-if="!hasRolled"
        @click="rollInitiative"
        class="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-black text-xl text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:scale-105 transition-all duration-300 overflow-hidden"
      >
        <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
        <div class="flex items-center gap-3 relative z-10">
          <UIcon name="i-game-icons-dice-six-faces-three" class="w-8 h-8 group-hover:animate-spin" />
          <span>LANZAR DADO</span>
        </div>
      </button>
      
      <div v-else class="px-8 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center">
        <span class="text-green-400 font-bold text-lg mb-1">¡Has sacado un {{ myRoll }}!</span>
        <span class="text-gray-400 text-sm">Esperando a los demás jugadores...</span>
      </div>
    </div>
  </div>
</template>