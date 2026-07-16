<template>
  <div class="relative w-full h-full flex flex-col items-center justify-start sm:justify-center gap-6 sm:gap-8 overflow-x-hidden overflow-y-auto pb-36 xl:pb-8 xl:overflow-hidden xl:flex-row xl:items-start xl:justify-center xl:p-8">
    
    <!-- Fondo oscurecido para selección de asientos (Zoro) -->
    <div 
      class="fixed inset-0 z-0 bg-black/70 backdrop-blur-md pointer-events-none transition-all duration-700"
      :class="parchisStore.gameState === 'CHOOSING_SEATS' ? 'opacity-100' : 'opacity-0'"
    ></div>

    <!-- Tablero contenedor dinámico -->
    <div 
      class="w-full flex items-center justify-center min-h-0 relative p-2 sm:p-4 mt-2 sm:mt-0 flex-1 transition-all duration-700"
      :class="parchisStore.gameState === 'CHOOSING_SEATS' ? 'z-10 scale-105 drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'z-0'"
    >
      <div 
        class="relative mx-auto shrink-0" 
        style="width: 100%; max-width: min(100%, calc(100dvh - 200px)); max-height: 1000px; aspect-ratio: 1/1;"
      >
        <!-- UNIVERSAL PARCHÍS BOARD SVG COMPONENT -->
        <ParchisBoardSVG
          :dynamicViewBox="dynamicViewBox"
          :basePolygonPoints="basePolygonPoints"
          :centerPolygon="boardGeometry.centerPolygon"
          :llegadaPaths="boardGeometry.llegadaPaths"
          :trackSquares="boardGeometry.trackSquares"
          :wedges="boardGeometry.wedges"
          @hover-wedge="handleWedgeHover"
        />

        <!-- Giant Token for Seat Selection (Brook) -->
        <div 
          v-if="isSeatChoosingAndMyTurn"
          class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          style="perspective: 1200px;"
        >
          <div class="animate-float-token">
            <div 
              class="w-48 h-48 sm:w-64 sm:h-64 will-change-transform"
              :style="giantTokenStyle"
            >
              <ParchisTokenSVG 
                :color="myPlayerColorHex"
                :figureId="myPlayerFigure"
              />
            </div>
          </div>
        </div>

        <!-- Render Tokens (HTML Overlay) -->
        <div v-if="parchisStore.gameState === 'PLAYING'" class="absolute inset-0 z-10 pointer-events-none">
          <ParchisToken 
            v-for="tokenObj in allTokens" 
            :key="`${tokenObj.player.userId}-${tokenObj.token.id}`"
            :token="tokenObj.data"
            :figureId="tokenObj.player.selectedFigure"
            :coordinates="tokenObj.coords"
            :boardSize="dynamicBoardSize"
          />
        </div>
      </div>
    </div>

    <!-- HUD Panel (Extracted) -->
    <ParchisHudPanel />

    <!-- Stats Panel Desktop -->
    <ParchisStatsPanel class="hidden xl:flex" />
    
    <!-- Botón Stats Mobile -->
    <button 
      class="xl:hidden absolute top-4 right-4 z-50 p-3 bg-[#1a0f08]/90 border border-orange-500/30 rounded-xl shadow-lg backdrop-blur-md"
      @click="showMobileStats = true"
    >
      <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-orange-400" />
    </button>

    <!-- Stats Modal Mobile -->
    <div v-if="showMobileStats" class="fixed inset-0 z-[100] xl:hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="showMobileStats = false">
      <ParchisStatsPanel class="!flex !w-full !max-w-md !h-[80vh] shadow-2xl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ParchisToken from "./ParchisToken.vue";
import ParchisBoardSVG from "./ParchisBoardSVG.vue";
import ParchisHudPanel from "./ParchisHudPanel.vue";
import ParchisStatsPanel from "./ParchisStatsPanel.vue";
import ParchisTokenSVG from "./ParchisTokenSVG.vue";
import { useParchisStore } from "~/stores/games/parchisStore";
import { usePlayerStore } from "~/stores/playerStore";
import { useParchisBoardGeometry } from "~/composables/useParchisBoardGeometry";

interface TokenData {
	id: number;
	color: string;
	ownerId: string;
	position: number;
	state: string;
}

interface TokenDisplayObject {
	player: any;
	token: any;
	data: TokenData;
	coords: { x: number; y: number };
}


const showMobileStats = ref(false);
const parchisStore = useParchisStore();
const playerStore = usePlayerStore();
const sides = computed(() => parchisStore.rules?.parchisBoardSize || 4);

const hoveredWedgeIndex = ref<number | null>(null);

const handleWedgeHover = (index: number | null) => {
  hoveredWedgeIndex.value = index;
};

const { 
  dynamicViewBox, 
  dynamicBoardSize, 
  basePolygonPoints, 
  boardGeometry,
  colorPalette
} = useParchisBoardGeometry(sides);

const isSeatChoosingAndMyTurn = computed(() => {
  return parchisStore.gameState === 'CHOOSING_SEATS' && parchisStore.firstPickerUserId === playerStore.userId;
});

const myPlayerInfo = computed(() => {
  return parchisStore.players.find(p => p.userId === playerStore.userId);
});

const myPlayerColorHex = computed(() => {
  // If we are hovering a wedge, take the color of that wedge!
  if (hoveredWedgeIndex.value !== null) {
    return colorPalette[hoveredWedgeIndex.value] || '#9ca3af';
  }
  return '#9ca3af'; // Gray-400 as neutral color when not hovering
});

const myPlayerFigure = computed(() => myPlayerInfo.value?.selectedFigure || 'default');

