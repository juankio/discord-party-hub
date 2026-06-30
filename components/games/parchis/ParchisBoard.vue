<template>
  <div class="relative w-full h-full flex flex-col items-center justify-start sm:justify-center gap-6 sm:gap-8 overflow-x-hidden overflow-y-auto pb-36 xl:pb-8 xl:overflow-hidden xl:flex-row xl:items-start xl:justify-center xl:p-8">
    
    <!-- Tablero contenedor dinámico (Se adapta con CSS functions) -->
    <div class="w-full flex items-center justify-center min-h-0 relative z-0 p-2 sm:p-4 mt-2 sm:mt-0 flex-1">
      <div 
        class="relative aspect-square mx-auto bg-[#2a1a10] rounded-3xl sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden ring-[1px] ring-white/20 border-[3px] sm:border-[4px] border-[#4a2e1b] shrink-0" 
        style="width: 100%; max-width: min(100%, calc(100dvh - 200px)); max-height: 1000px;"
      >
        <!-- UNIVERSAL PARCHÍS BOARD (4, 6, 8 PLAYERS) -->
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
            :boardSize="dynamicBoardSize"
          />
        </div>
      </div>
    </div>

    <!-- Player HUD (Fijo abajo en mobile, Panel Izquierdo en Desktop) -->
    <div class="w-full sm:max-w-[800px] xl:max-w-[280px] shrink-0 z-50 pointer-events-auto px-2 sm:px-4 fixed bottom-4 left-0 right-0 mx-auto xl:absolute xl:bottom-auto xl:left-4 xl:top-1/2 xl:-translate-y-1/2 xl:right-auto">
      <div class="flex flex-col sm:flex-row xl:flex-col items-center justify-between xl:justify-center gap-3 sm:gap-4 xl:gap-8 bg-[#1a0f08]/95 backdrop-blur-2xl px-4 py-3 sm:px-6 sm:py-4 xl:py-8 rounded-[1.5rem] border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative overflow-hidden ring-1 ring-white/5">
        
        <!-- Glow ambiental -->
        <div class="absolute -top-10 -left-10 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full pointer-events-none"></div>
        <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>

        <!-- Avatares de Jugadores -->
        <div class="flex items-center gap-1 sm:gap-3 relative z-10 w-full sm:w-auto xl:w-full justify-center flex-wrap xl:grid xl:grid-cols-4 xl:gap-3">
          <div 
            v-for="(player, idx) in parchisStore.players" 
            :key="player.userId"
            :class="['w-8 h-8 sm:w-12 sm:h-12 shrink-0 rounded-full border-[2px] shadow-inner bg-cover bg-center transition-all duration-300 relative mx-auto', 
              idx === parchisStore.currentTurnIndex ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10' : 'border-white/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
            ]"
            :style="{ backgroundColor: getColor(player.color), backgroundImage: player.avatarId ? `url(/avatars/avatar-${player.avatarId}.svg)` : 'none' }"
          >
            <!-- Turn Indicator Dot -->
            <div v-if="idx === parchisStore.currentTurnIndex" class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-[#1a0f08] shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse"></div>
          </div>
        </div>
        
        <!-- Separator Desktop/Tablet -->
        <div class="hidden sm:block xl:hidden h-10 w-[1px] bg-white/10 relative z-10"></div>
        <div class="hidden xl:block w-full h-[1px] bg-white/10 relative z-10"></div>
        
        <!-- Mobile Bottom Row / Desktop Vertical Stack: Dice + Button -->
        <div class="flex w-full sm:w-auto xl:w-full flex-row sm:flex-row xl:flex-col items-center justify-between sm:justify-center xl:justify-center gap-3 sm:gap-4 xl:gap-6">
          
          <!-- Indicator: Tu Color -->
          <div v-if="myPlayer" class="hidden xl:flex items-center gap-2 relative z-10 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 w-full justify-center">
            <span class="text-xs font-bold text-white/50 tracking-wider">TU COLOR</span>
            <div class="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" :style="{ backgroundColor: getColor(myPlayer.color), color: getColor(myPlayer.color) }"></div>
            <span class="text-xs font-black uppercase" :style="{ color: getColor(myPlayer.color) }">{{ colorNameEs(myPlayer.color) }}</span>
          </div>

          <!-- Zona Central: Dados y Move Text -->
          <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 relative z-10 min-h-[50px] flex-1 sm:flex-none xl:w-full">
            <ParchisDice :diceValues="parchisStore.diceValue.length ? parchisStore.diceValue : []" />
            
            <div class="h-[20px] sm:h-[24px] flex items-center justify-center"> <!-- Espacio fijo UI -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div v-if="parchisStore.availableMoves.length > 0 && parchisStore.isMyTurn" class="text-[9px] sm:text-xs font-bold tracking-wider text-green-300 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-md shadow-[0_0_15px_rgba(74,222,128,0.15)] whitespace-nowrap">
                  MUEVE: {{ parchisStore.availableMoves.join(', ') }}
                </div>
              </Transition>
            </div>
          </div>

          <div class="hidden sm:block xl:hidden h-10 w-[1px] bg-white/10 relative z-10"></div>
          
          <!-- Indicator: Tu Color (Mobile) -->
          <div v-if="myPlayer" class="xl:hidden flex items-center gap-1.5 relative z-10 px-2">
            <div class="w-2.5 h-2.5 rounded-full shadow-[0_0_5px_currentColor]" :style="{ backgroundColor: getColor(myPlayer.color), color: getColor(myPlayer.color) }"></div>
          </div>

          <!-- Botón de Tirar Dados -->
          <button 
            @click="rollDice"
            :disabled="!parchisStore.isMyTurn || parchisStore.availableMoves.length > 0"
            :class="[
              'flex-1 sm:flex-none xl:w-full px-4 py-2 sm:px-6 sm:py-3 xl:py-4 text-[11px] sm:text-base font-black tracking-wide rounded-xl sm:rounded-2xl transition-all duration-300 relative z-10 overflow-hidden group',
              parchisStore.isMyTurn && parchisStore.availableMoves.length === 0 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_5px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-orange-400/50 cursor-pointer' 
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
            ]"
          >
            <div v-if="parchisStore.isMyTurn && parchisStore.availableMoves.length === 0" class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <span class="relative flex items-center justify-center gap-1 sm:gap-2 drop-shadow-md whitespace-nowrap">
              <UIcon v-if="parchisStore.isMyTurn && parchisStore.availableMoves.length === 0" name="i-heroicons-sparkles" class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-200" />
              TIRAR DADOS
            </span>
          </button>
        </div>
      </div>
    </div>

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
import ParchisDice from "./ParchisDice.vue";
import ParchisStatsPanel from "./ParchisStatsPanel.vue";
import { useParchisStore } from "~/stores/games/parchisStore";
import { useSocket } from "~/composables/useSocket";
import { usePlayerStore } from "~/stores/playerStore";

