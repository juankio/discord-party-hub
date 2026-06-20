<template>
  <div 
    ref="tokenContainer"
    class="absolute z-10 w-[38px] h-[38px] -ml-[19px] -mt-[19px] flex items-center justify-center parchis-token pointer-events-auto cursor-pointer"
    :style="{
      left: `${((animCoords.x + (boardSize || 1400) / 2) / (boardSize || 1400)) * 100}%`,
      top: `${((animCoords.y + (boardSize || 1400) / 2) / (boardSize || 1400)) * 100}%`
    }"
    @click="onTokenClick"
  >
    <div class="token-body relative w-full h-full flex items-center justify-center"
         :class="[ isClickable ? 'animate-pulse scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'drop-shadow-[4px_4px_0_rgba(0,0,0,0.7)]' ]">
       
       <!-- Fichas 2D Planas (Silhouette Figures) -->
       <svg viewBox="0 0 100 100" class="w-[120%] h-[120%] overflow-visible" :fill="token.color" stroke="#111" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
         
         <!-- CAR -->
         <g v-if="figureId === 'car'">
           <path d="M 15 60 C 15 45, 20 40, 30 40 L 40 25 C 45 15, 55 15, 65 25 L 75 40 C 85 40, 90 45, 90 60 C 90 65, 85 70, 80 70 L 20 70 C 15 70, 15 65, 15 60 Z"/>
           <circle cx="30" cy="70" r="12" />
           <circle cx="70" cy="70" r="12" />
           <!-- Window -->
           <path d="M 42 28 L 62 28 L 70 40 L 32 40 Z" fill="rgba(255,255,255,0.4)" stroke="#111" stroke-width="4" />
         </g>

         <!-- HAT -->
         <g v-else-if="figureId === 'hat'">
           <path d="M 10 75 C 10 65, 20 65, 30 65 C 30 25, 70 25, 70 65 C 80 65, 90 65, 90 75 C 90 85, 10 85, 10 75 Z"/>
           <path d="M 30 65 L 70 65" fill="none"/>
         </g>

         <!-- BOAT -->
         <g v-else-if="figureId === 'boat'">
           <path d="M 20 65 L 80 65 L 70 85 L 30 85 Z"/>
           <rect x="46" y="15" width="8" height="50" />
           <path d="M 46 20 L 20 60 L 46 60 Z" fill="rgba(255,255,255,0.8)" />
           <path d="M 54 25 L 75 55 L 54 55 Z" fill="rgba(255,255,255,0.8)" />
         </g>

         <!-- GEM -->
         <g v-else-if="figureId === 'gem'">
           <path d="M 30 20 L 70 20 L 90 45 L 50 90 L 10 45 Z" />
           <path d="M 30 20 L 50 45 L 70 20 M 10 45 L 50 45 L 90 45 M 50 45 L 50 90" fill="none" />
         </g>

         <!-- WOOD (Tree) -->
         <g v-else-if="figureId === 'wood'">
           <rect x="42" y="75" width="16" height="15" fill="#5c3a21" />
           <path d="M 50 10 L 80 45 L 65 45 L 90 75 L 10 75 L 35 45 L 20 45 Z"/>
         </g>

         <!-- DOG -->
         <g v-else-if="figureId === 'dog'">
           <!-- Ears -->
           <path d="M 25 45 C 5 45, 5 80, 25 75 Z" />
           <path d="M 75 45 C 95 45, 95 80, 75 75 Z" />
           <!-- Head -->
           <circle cx="50" cy="50" r="28"/>
           <!-- Snout -->
           <ellipse cx="50" cy="65" rx="18" ry="14"/>
           <!-- Nose -->
           <ellipse cx="50" cy="60" rx="6" ry="4" fill="#111" stroke="none"/>
           <!-- Eyes -->
           <circle cx="40" cy="45" r="4" fill="#111" stroke="none"/>
           <circle cx="60" cy="45" r="4" fill="#111" stroke="none"/>
         </g>

         <!-- DEFAULT (Pawn) -->
         <g v-else>
           <path d="M 25 85 L 75 85 L 65 70 Q 55 70 55 55 A 18 18 0 1 0 45 55 Q 45 70 35 70 Z" />
           <path d="M 35 70 L 65 70" fill="none" />
         </g>
       </svg>

    </div>
  </div>
</template>

<script setup lang="ts">
import anime from "animejs";
import { Car, Dog, Gem, HardHat, Sailboat, Trees } from "lucide-vue-next";
import { computed, ref, watch, nextTick } from "vue";
import { useToast } from "#imports";
import { useSocket } from "~/composables/useSocket";
import { useParchisStore } from "~/stores/games/parchisStore";
import { usePlayerStore } from "~/stores/playerStore";

const iconMap: Record<string, any> = {
	dog: Dog,
	car: Car,
	hat: HardHat,
	boat: Sailboat,
	gem: Gem,
	wood: Trees,
};

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
			const duration = Math.min(Math.max(distance * 0.5, 150), 250); // Ultra-fast duration

			if (tokenContainer.value) {
				const el = tokenContainer.value;
				
				// FLIP technique: measure current visual position
				const firstRect = el.getBoundingClientRect();
				
				// Clear any ongoing transforms to get clean layout measure
				anime.remove(el);
				el.style.transform = '';
				
				// Update base layout coordinates
				animCoords.value.x = newVal.x;
				animCoords.value.y = newVal.y;

				nextTick(() => {
					// Measure new static position
					const lastRect = el.getBoundingClientRect();
					
					// Invert
					const invertX = firstRect.left - lastRect.left;
					const invertY = firstRect.top - lastRect.top;
					
					// Animate from inverted to 0 using translate3d
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
						// Snappy jump
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
</script>