const giantTokenStyle = computed(() => {
  const baseStyle: any = {
    filter: `drop-shadow(0 0 30px ${myPlayerColorHex.value}) drop-shadow(0 0 60px ${myPlayerColorHex.value})`,
    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transformStyle: 'preserve-3d'
  };
  
  if (hoveredWedgeIndex.value === null) {
    return {
      ...baseStyle,
      transform: 'translate(0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)'
    };
  }

  const N = sides.value;
  // Ángulo base adaptado visualmente para que el fantasma mire a las cuñas
  const angleDeg = (hoveredWedgeIndex.value * (360 / N)) - 135;
  const angleRad = angleDeg * (Math.PI / 180);

  const moveDist = 65; // Desplazamiento en píxeles
  const tx = Math.cos(angleRad) * moveDist;
  const ty = Math.sin(angleRad) * moveDist;

  // Inclinación 3D para mirar el asiento
  const tilt = 35;
  const rx = Math.sin(angleRad) * tilt; 
  const ry = -Math.cos(angleRad) * tilt; 
  const rz = Math.cos(angleRad) * 12; // Un ligero giro

  return {
    ...baseStyle,
    transform: `translate(${tx}px, ${ty}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(1.15)`
  };
});

const allTokens = computed(() => {
	const tokens: TokenDisplayObject[] = [];
	const coordsMap = boardGeometry.value.coordsMap;

	const trackOccupants = new Map<number, { userId: string; tokenId: string | number }[]>();
	const metaOccupants = new Map<string, Map<number, { userId: string; tokenId: string | number }[]>>();

	parchisStore.players.forEach(p => {
		p.tokens?.forEach(t => {
			if (t.state === "BOARD" || t.state === "TRACK") {
				const pos = t.position % (sides.value * 17);
				if (!trackOccupants.has(pos)) trackOccupants.set(pos, []);
				trackOccupants.get(pos)!.push({ userId: p.userId, tokenId: t.id });
			} else if (t.state === "META") {
				if (!metaOccupants.has(p.color)) metaOccupants.set(p.color, new Map());
				const metaMap = metaOccupants.get(p.color)!;
				if (!metaMap.has(t.position)) metaMap.set(t.position, []);
				metaMap.get(t.position)!.push({ userId: p.userId, tokenId: t.id });
			}
		});
	});

	parchisStore.players.forEach((player: any, pIdx: number) => {
		if (!player.tokens) return;

		const colorNames = ['yellow', 'blue', 'red', 'green', 'purple', 'orange', 'pink', 'cyan'];
		let baseP = colorNames.indexOf(player.color?.toLowerCase());
		if (baseP === -1) baseP = pIdx % sides.value;

		player.tokens.forEach((token: any, tIdx: number) => {
			let tokenCoords = { x: 0, y: 0 };

			if (token.state === "HOME") {
				const wedge = coordsMap.wedges[baseP];
				if (wedge && wedge.spots) {
					tokenCoords = wedge.spots[tIdx % 4] || { x: 0, y: 0 };
				}
			} else if (token.state === "BOARD" || token.state === "TRACK") {
				const pos = token.position % (sides.value * 17);
				const trackCell = coordsMap.track[pos] as any;
				if (trackCell) {
					const occupantsList = trackOccupants.get(pos) || [];
					const occupants = occupantsList.length;
					const myIndexInCell = occupantsList.findIndex(o => o.userId === player.userId && o.tokenId === token.id);
					
					let offsetX = 0;
					let offsetY = 0;
					if (occupants > 1) {
						const offsets = [
							{x: -12, y: -12},
							{x: 12, y: 12},
							{x: -12, y: 12},
							{x: 12, y: -12},
							{x: 0, y: -16},
							{x: 0, y: 16},
							{x: -16, y: 0},
							{x: 16, y: 0}
						];
							offsetX = offsets[Math.abs(myIndexInCell) % offsets.length]?.x || 0;
							offsetY = offsets[Math.abs(myIndexInCell) % offsets.length]?.y || 0;
					}
					
					tokenCoords = { x: trackCell.x + offsetX, y: trackCell.y + offsetY };
				}
			} else if (token.state === "META") {
				const corridorCell = coordsMap.meta[baseP]?.[token.position] as any;
				if (corridorCell) {
					const occupantsList = metaOccupants.get(player.color)?.get(token.position) || [];
					const occupants = occupantsList.length;
					const myIndexInCell = occupantsList.findIndex(o => o.userId === player.userId && o.tokenId === token.id);
					
					let offsetX = 0;
					let offsetY = 0;
					if (occupants > 1) {
						const offsets = [
							{x: -8, y: -8},
							{x: 8, y: 8},
							{x: -8, y: 8},
							{x: 8, y: -8}
						];
							offsetX = offsets[Math.abs(myIndexInCell) % offsets.length]?.x || 0;
							offsetY = offsets[Math.abs(myIndexInCell) % offsets.length]?.y || 0;
					}
					tokenCoords = { x: corridorCell.x + offsetX, y: corridorCell.y + offsetY };
				}
			}

			tokens.push({
				player,
				token,
				data: {
					id: token.id,
					color: colorPalette[baseP] || '#9ca3af',
					ownerId: player.userId,
					position: token.position,
					state: token.state,
				},
				coords: tokenCoords,
			});
		});
	});
	return tokens;
});
</script>

<style scoped>
@keyframes float-token {
  0%, 100% { transform: translateY(-15px); }
  50% { transform: translateY(15px); }
}
.animate-float-token {
  animation: float-token 4s ease-in-out infinite;
}
</style>