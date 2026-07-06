<template>
  <svg :viewBox="dynamicViewBox" class="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="inner-shadow">
        <feOffset dx="0" dy="0"/>
        <feGaussianBlur stdDeviation="3" result="offset-blur"/>
        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
        <feFlood flood-color="black" flood-opacity="0.5" result="color"/>
        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
        <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
      </filter>
    </defs>

    <!-- Base Madera -->
    <polygon :points="basePolygonPoints" fill="#4a2e1b" stroke="#7a4b2b" stroke-width="40" stroke-linejoin="round" />

    <!-- Center Goal Polygon Background -->
    <polygon :points="centerPolygon" fill="#111" stroke="#333" stroke-width="8"/>

    <!-- Meta / Llegadas (Middle column of each arm) -->
    <g v-for="(sq, i) in llegadaPaths" :key="'llegada'+i">
      <polygon :points="sq.points" :fill="sq.color" stroke="#111" stroke-width="2" filter="url(#inner-shadow)" />
    </g>

    <!-- Track Squares (Radial Arms with Trapezoids at base) -->
    <g v-for="(sq, i) in trackSquares" :key="'sq'+i">
      <polygon :points="sq.points" :fill="sq.fill" stroke="#222" stroke-width="2" />
      <!-- Highlight borders for Salida/Seguro/Tip -->
      <polygon v-if="sq.isSalida || sq.isSeguro || sq.isTip" :points="sq.points" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4" />
      
      <!-- Star Icon for Salida/Seguro -->
      <polygon v-if="sq.isSeguro || sq.isSalida" points="0,-12 3.5,-3.5 12,-3.5 5,2 7.5,10.5 0,6 -7.5,10.5 -5,2 -12,-3.5 -3.5,-3.5" fill="#fcd34d" stroke="#b45309" stroke-width="1.5" stroke-linejoin="round" :transform="`translate(${sq.cx}, ${sq.cy}) rotate(${-sq.rot}) scale(1.1)`" filter="url(#glow)" />
    </g>

    <!-- Wedges (Territories) -->
    <g v-for="(wedge, i) in wedges" :key="'wedge'+i"
       @click="!parchisStore.takenSeats?.includes(i) && chooseSeat(i)"
       :class="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i) ? 'cursor-pointer group' : ''"
       :style="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i) ? `transform-origin: ${wedge.cx}px ${wedge.cy}px` : ''"
    >
      <!-- Glowing highlight when choosing seats -->
      <polygon v-if="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i)" :points="wedge.points" fill="none" stroke="#4ade80" stroke-width="8" stroke-dasharray="10 10" class="animate-[spin_8s_linear_infinite] opacity-70 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300" />
      <polygon v-if="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i)" :points="wedge.points" fill="#4ade80" filter="url(#glow)" class="opacity-20 animate-pulse group-hover:opacity-40 transition-opacity" />
      
      <!-- Main Wedge -->
      <polygon :points="wedge.points" :fill="wedge.color" stroke="#111" stroke-width="4" opacity="0.95" />
      
      <!-- Taken Indicator -->
      <polygon v-if="parchisStore.gameState === 'CHOOSING_SEATS' && parchisStore.takenSeats?.includes(i)" :points="wedge.points" fill="#000" opacity="0.6" />

      <!-- Token spots -->
      <circle v-for="(spot, spotIdx) in wedge.spots" :key="'spot'+spotIdx" :cx="spot.x" :cy="spot.y" r="22" fill="#000" opacity="0.3" filter="url(#inner-shadow)" />
    </g>

    <!-- Wooden Frame Overlay (drawn on top of wedges to prevent overlap) -->
    <polygon :points="basePolygonPoints" fill="none" stroke="#7a4b2b" stroke-width="40" stroke-linejoin="round" class="pointer-events-none" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useParchisStore } from "~/stores/games/parchisStore";
import { usePlayerStore } from "~/stores/playerStore";
import { useSocket } from "~/composables/useSocket";

const props = defineProps<{
  dynamicViewBox: string;
  basePolygonPoints: string;
  centerPolygon: string;
  llegadaPaths: any[];
  trackSquares: any[];
  wedges: any[];
}>();

const parchisStore = useParchisStore();
const playerStore = usePlayerStore();
const { socket } = useSocket();

const isSeatChoosingAndMyTurn = computed(() => {
	return parchisStore.gameState === 'CHOOSING_SEATS' && parchisStore.firstPickerUserId === playerStore.userId;
});

const chooseSeat = (index: number) => {
	if (isSeatChoosingAndMyTurn.value) {
		socket.value?.emit("parchis:choose_seat", { targetColorIndex: index });
	}
};
</script>