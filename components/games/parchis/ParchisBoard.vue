<template>
  <div class="relative w-[95vmin] h-[95vmin] max-w-[1000px] max-h-[1000px] mx-auto aspect-square bg-[#1a0f08] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10" :style="{ backgroundColor: '#2a1a10' }">
    
    <!-- UNIVERSAL PARCHÍS BOARD (4, 6, 8 PLAYERS) -->
    <svg viewBox="-700 -700 1400 1400" class="w-full h-full drop-shadow-2xl">
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
        <polygon v-if="sq.isSeguro || sq.isSalida" points="0,-12 3.5,-3.5 12,-3.5 5,2 7.5,10.5 0,6 -7.5,10.5 -5,2 -12,-3.5 -3.5,-3.5" fill="#fcd34d" stroke="#b45309" stroke-width="1.5" stroke-linejoin="round" :transform="`translate(${sq.cx}, ${sq.cy}) rotate(${sq.rot}) scale(1.1)`" filter="url(#glow)" />
      </g>

      <!-- Final Center Triangles -->
      <g v-for="(sq, i) in finalTriangles" :key="'final'+i">
        <polygon :points="sq.points" :fill="sq.color" stroke="#111" stroke-width="2" filter="url(#inner-shadow)" />
        <polygon points="0,-12 3.5,-3.5 12,-3.5 5,2 7.5,10.5 0,6 -7.5,10.5 -5,2 -12,-3.5 -3.5,-3.5" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" stroke-linejoin="round" :transform="`translate(${sq.cx}, ${sq.cy}) rotate(${sq.rot}) scale(1.3)`" filter="url(#glow)" />
      </g>

      <!-- Nests (Bases) -->
      <g v-for="(nest, i) in nests" :key="'nest'+i">
        <!-- Shadow -->
        <circle :cx="nest.cx + 5" :cy="nest.cy + 5" :r="nest.r" fill="#000" opacity="0.4" filter="url(#glow)" />
        <!-- Main Base -->
        <circle :cx="nest.cx" :cy="nest.cy" :r="nest.r" :fill="nest.color" stroke="#111" stroke-width="6" opacity="0.95" />
        <!-- Inner ring -->
        <circle :cx="nest.cx" :cy="nest.cy" :r="nest.r * 0.75" fill="#fff" opacity="0.1" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
        <!-- Token spots -->
        <circle :cx="nest.cx - nest.offset" :cy="nest.cy - nest.offset" r="22" fill="#000" opacity="0.3" filter="url(#inner-shadow)" />
        <circle :cx="nest.cx + nest.offset" :cy="nest.cy - nest.offset" r="22" fill="#000" opacity="0.3" filter="url(#inner-shadow)" />
        <circle :cx="nest.cx - nest.offset" :cy="nest.cy + nest.offset" r="22" fill="#000" opacity="0.3" filter="url(#inner-shadow)" />
        <circle :cx="nest.cx + nest.offset" :cy="nest.cy + nest.offset" r="22" fill="#000" opacity="0.3" filter="url(#inner-shadow)" />
      </g>
    </svg>

    <!-- Render Tokens (HTML Overlay) -->
    <div class="absolute inset-0 z-10 pointer-events-none">
      <ParchisToken 
        v-for="(tokenObj, i) in allTokens" 
        :key="`${tokenObj.player.userId}-${tokenObj.token.id}`"
        :token="tokenObj.data"
        :figureId="tokenObj.player.selectedFigure"
        :coordinates="tokenObj.coords"
        :boardSize="1400"
      />
    </div>

    <!-- Player HUD -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-[#1a0f08]/95 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 pointer-events-auto">
      <div class="flex items-center gap-2">
        <div 
          v-for="(player, idx) in parchisStore.players" 
          :key="player.userId"
          :class="['w-10 h-10 rounded-full border-2 shadow-inner bg-cover bg-center transition-all duration-300', 
            idx === parchisStore.currentTurnIndex ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-white/20 opacity-50 grayscale'
          ]"
          :style="{ backgroundColor: getColor(player.color), backgroundImage: player.avatar ? `url(${player.avatar})` : 'none' }"
        ></div>
      </div>
      <div class="h-8 w-[1px] bg-white/20"></div>
      
      <div class="flex flex-col items-center gap-1">
        <ParchisDice :diceValues="parchisStore.diceValue.length ? parchisStore.diceValue : []" />
        <div v-if="parchisStore.availableMoves.length > 0 && parchisStore.isMyTurn" class="text-xs text-white bg-green-600/90 px-2 py-0.5 rounded animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]">
          Mueve: {{ parchisStore.availableMoves.join(', ') }}
        </div>
      </div>

      <div class="h-8 w-[1px] bg-white/20"></div>
      <button 
        @click="rollDice"
        :disabled="!parchisStore.isMyTurn || parchisStore.availableMoves.length > 0"
        :class="[
          'px-6 py-2 font-bold rounded-full transition-all shadow-lg cursor-pointer',
          parchisStore.isMyTurn && parchisStore.availableMoves.length === 0 
            ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(217,119,6,0.6)] border border-orange-400/50' 
            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
        ]"
      >
        Tirar Dados
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ParchisToken from "./ParchisToken.vue";
import ParchisDice from "./ParchisDice.vue";
import { useParchisStore } from "~/stores/games/parchisStore";
import { useSocket } from "~/composables/useSocket";

