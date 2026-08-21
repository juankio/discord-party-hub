<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  players: any[];
  timeRemaining: number;
  currentPlayerId: string;
}>();

const emit = defineEmits<{
  (e: 'vote', targetId: string): void;
}>();

const selectedPlayer = ref<string | null>(null);

const me = computed(() => props.players?.find(p => p.userId === props.currentPlayerId || p.id === props.currentPlayerId));
const alivePlayers = computed(() => props.players?.filter(p => p.isAlive) || []);

const confirmVote = () => {
  if (selectedPlayer.value && !me.value?.hasVoted) {
    emit('vote', selectedPlayer.value);
  }
};
</script>

<template>
  <div class="flex justify-center">
    <!-- Detective Notepad -->
    <div class="w-full max-w-2xl bg-[#fffae8] border-2 border-[#a6977a] border-l-[16px] border-l-[#8b3a3a] border-b-[8px] border-b-[#c4b595] rounded-r-md p-8 shadow-[12px_12px_0_rgba(0,0,0,0.6)] relative">
      
      <!-- Spiral binding holes simulation -->
      <div class="absolute left-[-10px] top-0 bottom-0 flex flex-col justify-around py-4">
        <div v-for="i in 12" :key="i" class="w-4 h-4 bg-[#3e2723] rounded-full border-2 border-[#5c3a21] shadow-inner"></div>
      </div>

      <div class="pl-6">
        <div class="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <h2 class="text-3xl font-black uppercase font-mono tracking-tighter">Reporte de Votación</h2>
          <div class="text-right">
            <span class="text-sm font-bold uppercase text-gray-500">Tiempo Límite</span>
            <div class="text-2xl font-black text-red-700 font-mono border-2 border-black px-2 inline-block transform rotate-2">{{ timeRemaining }}s</div>
          </div>
        </div>

        <p class="font-bold text-xl mb-6">¿Quién es el impostor? Seleccione al sospechoso principal:</p>

        <div v-if="me?.hasVoted" class="text-center py-12">
          <div class="inline-block border-4 border-red-600 text-red-600 font-black text-4xl uppercase p-4 transform -rotate-6 mix-blend-multiply">
            VOTO REGISTRADO
          </div>
          <p class="mt-6 font-bold text-gray-600">Esperando al resto de los investigadores...</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-4">
          <button 
            v-for="p in alivePlayers" 
            :key="p.userId || p.id"
            @click="selectedPlayer = p.userId || p.id"
            class="flex items-center gap-4 p-3 border-2 transition-all relative overflow-hidden"
            :class="[
              selectedPlayer === (p.userId || p.id)
                ? 'border-[#3e2723] bg-yellow-200 border-b-[6px] shadow-[4px_4px_0_rgba(0,0,0,0.5)] transform -translate-y-1' 
                : 'border-gray-400 bg-[#f4e4bc] hover:bg-[#e8d5a5] border-b-[4px]'
            ]"
          >
            <div class="w-12 h-12 border-2 border-black flex-shrink-0 flex items-center justify-center text-xl" :style="{ backgroundColor: p.color }">
              🧑‍✈️
            </div>
            
            <div class="flex-grow text-left">
              <span class="font-bold uppercase block">{{ p.nickname }}</span>
              <span class="text-xs text-gray-600 font-mono">{{ (p.userId || p.id) === currentPlayerId ? '(Tú)' : 'Sospechoso' }}</span>
            </div>

            <div v-if="selectedPlayer === (p.userId || p.id)" class="absolute top-2 right-2 text-red-600 font-black text-2xl transform rotate-12">
              X
            </div>
          </button>
        </div>

        <div v-if="!me?.hasVoted" class="mt-8 flex justify-end pt-4 border-t-2 border-dashed border-gray-400">
          <button 
            @click="confirmVote"
            :disabled="!selectedPlayer"
            class="font-black uppercase px-8 py-4 border-2 border-black border-b-[6px] transition-all"
            :class="[
              selectedPlayer 
                ? 'bg-[#3e2723] text-[#f4e4bc] hover:bg-[#2a1a17] active:border-b-2 active:translate-y-[4px]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-b-2 translate-y-[4px]'
            ]"
          >
            Sellar Voto
          </button>
        </div>
      </div>
    </div>
  </div>
</template>