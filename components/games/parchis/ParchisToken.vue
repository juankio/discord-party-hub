<template>
  <div 
    ref="tokenContainer"
    class="absolute z-10 flex items-center justify-center parchis-token pointer-events-auto cursor-pointer"
    :style="{
      width: '3.5%',
      height: '3.5%',
      marginLeft: '-1.75%',
      marginTop: '-1.75%',
      left: `${((animCoords.x + (boardSize || 1400) / 2) / (boardSize || 1400)) * 100}%`,
      top: `${((animCoords.y + (boardSize || 1400) / 2) / (boardSize || 1400)) * 100}%`
    }"
    @click="onTokenClick"
  >
    <div class="token-body relative w-full h-full flex items-center justify-center"
         :class="[ isClickable ? 'animate-pulse scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'drop-shadow-[4px_4px_0_rgba(0,0,0,0.7)]' ]">
       
       <ParchisTokenSVG 
         :figureId="figureId" 
         :color="token.color" 
       />

    </div>
  </div>
</template>

<script setup lang="ts">
import anime from "animejs";
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useToast } from "#imports";
import { useSocket } from "~/composables/useSocket";
import { useParchisStore } from "~/stores/games/parchisStore";
import { usePlayerStore } from "~/stores/playerStore";
import ParchisTokenSVG from "./ParchisTokenSVG.vue";

const props = defineProps<{
	token: {
		color: string;
		ownerId: string;
		position: number;
		state: string;
		id: number;
	};
	figureId?: string;
	coordinates: { x: number; y: number };
	boardSize?: number;
}>();

const tokenContainer = ref<HTMLElement | null>(null);
const animCoords = ref({ x: 0, y: 0 });
const parchisStore = useParchisStore();
const playerStore = usePlayerStore();
const { socket } = useSocket();
const toast = useToast();

const isClickable = computed(() => {
	if (
		!parchisStore.isMyTurn ||
		playerStore.userId !== props.token.ownerId
	)
		return false;

	if (!parchisStore.diceValue || parchisStore.diceValue.length === 0) {
		return false;
	}

	if (props.token.state === "HOME") {
		if (parchisStore.rules?.diceCount === 2) {
			return (
				parchisStore.diceValue.length >= 2 &&
				parchisStore.diceValue[0] === parchisStore.diceValue[1]
			);
		} else {
			return parchisStore.availableMoves?.includes(5) || false;
		}
	}
	if (props.token.state === "META") {
		return false;
	}
	return parchisStore.availableMoves?.length > 0;
});

const onTokenClick = () => {
	if (!parchisStore.isMyTurn) {
		toast.add({ title: "No es tu turno", color: "red" });
		return;
	}
	if (playerStore.userId !== props.token.ownerId) {
		toast.add({ title: "Esta no es tu ficha", color: "red" });
		return;
	}
	if (!parchisStore.diceValue || parchisStore.diceValue.length === 0) {
		toast.add({ title: "Tira los dados primero", color: "orange" });
		return;
	}

	const isTwoDice = parchisStore.rules?.diceCount === 2;

	if (props.token.state === "HOME") {
		if (isTwoDice) {
			const hasPairs =
				parchisStore.diceValue.length >= 2 &&
				parchisStore.diceValue[0] === parchisStore.diceValue[1];
			if (!hasPairs) {
				toast.add({
					title: "Necesitas sacar pares para salir de la cárcel",
					color: "amber",
				});
				return;
			}
		} else {
			if (!parchisStore.availableMoves?.includes(5)) {
				toast.add({
					title: "Necesitas sacar un 5 para salir de la cárcel",
					color: "amber",
				});
				return;
			}
		}
	} else {
		if (!parchisStore.availableMoves || parchisStore.availableMoves.length === 0) {
			toast.add({ title: "No tienes movimientos disponibles", color: "orange" });
			return;
		}
	}

	let moveVal = parchisStore.availableMoves?.[0] || parchisStore.diceValue[0];

	if (props.token.state === "HOME") {
		if (isTwoDice) {
			moveVal = parchisStore.diceValue[0];
		} else {
			moveVal = 5;
		}
	} else if (
		parchisStore.selectedDiceIndex !== null &&
		parchisStore.selectedDiceIndex !== undefined &&
		parchisStore.selectedDiceIndex >= 0 &&
		parchisStore.selectedDiceIndex < parchisStore.availableMoves.length
	) {
		moveVal = parchisStore.availableMoves[parchisStore.selectedDiceIndex];
	}

	socket.value?.emit("parchis:move_token", {
		tokenId: props.token.id,
		diceValue: moveVal,
	});
};

watch(
	() => props.coordinates,
	(newVal, oldVal) => {
		if (import.meta.client && oldVal && (newVal.x !== oldVal.x || newVal.y !== oldVal.y)) {
			const distance = Math.sqrt(Math.pow(newVal.x - oldVal.x, 2) + Math.pow(newVal.y - oldVal.y, 2));
			const duration = Math.min(Math.max(distance * 0.5, 150), 250); 

			if (tokenContainer.value) {
				const el = tokenContainer.value;
				
				const firstRect = el.getBoundingClientRect();
				
				anime.remove(el);
				el.style.transform = '';
				
				animCoords.value.x = newVal.x;
				animCoords.value.y = newVal.y;

				nextTick(() => {
					const lastRect = el.getBoundingClientRect();
					
					const invertX = firstRect.left - lastRect.left;
					const invertY = firstRect.top - lastRect.top;
					
					anime({
						targets: el,
						translateX: [invertX, 0],
						translateY: [invertY, 0],
						translateZ: 0,
						duration: duration,
						easing: 'spring(1, 80, 10, 0)',
						complete: () => {
							el.style.transform = '';
						}
					});

					const body = el.querySelector(".token-body");
					if (body) {
						anime.remove(body);
						anime({
							targets: body,
							translateY: [
								{ value: -30, duration: duration * 0.4, easing: "easeOutSine" },
								{ value: 0, duration: duration * 0.6, easing: "easeInQuad" }
							],
							scale: [
								{ value: 1.25, duration: duration * 0.4, easing: "easeOutSine" },
								{ value: 1, duration: duration * 0.6, easing: "easeInQuad" }
							]
						});
					}
				});
			} else {
				animCoords.value.x = newVal.x;
				animCoords.value.y = newVal.y;
			}
		} else {
			animCoords.value.x = newVal.x;
			animCoords.value.y = newVal.y;
		}
	},
	{ immediate: true }
);

onMounted(() => {
	if (tokenContainer.value) {
		const el = tokenContainer.value;
		anime({
			targets: el,
			scale: [0, 1],
			opacity: [0, 1],
			translateY: [-50, 0],
			duration: 800,
			delay: anime.random(0, 400),
			easing: 'easeOutElastic(1, .5)'
		});
	}
});

onUnmounted(() => {
	if (tokenContainer.value) {
		anime.remove(tokenContainer.value);
		const body = tokenContainer.value.querySelector(".token-body");
		if (body) {
			anime.remove(body);
		}
	}
});
</script>