const parchisStore = useParchisStore();
const { socket } = useSocket();

const rollDice = () => {
	if (parchisStore.isMyTurn) {
		socket.value?.emit("parchis:roll_dice");
	}
};

const colorPalette = [
	"#eab308",
	"#3b82f6",
	"#ef4444",
	"#4ade80",
	"#a855f7",
	"#f97316",
	"#ec4899",
	"#06b6d4",
];
const getColor = (colorStr: string) => {
	const map: Record<string, string> = {
		green: "#4ade80",
		blue: "#3b82f6",
		red: "#ef4444",
		yellow: "#eab308",
		purple: "#a855f7",
		orange: "#f97316",
	};
	return map[colorStr] || colorStr;
};

const sides = computed(() => parchisStore.rules?.parchisBoardSize || 4);

function rotatePoint(x: number, y: number, degrees: number) {
	const rad = (degrees * Math.PI) / 180;
	return {
		x: x * Math.cos(rad) - y * Math.sin(rad),
		y: x * Math.sin(rad) + y * Math.cos(rad),
	};
}

function getRightCellPolygon(y_bot: number, y_top: number, M: number) {
	const x_bot = Math.abs(y_bot) * M; 
	const x_top = Math.abs(y_top) * M;
	
	const pts = [];
	pts.push({ x: 25, y: y_bot });
	if (x_bot >= 75) pts.push({ x: 75, y: y_bot });
	else pts.push({ x: x_bot, y: y_bot });
	
	if (x_bot < 75 && x_top > 75) pts.push({ x: 75, y: -75 / M });
	
	if (x_top >= 75) pts.push({ x: 75, y: y_top });
	else pts.push({ x: x_top, y: y_top });
	
	pts.push({ x: 25, y: y_top });
	
	const uniquePts: {x: number, y: number}[] = [];
	pts.forEach(p => {
		if (uniquePts.length === 0 || Math.abs(uniquePts[uniquePts.length - 1].x - p.x) > 0.1 || Math.abs(uniquePts[uniquePts.length - 1].y - p.y) > 0.1) {
			uniquePts.push(p);
		}
	});
	return uniquePts;
}

function getLeftCellPolygon(y_bot: number, y_top: number, M: number) {
	const rightPts = getRightCellPolygon(y_bot, y_top, M);
	return rightPts.map(p => ({ x: -p.x, y: p.y })).reverse();
}

const basePolygonPoints = computed(() => {
	const N = sides.value;
	const M = Math.tan(Math.PI / N);
	const R_c = 25 / M;
	const padding = 60;
	const R_max = R_c + 400 + padding;
	const pts = [];
	for (let i = 0; i < N; i++) {
		// Counter Clockwise
		const pt = rotatePoint(R_max * M, -R_max, -i * (360 / N));
		pts.push(`${pt.x},${pt.y}`);
	}
	return pts.join(" ");
});

