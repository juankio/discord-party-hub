<template>
  <div class="w-full bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-[0_4px_20px_rgba(245,158,11,0.15)] backdrop-blur-md transition-all">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <div class="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 shadow-inner">
          <span class="absolute inset-0 rounded-xl bg-amber-500/20 animate-ping opacity-60" />
          <UIcon name="i-lucide-gamepad-2" class="w-5 h-5 sm:w-6 sm:h-6 relative z-10 animate-pulse text-amber-400" />
        </div>
        <div class="min-w-0">
          <h2 class="text-sm sm:text-base md:text-lg font-black text-amber-200 tracking-wide flex items-center flex-wrap gap-1.5">
            <span>Partida en Curso:</span>
            <span class="text-white font-extrabold uppercase tracking-wider drop-shadow-sm">{{ gameDisplayName }}</span>
          </h2>
          <p class="text-xs sm:text-sm text-amber-100/75 leading-relaxed mt-0.5">
            Los demás jugadores están jugando una ronda ahora mismo. Espera en el lobby a que termine la partida para unirte a la siguiente.
          </p>
        </div>
      </div>
      <div class="shrink-0 self-end sm:self-center">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wide shadow-sm backdrop-blur-sm">
          <UIcon name="i-lucide-hourglass" class="w-3.5 h-3.5 animate-pulse text-amber-400" />
          Esperando fin de partida
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { gamesList } from "~/constants/gamesList";

const props = defineProps<{
  gameType?: string | null;
}>();

const gameDisplayName = computed(() => {
  if (!props.gameType) return "Partida";
  const found = gamesList.find(
    (g) => g.id.toLowerCase() === props.gameType?.toLowerCase(),
  );
  return found?.name || props.gameType.toUpperCase();
});
</script>