const showMobileStats = ref(false);

const parchisStore = useParchisStore();
const playerStore = usePlayerStore();
const { socket } = useSocket();

const myPlayer = computed(() => parchisStore.players.find(p => p.userId === playerStore.userId));

const colorNameEs = (colorStr: string) => {
	const map: Record<string, string> = {
		green: "Verde",
		blue: "Azul",
		red: "Rojo",
		yellow: "Amarillo",
		purple: "Morado",
		orange: "Naranja",
		cyan: "Cian",
		pink: "Rosa"
	};
	return map[colorStr] || colorStr;
};

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

const dynamicViewBox = computed(() => {
	const N = sides.value;
	const M = Math.tan(Math.PI / N);
	const baseInnerRadius = 75 / M;
	const innerRadius = baseInnerRadius - 50;
	const padding = 60; // Extra padding for tokens that might slightly overhang
	const R_max = innerRadius + 400 + padding; // Maximum distance to the tip of an arm
	
	// Since the board is symmetrical and centered at (0,0), the viewBox is a square from -R_max to R_max
	const size = R_max * 2;
	return `${-R_max} ${-R_max} ${size} ${size}`;
});

const dynamicBoardSize = computed(() => {
	const N = sides.value;
	const M = Math.tan(Math.PI / N);
	const baseInnerRadius = 75 / M;
	const innerRadius = baseInnerRadius - 50;
	const padding = 60;
	const R_max = innerRadius + 400 + padding;
	return R_max * 2;
});