const boardGeometry = computed(() => {
	const N = sides.value;
	const M = Math.tan(Math.PI / N);
	const R_c = 25 / M;

	const trackSquares: any[] = [];
	const llegadaPaths: any[] = [];
	const finalTriangles: any[] = [];
	const nests: any[] = [];
	const coordsMap = {
		track: [] as {x: number, y: number}[],
		meta: [] as {x: number, y: number}[][],
		nests: [] as {x: number, y: number, offset: number}[],
	};

	const toPts = (pts: {x: number, y: number}[], angle: number) => {
		return pts.map(p => {
			const rot = rotatePoint(p.x, p.y, angle);
			return `${rot.x},${rot.y}`;
		}).join(" ");
	};

	const toCenter = (pts: {x: number, y: number}[], angle: number) => {
		let sumX = 0, sumY = 0;
		pts.forEach(p => { sumX += p.x; sumY += p.y; });
		const cx = sumX / pts.length;
		const cy = sumY / pts.length;
		return rotatePoint(cx, cy, angle);
	};

	for (let p = 0; p < N; p++) {
		const armAngle = -p * (360 / N); // Counter-Clockwise flow
		const baseColor = colorPalette[p % colorPalette.length];

		// 1. Left Column (Outbound - Salida) -> indices 0-7
		for (let row = 0; row < 8; row++) {
			let y_bot = -R_c - row * 50;
			let y_top = -R_c - (row + 1) * 50;
			let pts = getLeftCellPolygon(y_bot, y_top, M);
			
			let globalIndex = p * 17 + row;
			let isSalida = (row === 4);
			let fill = isSalida ? baseColor : "#f5ebd5";
			let center = toCenter(pts, armAngle);
			
			trackSquares.push({
				points: toPts(pts, armAngle),
				fill,
				isSalida, isSeguro: false, isTip: false,
				cx: center.x, cy: center.y, rot: armAngle
			});
			coordsMap.track[globalIndex] = center;
		}

		// 2. Tip (Turnaround) -> index 8
		let tipY_bot = -R_c - 400;
		let tipY_top = tipY_bot - 50;
		let tipPts = [
			{x: -75, y: tipY_bot},
			{x: 75, y: tipY_bot},
			{x: 75, y: tipY_top},
			{x: -75, y: tipY_top}
		];
		let tipCenter = toCenter(tipPts, armAngle);
		trackSquares.push({
			points: toPts(tipPts, armAngle),
			fill: "#fcd34d",
			isSalida: false, isSeguro: true, isTip: true,
			cx: tipCenter.x, cy: tipCenter.y, rot: armAngle
		});
		coordsMap.track[p * 17 + 8] = tipCenter;

		// 3. Right Column (Inbound - Llegada) -> indices 9-16
		for (let row = 7; row >= 0; row--) {
			let y_bot = -R_c - row * 50;
			let y_top = -R_c - (row + 1) * 50;
			let pts = getRightCellPolygon(y_bot, y_top, M);
			
			let i = 16 - row;
			let globalIndex = p * 17 + i;
			let isSeguro = (row === 4); 
			let fill = isSeguro ? "#fcd34d" : "#f5ebd5";
			let center = toCenter(pts, armAngle);

			trackSquares.push({
				points: toPts(pts, armAngle),
				fill,
				isSalida: false, isSeguro, isTip: false,
				cx: center.x, cy: center.y, rot: armAngle
			});
			coordsMap.track[globalIndex] = center;
		}

				// 4. Meta Column (7 rectangular cells + 1 triangle)
		coordsMap.meta[p] = [];
		for (let row = 0; row < 7; row++) {
			// To align the grid lines with the side columns, 
			// the 7 rectangles must perfectly match the 7 outer cells of the side columns.
			// The side columns have 8 cells total (1 base trapezoid + 7 rectangles).
			// The tip is at -R_c - 400. The base of the rectangles is at -R_c - 50.
			// So row 0 of Meta (closest to Tip) is from -350 to -400.
			let y_bot = -R_c - 400 + (row + 1) * 50;
			let y_top = -R_c - 400 + row * 50;
			let pts = [
				{x: -25, y: y_bot},
				{x: 25, y: y_bot},
				{x: 25, y: y_top},
				{x: -25, y: y_top}
			];
			let center = toCenter(pts, armAngle);
			llegadaPaths.push({
				points: toPts(pts, armAngle),
				color: baseColor,
				isFinal: false,
				cx: center.x, cy: center.y, rot: armAngle
			});
			coordsMap.meta[p][row] = center;
		}
		
		// Final Triangle touches exactly (0,0) and covers the remaining space from -R_c - 50 to 0.
		// Actually, the trapezoids occupy the space from -R_c to -R_c - 50.
		// The triangle should start at -R_c - 50 and point to 0,0?
		// No, the trapezoids connect the outer columns. The middle column has a gap from -R_c to -R_c - 50.
		// Let's make the triangle start at -R_c - 50, but we also want it to look good.
		// If it starts at -R_c - 50, the base is 50px wide.
		let triPts = [
			{x: -25, y: -R_c - 50},
			{x: 25, y: -R_c - 50},
			{x: 0, y: 0}
		];
		let triCenter = rotatePoint(0, -R_c - 15, armAngle); 
		finalTriangles.push({
			points: toPts(triPts, armAngle),
			color: baseColor,
			cx: triCenter.x, cy: triCenter.y, rot: armAngle
		});
		coordsMap.meta[p][7] = triCenter;
		// 5. Nests
		// Nests are on the LEFT side of the arm to match the LEFT column Salida.
		let nestAngle = armAngle - (180 / N);
		let nestRadius = N === 4 ? 120 : N === 6 ? 90 : 75;
		let nestDist = (nestRadius + 95) / Math.sin(Math.PI / N);
		let nestCenter = rotatePoint(0, -nestDist, nestAngle);
		let tokenOffset = N === 4 ? 30 : N === 6 ? 24 : 18;

		nests.push({
			cx: nestCenter.x,
			cy: nestCenter.y,
			color: baseColor,
			r: nestRadius,
			offset: tokenOffset
		});
		coordsMap.nests[p] = { x: nestCenter.x, y: nestCenter.y, offset: tokenOffset };
	}

	// Center black star
	const polyPts = [];
	for (let p = 0; p < N; p++) {
		const armAngle = -p * (360 / N);
		let p1 = rotatePoint(-25, -R_c, armAngle);
		let p2 = rotatePoint(25, -R_c, armAngle);
		let intersectionRadius = R_c / Math.cos(Math.PI / N);
		let intersectionPt = rotatePoint(0, -intersectionRadius, armAngle + 180 / N);
		
		polyPts.push(`${p1.x},${p1.y}`);
		polyPts.push(`${p2.x},${p2.y}`);
		polyPts.push(`${intersectionPt.x},${intersectionPt.y}`);
	}

	return {
		trackSquares,
		llegadaPaths,
		finalTriangles,
		nests,
		centerPolygon: polyPts.join(" "),
		coordsMap
	};
});

