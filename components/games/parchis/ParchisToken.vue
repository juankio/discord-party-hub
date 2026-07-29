<template>
  <div 
    ref="tokenContainer"
    class="absolute z-10 flex items-center justify-center parchis-token pointer-events-auto cursor-pointer"
    :style="{
      width: `${(65 / (boardSize || 1400)) * 100}%`,
      height: `${(65 / (boardSize || 1400)) * 100}%`,
      marginLeft: `${-(65 / (boardSize || 1400)) * 50}%`,
      marginTop: `${-(65 / (boardSize || 1400)) * 50}%`,
      left: `${((animCoords.x + (boardSize || 1400) / 2) / (boardSize || 1400)) * 100}%`,
      top: `${((animCoords.y + (boardSize || 1400) / 2) / (boardSize || 1400)) * 100}%`
    }"
    @click="onTokenClick"
  >
    <div class="token-body relative w-full h-full flex items-center justify-center"
         :class="[ isClickable ? 'z-20 animate-pulse scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'z-10 drop-shadow-[4px_4px_0_rgba(0,0,0,0.7)]' ]">
       
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
import ParchisTokenSVG from "./ParchisTokenSVG.vue";
import { useTokenInteraction } from "~/composables/useTokenInteraction";

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

const { isClickable, onTokenClick } = useTokenInteraction(props);

watch(
	() => props.coordinates,
	(newVal, oldVal) => {
		if (import.meta.client && oldVal && (newVal.x !== oldVal.x || newVal.y !== oldVal.y)) {
			const duration = 400; 

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
						easing: 'easeInOutSine',
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