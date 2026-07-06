<template>
  <svg :viewBox="dynamicViewBox" class="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="pro-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur1" />
        <feGaussianBlur stdDeviation="12" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
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

    <!-- Wedges (Territories) -->
    <g v-for="(wedge, i) in wedges" :key="'wedge'+i"
       @click="!parchisStore.takenSeats?.includes(i) && chooseSeat(i)"
       :class="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i) ? 'cursor-pointer group' : ''"
       @mouseenter="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i) ? onWedgeEnter($event, i) : null"
       @mouseleave="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i) ? onWedgeLeave($event) : null"
    >
      <!-- Main Wedge -->
      <polygon :points="wedge.points" :fill="wedge.color" stroke="#111" stroke-width="4" opacity="0.95" />
      
      <!-- Inner Glow Overlay (animated) -->
      <polygon v-if="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i)" 
               :points="wedge.points" 
               fill="#ffffff"
               class="wedge-inner-glow pointer-events-none"
               style="mix-blend-mode: overlay;"
               opacity="0" />

      <!-- Traveling Pro Line (animated) -->
      <polygon v-if="isSeatChoosingAndMyTurn && !parchisStore.takenSeats?.includes(i)" 
               :points="wedge.points" 
               fill="none" 
               stroke="#ffffff" 
               stroke-width="6" 
               class="wedge-pro-line pointer-events-none"
               filter="url(#pro-glow)"
               opacity="0" />
      
      <!-- Taken Indicator -->
      <polygon v-if="parchisStore.gameState === 'CHOOSING_SEATS' && parchisStore.takenSeats?.includes(i)" :points="wedge.points" fill="#000" opacity="0.6" />

      <!-- Token spots -->
      <circle v-for="(spot, spotIdx) in wedge.spots" :key="'spot'+spotIdx" :cx="spot.x" :cy="spot.y" r="22" fill="#000" opacity="0.3" filter="url(#inner-shadow)" />
    </g>

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

    <!-- Wooden Frame Overlay (drawn on top of wedges to prevent overlap) -->
    <polygon :points="basePolygonPoints" fill="none" stroke="#7a4b2b" stroke-width="40" stroke-linejoin="round" class="pointer-events-none" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useParchisStore } from "~/stores/games/parchisStore";
import { usePlayerStore } from "~/stores/playerStore";
import { useSocket } from "~/composables/useSocket";
import anime from "animejs";

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

const emit = defineEmits(['hover-wedge']);

const isSeatChoosingAndMyTurn = computed(() => {
	return parchisStore.gameState === 'CHOOSING_SEATS' && parchisStore.firstPickerUserId === playerStore.userId;
});

const chooseSeat = (index: number) => {
	if (isSeatChoosingAndMyTurn.value) {
		socket.value?.emit("parchis:choose_seat", { targetColorIndex: index });
	}
};

const onWedgeEnter = (e: MouseEvent, index: number) => {
  emit('hover-wedge', index);
  const target = e.currentTarget as SVGGElement;
  if (!target) return;

  const innerGlow = target.querySelector('.wedge-inner-glow');
  const proLine = target.querySelector('.wedge-pro-line');

  if (innerGlow) {
    anime.remove(innerGlow);
    anime({
      targets: innerGlow,
      opacity: [0, 0.4],
      duration: 600,
      easing: 'easeOutExpo'
    });
  }

  if (proLine) {
    anime.remove(proLine);
    anime({
      targets: proLine,
      opacity: [0, 0.9],
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 1500,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
  }
};

const onWedgeLeave = (e: MouseEvent) => {
  emit('hover-wedge', null);
  const target = e.currentTarget as SVGGElement;
  if (!target) return;

  const innerGlow = target.querySelector('.wedge-inner-glow');
  const proLine = target.querySelector('.wedge-pro-line');

  if (innerGlow) {
    anime.remove(innerGlow);
    anime({
      targets: innerGlow,
      opacity: 0,
      duration: 400,
      easing: 'easeInQuad'
    });
  }

  if (proLine) {
    anime.remove(proLine);
    anime({
      targets: proLine,
      opacity: 0,
      duration: 400,
      easing: 'easeInQuad'
    });
  }
};
</script>