const trackSquares = computed(() => boardGeometry.value.trackSquares);
const llegadaPaths = computed(() => boardGeometry.value.llegadaPaths);
const finalTriangles = computed(() => boardGeometry.value.finalTriangles);
const nests = computed(() => boardGeometry.value.nests);
const centerPolygon = computed(() => boardGeometry.value.centerPolygon);

const allTokens = computed(() => {
	const tokens: any[] = [];
	const coordsMap = boardGeometry.value.coordsMap;

	parchisStore.players.forEach((player: any, pIdx: number) => {
		if (!player.tokens) return;

		const baseP = pIdx % sides.value;

		player.tokens.forEach((token: any, tIdx: number) => {
			let tokenCoords = { x: 0, y: 0 };

			if (token.state === "HOME") {
				const nest = coordsMap.nests[baseP];
				if (nest) {
					const offset = nest.offset;
					const positions = [
						{ x: nest.x - offset, y: nest.y - offset },
						{ x: nest.x + offset, y: nest.y - offset },
						{ x: nest.x - offset, y: nest.y + offset },
						{ x: nest.x + offset, y: nest.y + offset },
					];
					tokenCoords = positions[tIdx % 4] || { x: 0, y: 0 };
				}
			} else if (token.state === "BOARD" || token.state === "TRACK") {
				const trackCell = coordsMap.track[
					token.position % (sides.value * 17)
				] as any;
				if (trackCell) {
					// Token Stacking Logic
					let occupants = 0;
					let myIndexInCell = 0;
					parchisStore.players.forEach((p: any) => {
						p.tokens?.forEach((t: any) => {
							if ((t.state === "BOARD" || t.state === "TRACK") && (t.position % (sides.value * 17)) === (token.position % (sides.value * 17))) {
								if (p.userId === player.userId && t.id === token.id) {
									myIndexInCell = occupants;
								}
								occupants++;
							}
						});
					});
					
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
			} else if (token.state === "META") {
				const corridorCell = coordsMap.meta[baseP]?.[token.position - 1] as any;
				if (corridorCell)
					tokenCoords = { x: corridorCell.x, y: corridorCell.y };
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