const basePolygonPoints = computed(() => {
	const N = sides.value;
	const M = Math.tan(Math.PI / N);
	const baseInnerRadius = 75 / M;
	const innerRadius = baseInnerRadius - 50;
	const padding = 60;
	const R_max = innerRadius + 400 + padding;
	const pts = [];
	for (let i = 0; i < N; i++) {
		const pt = rotatePoint(R_max * M, -R_max, i * (360 / N));
		pts.push(`${pt.x},${pt.y}`);
	}
	return pts.join(" ");
});

const boardGeometry = computed(() => {
	const N = sides.value;
	const M = Math.tan(Math.PI / N);
	const baseInnerRadius = 75 / M;
	const innerRadius = baseInnerRadius - 50;
	const rowHeight = 50;

	const trackSquares: any[] = [];
	const llegadaPaths: any[] = [];
	const nests: any[] = [];
	const coordsMap = {
		track: [] as {x: number, y: number}[],
		meta: [] as {x: number, y: number}[],
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
		const armAngle = p * (360 / N); // Clockwise flow
		const baseColor = colorPalette[p % colorPalette.length];

		// 1. Left Column (Outbound - Salida) -> indices 0-7
		for (let row = 0; row < 8; row++) {
			let y_bot = -innerRadius - row * rowHeight;
			let y_top = -innerRadius - (row + 1) * rowHeight;
			let pts: {x: number, y: number}[], center: {x: number, y: number};

			if (row === 0) {
				// Base Trapezoid LEFT COLUMN
				let xBaseInner = -Math.abs(y_bot) * M;
				let xBaseOuter = -75; // Align perfectly with row 1
				pts = [
					{ x: xBaseInner, y: y_bot },
					{ x: -25, y: y_bot },
					{ x: -25, y: y_top },
					{ x: xBaseOuter, y: y_top }
				];
				let midY = y_bot - 25;
				let midOuterX = -Math.abs(midY) * M;
				center = rotatePoint((-25 + midOuterX) / 2, midY, armAngle);
			} else {
				pts = [
					{ x: -75, y: y_bot },
					{ x: -25, y: y_bot },
					{ x: -25, y: y_top },
					{ x: -75, y: y_top }
				];
				center = rotatePoint(-50, y_bot - 25, armAngle);
			}
			
			let globalIndex = p * 17 + row;
			let isSalida = (row === 4); // Mitad del brazo (Salida Clásica)
			let fill = isSalida ? baseColor : "#f5ebd5";
			
			trackSquares.push({
				points: toPts(pts, armAngle),
				fill,
				isSalida, isSeguro: false, isTip: false,
				cx: center.x, cy: center.y, rot: armAngle
			});
			coordsMap.track[globalIndex] = center;
		}

		// 2. Tip (Turnaround) -> index 8
		let tipY_bot = -innerRadius - 400;
		let tipY_top = tipY_bot - 50;
		let tipPts = [
			{x: -75, y: tipY_bot},
			{x: 75, y: tipY_bot},
			{x: 75, y: tipY_top},
			{x: -75, y: tipY_top}
		];
		let tipCenter = rotatePoint(0, tipY_bot - 25, armAngle);
		trackSquares.push({
			points: toPts(tipPts, armAngle),
			fill: "#fcd34d",
			isSalida: false, isSeguro: true, isTip: true,
			cx: tipCenter.x, cy: tipCenter.y, rot: armAngle
		});
		coordsMap.track[p * 17 + 8] = tipCenter;

		// 3. Right Column (Inbound - Llegada) -> indices 9-16
		for (let row = 7; row >= 0; row--) {
			let y_bot = -innerRadius - row * rowHeight;
			let y_top = -innerRadius - (row + 1) * rowHeight;
			let pts: {x: number, y: number}[], center: {x: number, y: number};

			if (row === 0) {
				// Base Trapezoid RIGHT COLUMN
				let xBaseInner = Math.abs(y_bot) * M;
				let xBaseOuter = 75; // Align perfectly with row 1
				pts = [
					{ x: 25, y: y_bot },
					{ x: xBaseInner, y: y_bot },
					{ x: xBaseOuter, y: y_top },
					{ x: 25, y: y_top }
				];
				let midY = y_bot - 25;
				let midOuterX = Math.abs(midY) * M;
				center = rotatePoint((25 + midOuterX) / 2, midY, armAngle);
			} else {
				pts = [
					{ x: 25, y: y_bot },
					{ x: 75, y: y_bot },
					{ x: 75, y: y_top },
					{ x: 25, y: y_top }
				];
				center = rotatePoint(50, y_bot - 25, armAngle);
			}
			
			let i = 16 - row;
			let globalIndex = p * 17 + i;
			let isSeguro = (row === 4); // Mitad del brazo
			let fill = isSeguro ? "#fcd34d" : "#f5ebd5";

			trackSquares.push({
				points: toPts(pts, armAngle),
				fill,
				isSalida: false, isSeguro, isTip: false,
				cx: center.x, cy: center.y, rot: armAngle
			});
			coordsMap.track[globalIndex] = center;
		}

		// 4. Meta Column (8 rectangular cells)
		coordsMap.meta[p] = [];
		for (let row = 0; row < 8; row++) {
			let y_bot = -innerRadius - 400 + (row + 1) * 50;
			let y_top = -innerRadius - 400 + row * 50;
			let pts = [
				{x: -25, y: y_bot},
				{x: 25, y: y_bot},
				{x: 25, y: y_top},
				{x: -25, y: y_top}
			];
			let center = rotatePoint(0, y_bot - 25, armAngle);
			llegadaPaths.push({
				points: toPts(pts, armAngle),
				color: baseColor,
				isFinal: (row === 7),
				cx: center.x, cy: center.y, rot: armAngle
			});
			coordsMap.meta[p][row] = center;
		}

		// 5. Nests
		// Left side of the arm
		let nestAngle = armAngle - (180 / N);
		let nestRadius = N === 4 ? 120 : N === 6 ? 90 : 75;
		// Distance so it rests beautifully in the V-gap
		let nestDist = ((nestRadius + 75) / Math.sin(Math.PI / N)) + 15;
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
		const armAngle = p * (360 / N);
		let p1 = rotatePoint(-25, -innerRadius, armAngle);
		let p2 = rotatePoint(25, -innerRadius, armAngle);
		let intersectionRadius = innerRadius / Math.cos(Math.PI / N);
		let intersectionPt = rotatePoint(0, -intersectionRadius, armAngle - 180 / N);
		
		polyPts.push(`${p1.x},${p1.y}`);
		polyPts.push(`${p2.x},${p2.y}`);
		polyPts.push(`${intersectionPt.x},${intersectionPt.y}`);
	}

	return {
		trackSquares,
		llegadaPaths,
		nests,
		centerPolygon: polyPts.join(" "),
		coordsMap
	};
});

const trackSquares = computed(() => boardGeometry.value.trackSquares);
const llegadaPaths = computed(() => boardGeometry.value.llegadaPaths);

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
				const corridorCell = coordsMap.meta[baseP]?.[token.position] as any;
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
