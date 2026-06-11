<template>
  <div class="min-h-screen p-4 sm:p-8 relative flex flex-col items-center" style="color: var(--theme-text-color, white);">
    <div class="w-full max-w-[1000px] mx-auto z-10 flex flex-col gap-6">
      
      <!-- Header Pizarra -->
      <div class="bg-[#1e3f20] p-6 pb-8 border-[12px] border-[#8b5a2b] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_20px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <!-- Textura de Pizarra (Ruido/Tiza) -->
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E'); mix-blend-mode: overlay;"></div>
        
        <div class="text-center sm:text-left relative z-10 w-full flex justify-between items-center">
          <div>
            <h2 class="text-2xl sm:text-3xl font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase font-['Comic_Sans_MS',_cursive,sans-serif]">Fase de Revisión</h2>
            <p class="text-[#e2e8f0] mt-1 uppercase font-bold tracking-widest text-xs font-['Comic_Sans_MS',_cursive,sans-serif]">
              Letra Activa: <span class="text-3xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ml-2">{{ letter }}</span>
            </p>
          </div>
          <div class="text-4xl font-black text-yellow-400 font-['Comic_Sans_MS',_cursive,sans-serif] drop-shadow-md">
            {{ Math.ceil(localTimeRemaining) }}s
          </div>
        </div>

        <!-- Animated Progress Bar -->
        <div class="absolute bottom-0 left-0 right-0 h-3 bg-[#173119] z-20">
          <div 
            class="h-full transition-none shadow-[0_0_10px_rgba(250,204,21,0.5)]"
            :class="localTimeRemaining <= 10 ? 'bg-red-500' : 'bg-yellow-400'"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Scrollable Matrix Pizarra -->
      <div class="w-full bg-[#1e3f20] rounded-lg border-[12px] border-[#8b5a2b] overflow-x-auto custom-scrollbar shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] relative">
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E'); mix-blend-mode: overlay;"></div>

        <table class="w-full text-left border-collapse min-w-[800px] relative z-10">
          <thead>
            <tr>
              <th class="p-5 bg-[#173119] border-b border-r border-white/20 sticky left-0 z-20 font-black tracking-widest uppercase text-white shadow-[4px_0_10px_rgba(0,0,0,0.5)] font-['Comic_Sans_MS',_cursive,sans-serif]">
                Jugador
              </th>
              <th 
                v-for="catData in verifyingData" 
                :key="catData.category"
                class="p-5 bg-[#173119] border-b border-r border-white/20 font-black tracking-widest uppercase text-yellow-300 whitespace-nowrap text-center drop-shadow-md font-['Comic_Sans_MS',_cursive,sans-serif]"
              >
                {{ catData.category }}
              </th>
            </tr>
          </thead>
          <tbody>
            <StopVerificationRow 
              v-for="player in players" 
              :key="player.userId"
              :player="player"
              :verifying-data="verifyingData"
              :my-user-id="myUserId"
              :letter="letter"
              :veto-threshold="vetoThreshold"
              @veto="(v) => toggleVeto(v.targetId, v.category)"
            />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  players: any[]
  verifyingData: any[] // CategoryVerification[]
  letter: string
  myUserId: string
  isHost: boolean
  timeRemaining?: number
  verificationTime?: number
}>()

const emit = defineEmits(['veto'])

const localTimeRemaining = ref(props.timeRemaining ?? 30)
const lastSyncTime = ref(Date.now())

watch(() => props.timeRemaining, (newVal) => {
  if (newVal !== undefined) {
    localTimeRemaining.value = newVal
    lastSyncTime.value = Date.now()
  }
})

let frameId: number
const updateProgress = () => {
  const now = Date.now()
  const elapsed = (now - lastSyncTime.value) / 1000
  localTimeRemaining.value = Math.max(0, (props.timeRemaining ?? 30) - elapsed)
  frameId = requestAnimationFrame(updateProgress)
}

onMounted(() => {
  frameId = requestAnimationFrame(updateProgress)
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
})

const progressPercentage = computed(() => {
  const total = props.verificationTime || 30
  const pct = (localTimeRemaining.value / total) * 100
  return Math.min(100, Math.max(0, pct))
})

const totalPlayers = computed(() => props.players.length)
const vetoThreshold = computed(() => Math.floor(totalPlayers.value / 2))

const toggleVeto = (targetId: string, cat: string) => {
  emit('veto', { targetId, category: cat })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 12px;
  width: 12px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #173119;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #254b27;
  border-radius: 4px;
  border: 2px solid #173119;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #2f5f31;
}
</style>
