<template>
  <div class="relative w-[95vmin] h-[95vmin] max-w-[1200px] max-h-[1200px] mx-auto aspect-square bg-[#1a0f08] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10" :style="{ backgroundColor: '#2a1a10' }">
    
    <!-- UNIVERSAL PARCHÍS BOARD (4, 6, 8 PLAYERS) -->
    <svg viewBox="-800 -800 1600 1600" class="w-full h-full drop-shadow-2xl">
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
      <rect v-if="sides === 4" x="-750" y="-750" width="1500" height="1500" rx="80" fill="#4a2e1b" stroke="#7a4b2b" stroke-width="20" />
      <circle v-else cx="0" cy="0" r="780" fill="#4a2e1b" stroke="#7a4b2b" stroke-width="20" />

      <!-- Center Goal Polygon -->
      <polygon :points="centerPolygon" fill="#111" stroke="#333" stroke-width="8"/>

      <!-- Meta / Llegadas (Middle column of each arm) -->
      <g v-for="(sq, i) in llegadaPaths" :key="'llegada'+i">
        <path :d="sq.d" :fill="sq.color" stroke="#111" stroke-width="2" filter="url(#inner-shadow)" />
        <polygon v-if="sq.isFinal" points="0,-12 3.5,-3.5 12,-3.5 5,2 7.5,10.5 0,6 -7.5,10.5 -5,2 -12,-3.5 -3.5,-3.5" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" stroke-linejoin="round" :transform="`translate(${sq.cx}, ${sq.cy}) rotate(${sq.rot}) scale(1.3)`" filter="url(#glow)" />
      </g>

      <!-- Track Squares (Radial Arms with Trapezoids at base) -->
      <g v-for="(sq, i) in trackSquares" :key="'sq'+i">
        <path :d="sq.d" :fill="sq.fill" stroke="#222" stroke-width="2" />
        <!-- Highlight borders for Salida/Seguro/Tip -->
        <path v-if="sq.isSalida || sq.isSeguro || sq.isTip" :d="sq.d" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4" />
        
        <!-- Star Icon for Salida/Seguro -->
        <polygon v-if="sq.isSeguro || sq.isSalida" points="0,-12 3.5,-3.5 12,-3.5 5,2 7.5,10.5 0,6 -7.5,10.5 -5,2 -12,-3.5 -3.5,-3.5" fill="#fcd34d" stroke="#b45309" stroke-width="1.5" stroke-linejoin="round" :transform="`translate(${sq.cx}, ${sq.cy}) rotate(${sq.rot}) scale(1.1)`" filter="url(#glow)" />
      </g>

      <!-- Center Hole overlay -->
      <polygon :points="centerPolygon" fill="#111" stroke="#333" stroke-width="6"/>

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
        :boardSize="1600"
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

const boardGeometry = computed(() => {
	const N = sides.value;

	const trackSquares: any[] = [];
	const llegadaPaths: any[] = [];
	const nests: any[] = [];
	const coordsMap = {
		track: [] as any[],
		meta: [] as any[],
		nests: [] as any[],
	};

	const rowHeight = 50;
	// Compute base innerRadius where the arms would be 150px wide
	const baseInnerRadius = 75 / Math.tan(Math.PI / N);
	// Pull the arms 1 row inward to form perfect trapezoids at the base
	const innerRadius = baseInnerRadius - 50;

	for (let p = 0; p < N; p++) {
		const armAngle = -p * (360 / N);
		const baseColor = colorPalette[p % colorPalette.length];

		// RADIAL ARM TRACK (17 squares per quadrant)
		for (let i = 0; i < 17; i++) {
			let globalIndex = p * 17 + i;
			let cx = 0,
				cy = 0,
				d = "",
				fill = "#f5ebd5",
				rot = armAngle;
			let isSalida = false;
			let isSeguro = false;
			let isTip = false;

			if (i < 8) {
				// Going UP the RIGHT column of the arm
				let row = i; // 0 to 7
				let localY = -innerRadius - (row + 1) * rowHeight;
				let localYBottom = -innerRadius - row * rowHeight;

				let p1, p2, p3, p4;

				if (i === 0) {
					// BASE SQUARE RIGHT COLUMN (Trapezoid to close the gap)
					// Mathematically enforce the outer edge to perfectly match square 1
					let xBaseInner = Math.abs(localYBottom) * Math.tan(Math.PI / N);
					let xBaseOuter = 75; // Ensures no "casillas separadas"

					p1 = rotatePoint(25, localYBottom, armAngle);
					p2 = rotatePoint(xBaseInner, localYBottom, armAngle);
					p3 = rotatePoint(xBaseOuter, localY, armAngle);
					p4 = rotatePoint(25, localY, armAngle);

					// Calculate center for token placing (centroid of trapezoid at mid-Y)
					let midY = localYBottom - 25;
					let midOuterX = Math.abs(midY) * Math.tan(Math.PI / N);
					let ptCenter = rotatePoint(
						(25 + midOuterX) / 2,
						midY,
						armAngle,
					);
					cx = ptCenter.x;
					cy = ptCenter.y;
				} else {
					let localX = 25;
					p1 = rotatePoint(localX, localYBottom, armAngle);
					p2 = rotatePoint(localX + 50, localYBottom, armAngle);
					p3 = rotatePoint(localX + 50, localY, armAngle);
					p4 = rotatePoint(localX, localY, armAngle);

					let ptCenter = rotatePoint(localX + 25, localYBottom - 25, armAngle);
					cx = ptCenter.x;
					cy = ptCenter.y;
				}

				d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;

				if (i === 4) {
					isSalida = true;
					fill = baseColor; // Start square matches player color
				}
			} else if (i === 8) {
				// TIP of the arm (Turnaround). Spans all 3 columns
				let localY = -innerRadius - 8 * rowHeight - 50;
				let localYBottom = -innerRadius - 8 * rowHeight;

				let p1 = rotatePoint(-75, localYBottom, armAngle);
				let p2 = rotatePoint(75, localYBottom, armAngle);
				let p3 = rotatePoint(75, localY, armAngle);
				let p4 = rotatePoint(-75, localY, armAngle);
				d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;

				let ptCenter = rotatePoint(0, localYBottom - 25, armAngle);
				cx = ptCenter.x;
				cy = ptCenter.y;

				isSeguro = true;
				isTip = true;
				fill = "#fcd34d"; // Safe corner color
			} else {
				// Going DOWN the LEFT column of the arm
				let row = 16 - i; // i=9 -> row=7, i=16 -> row=0
				let localY = -innerRadius - (row + 1) * rowHeight;
				let localYBottom = -innerRadius - row * rowHeight;

				let p1, p2, p3, p4;

				if (i === 16) {
					// BASE SQUARE LEFT COLUMN (Trapezoid to close the gap)
					let xBaseInner = -Math.abs(localYBottom) * Math.tan(Math.PI / N);
					let xBaseOuter = -75; // Ensures no "casillas separadas"

					p1 = rotatePoint(xBaseInner, localYBottom, armAngle);
					p2 = rotatePoint(-25, localYBottom, armAngle);
					p3 = rotatePoint(-25, localY, armAngle);
					p4 = rotatePoint(xBaseOuter, localY, armAngle);

					let midY = localYBottom - 25;
					let midOuterX = -Math.abs(midY) * Math.tan(Math.PI / N);
					let ptCenter = rotatePoint(
						(-25 + midOuterX) / 2,
						midY,
						armAngle,
					);
					cx = ptCenter.x;
					cy = ptCenter.y;
				} else {
					let localX = -75;
					p1 = rotatePoint(localX, localYBottom, armAngle);
					p2 = rotatePoint(localX + 50, localYBottom, armAngle);
					p3 = rotatePoint(localX + 50, localY, armAngle);
					p4 = rotatePoint(localX, localY, armAngle);

					let ptCenter = rotatePoint(localX + 25, localYBottom - 25, armAngle);
					cx = ptCenter.x;
					cy = ptCenter.y;
				}

				d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;

				if (i === 12) {
					isSeguro = true;
					fill = "#fcd34d";
				}
			}

			trackSquares.push({
				d,
				fill,
				isSalida,
				isSeguro,
				isTip,
				cx,
				cy,
				rot,
			});
			coordsMap.track[globalIndex] = { x: cx, y: cy };
		}

		// META (Llegadas) - Middle column touches the center hole
		coordsMap.meta[p] = [];
		for (let r = 0; r < 8; r++) {
			let localY = -innerRadius - (8 - r) * rowHeight;
			let localYBottom = localY + 50;

			let p1 = rotatePoint(-25, localYBottom, armAngle);
			let p2 = rotatePoint(25, localYBottom, armAngle);
			let p3 = rotatePoint(25, localY, armAngle);
			let p4 = rotatePoint(-25, localY, armAngle);
			let d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;

			let ptCenter = rotatePoint(0, localYBottom - 25, armAngle);
			let isFinal = r === 7;

			llegadaPaths.push({
				d,
				color: baseColor,
				cx: ptCenter.x,
				cy: ptCenter.y,
				rot: armAngle,
				isFinal,
			});
			coordsMap.meta[p][r] = { x: ptCenter.x, y: ptCenter.y };
		}

		// NESTS (Bases) - Pushed deeply into the V-gap
		let nestAngle = armAngle - 360 / N / 2;
		let nestRadius = N === 4 ? 120 : N === 6 ? 100 : 80;
		// Push the nest closer to the center hole to clear the arm tips
		let nestDist = baseInnerRadius + nestRadius + (N === 4 ? 60 : 30);

		let tokenOffset = N === 4 ? 45 : N === 6 ? 35 : 28;
		let pt = rotatePoint(0, -nestDist, nestAngle);

		nests.push({
			cx: pt.x,
			cy: pt.y,
			color: baseColor,
			r: nestRadius,
			offset: tokenOffset,
		});
		coordsMap.nests[p] = { x: pt.x, y: pt.y, offset: tokenOffset };
	}

	// CENTER POLYGON (Star-shaped hole that touches the trapezoids)
	const polyPts: string[] = [];
	for (let p = 0; p < N; p++) {
		// Middle column bases
		let p1 = rotatePoint(-25, -innerRadius, (p * 360) / N);
		let p2 = rotatePoint(25, -innerRadius, (p * 360) / N);

		// The inner intersection point of the trapezoids on the bisector line
		let intersectionRadius = innerRadius / Math.cos(Math.PI / N);
		let intersectionPt = rotatePoint(
			0,
			-intersectionRadius,
			(p * 360) / N + 360 / (2 * N),
		);

		polyPts.push(`${p1.x},${p1.y}`);
		polyPts.push(`${p2.x},${p2.y}`);
		polyPts.push(`${intersectionPt.x},${intersectionPt.y}`);
	}

	return {
		trackSquares,
		llegadaPaths,
		nests,
		centerPolygon: polyPts.join(" "),
		coordsMap,
	};
});

const trackSquares = computed(() => boardGeometry.value.trackSquares);
const llegadaPaths = computed(() => boardGeometry.value.llegadaPaths);
const nests = computed(() => boardGeometry.value.nests);
const centerPolygon = computed(() => boardGeometry.value.centerPolygon);

const allTokens = computed(() => {
	const tokens: any[] = [];
	const coordsMap = boardGeometry.value.coordsMap;

	parchisStore.players.forEach((player, pIdx) => {
		if (!player.tokens) return;

		const baseP = pIdx % sides.value;

		player.tokens.forEach((token, tIdx) => {
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
					// Check how many tokens are in this exact cell across ALL players
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
						// Small scatter based on index
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
