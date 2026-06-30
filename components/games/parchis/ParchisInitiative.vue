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
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <!-- Main Modal (Wooden Board Style) -->
    <div class="relative w-full max-w-2xl bg-[#2a1a0f] border-4 border-[#5c3a21] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center overflow-hidden ring-1 ring-[#8b5a2b]/30">
      
      <!-- Inner Wood Glow / Texture Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#8b5a2b]/10 to-transparent pointer-events-none"></div>
      
      <h2 class="relative z-10 text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff4e6] to-[#e6a15c] mb-2 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        TIRADA DE INICIATIVA
      </h2>
      <p class="relative z-10 text-[#d4b494] mb-8 text-center text-lg drop-shadow-md">
        Lanza los dados para decidir quién elige asiento primero.
      </p>

      <!-- Grid of players -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full mb-10 relative z-10">
        <div 
          v-for="player in players" 
          :key="player.userId"
          class="flex flex-col items-center gap-3 relative"
        >
          <!-- "TÚ" Badge -->
          <div 
            v-if="player.userId === playerStore.userId"
            class="absolute -top-4 z-20 px-3 py-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-black tracking-widest rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300"
          >
            TÚ
          </div>

          <div class="relative group">
            <!-- Avatar Container -->
            <div 
              class="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#1a0f08] border-[3px] flex items-center justify-center overflow-hidden shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-300"
              :class="[
                parchisStore.initiativeRolls[player.userId] ? 'border-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'border-[#4a2e1b]',
                player.userId === playerStore.userId ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#2a1a0f]' : ''
              ]"
            >
              <img v-if="player.avatarId" :src="`/avatars/avatar-${player.avatarId}.svg`" class="w-full h-full object-cover" />
              <UIcon v-else name="i-heroicons-user" class="w-10 h-10 text-[#8b5a2b]" />

              <!-- Dice result overlay -->
              <div 
                v-if="parchisStore.initiativeRolls[player.userId]"
                class="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center"
              >
                <div class="text-4xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                  {{ parchisStore.initiativeRolls[player.userId] }}
                </div>
              </div>
            </div>
            
            <!-- Status Icon -->
            <div class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center bg-[#2a1a0f] border-2 border-[#5c3a21] shadow-lg">
              <UIcon v-if="parchisStore.initiativeRolls[player.userId]" name="i-heroicons-check" class="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
              <UIcon v-else name="i-heroicons-ellipsis-horizontal" class="w-5 h-5 text-[#8b5a2b] animate-pulse" />
            </div>
          </div>
          
          <div class="text-center font-bold truncate w-full px-2" :class="player.userId === playerStore.userId ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-[#e6d0ba]'">
            {{ player.nickname }}
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        v-if="!hasRolled"
        @click="rollInitiative"
        class="group relative px-10 py-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl font-black text-xl text-white shadow-[0_10px_30px_rgba(245,158,11,0.5)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.7)] hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 overflow-hidden border border-orange-400/50"
      >
        <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
        <div class="flex items-center gap-3 relative z-10 drop-shadow-md">
          <UIcon name="i-game-icons-dice-six-faces-three" class="w-8 h-8 group-hover:animate-spin text-amber-100" />
          <span>TIRAR DADO</span>
        </div>
      </button>
      
      <div v-else class="px-8 py-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex flex-col items-center shadow-[inset_0_0_20px_rgba(34,197,94,0.1)] relative z-10">
        <span class="text-green-400 font-black text-xl mb-1 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">¡Has sacado un {{ myRoll }}!</span>
        <span class="text-[#d4b494] text-sm font-medium">Esperando a los demás jugadores...</span>
      </div>
    </div>
  </div>
</template>