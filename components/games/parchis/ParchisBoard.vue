<template>
  <div class="relative w-full h-full flex flex-col items-center justify-start sm:justify-center gap-6 sm:gap-8 overflow-x-hidden overflow-y-auto pb-36 xl:pb-8 xl:overflow-hidden xl:flex-row xl:items-start xl:justify-center xl:p-8">
    
    <!-- Tablero contenedor dinámico -->
    <div class="w-full flex items-center justify-center min-h-0 relative z-0 p-2 sm:p-4 mt-2 sm:mt-0 flex-1">
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
        />

        <!-- Render Tokens (HTML Overlay) -->
        <div v-show="parchisStore.gameState === 'PLAYING'" class="absolute inset-0 z-10 pointer-events-none">
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
import { useParchisStore } from "~/stores/games/parchisStore";
import { useParchisBoardGeometry } from "~/composables/useParchisBoardGeometry";

const showMobileStats = ref(false);
const parchisStore = useParchisStore();
const sides = computed(() => parchisStore.rules?.parchisBoardSize || 4);

const { 
  dynamicViewBox, 
  dynamicBoardSize, 
  basePolygonPoints, 
  boardGeometry,
  colorPalette
} = useParchisBoardGeometry(sides);

const allTokens = computed(() => {
	const tokens: any[] = [];
	const coordsMap = boardGeometry.value.coordsMap;

	const trackOccupants = new Map<number, any[]>();
	const metaOccupants = new Map<string, Map<number, any[]>>();

	parchisStore.players.forEach(p => {
		p.tokens?.forEach(t => {
			if (t.state === "BOARD" || t.state === "TRACK") {
				const pos = t.position % (sides.value * 17);
				if (!trackOccupants.has(pos)) trackOccupants.set(pos, []);
				trackOccupants.get(pos)!.push({ userId: p.userId, tokenId: t.id });
			} else if (t.state === "META" || t.state === "PATH") {
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
						offsetX = offsets[myIndexInCell % offsets.length].x;
						offsetY = offsets[myIndexInCell % offsets.length].y;
					}
					
					tokenCoords = { x: trackCell.x + offsetX, y: trackCell.y + offsetY };
				}
			} else if (token.state === "META" || token.state === "PATH") {
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
						offsetX = offsets[myIndexInCell % offsets.length].x;
						offsetY = offsets[myIndexInCell % offsets.length].y;
					}
					tokenCoords = { x: corridorCell.x + offsetX, y: corridorCell.y + offsetY };
				}
			}

			tokens.push({
				player,
				token,
				data: {
					id: token.id,
					color: colorPalette[baseP],
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