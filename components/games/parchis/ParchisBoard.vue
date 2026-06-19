<template>
  <div class="relative w-full max-w-4xl mx-auto aspect-square bg-[#1a0f08] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10" :style="{ backgroundColor: '#e6c280' }">
    
    <!-- UNIVERSAL PARCHÍS BOARD (4, 6, 8 PLAYERS) -->
    <svg viewBox="-800 -800 1600 1600" class="w-full h-full drop-shadow-2xl">
      <!-- Base Madera -->
      <rect v-if="sides === 4" x="-750" y="-750" width="1500" height="1500" rx="80" fill="#e6c280" stroke="#d4a373" stroke-width="15" />
      <circle v-else cx="0" cy="0" r="780" fill="#e6c280" stroke="#d4a373" stroke-width="15" />

      <!-- Center Goal Polygon (Drawn beneath arms) -->
      <polygon :points="centerPolygon" fill="#222" stroke="#111" stroke-width="4"/>

      <!-- Render Circular Grid (Track) -->
      <g v-for="(sq, i) in trackSquares" :key="'sq'+i">
        <path :d="sq.d" :fill="sq.fill" stroke="#111" stroke-width="2" />
        <!-- Star Icon for Salida/Seguro -->
        <polygon v-if="sq.isSeguro || sq.isSalida" points="0,-12 3.5,-3.5 12,-3.5 5,2 7.5,10.5 0,6 -7.5,10.5 -5,2 -12,-3.5 -3.5,-3.5" fill="#f59e0b" stroke="#92400e" stroke-width="1.5" stroke-linejoin="round" :transform="`translate(${sq.cx}, ${sq.cy}) rotate(${sq.rot}) scale(1.1)`" />
      </g>

      <!-- Llegadas (Meta) -->
      <g v-for="(sq, i) in llegadaPaths" :key="'llegada'+i">
        <path :d="sq.d" :fill="sq.color" stroke="#111" stroke-width="2" />
        <!-- Golden Star for final meta cell -->
        <polygon v-if="sq.isFinal" points="0,-12 3.5,-3.5 12,-3.5 5,2 7.5,10.5 0,6 -7.5,10.5 -5,2 -12,-3.5 -3.5,-3.5" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" stroke-linejoin="round" :transform="`translate(${sq.cx}, ${sq.cy}) rotate(${sq.rot}) scale(1.3)`" />
      </g>

      <!-- Center Hole overlay -->
      <polygon :points="centerPolygon" fill="#222" stroke="#111" stroke-width="4"/>

      <!-- Nests (Bases) -->
      <g v-for="(nest, i) in nests" :key="'nest'+i">
        <circle :cx="nest.cx" :cy="nest.cy" :r="nest.r" :fill="nest.color" stroke="#111" stroke-width="4" opacity="0.9" />
        <circle :cx="nest.cx" :cy="nest.cy" :r="nest.r * 0.7" fill="#fff" opacity="0.15" />
        <circle :cx="nest.cx - nest.offset" :cy="nest.cy - nest.offset" r="22" fill="#000" opacity="0.2" />
        <circle :cx="nest.cx + nest.offset" :cy="nest.cy - nest.offset" r="22" fill="#000" opacity="0.2" />
        <circle :cx="nest.cx - nest.offset" :cy="nest.cy + nest.offset" r="22" fill="#000" opacity="0.2" />
        <circle :cx="nest.cx + nest.offset" :cy="nest.cy + nest.offset" r="22" fill="#000" opacity="0.2" />
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
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-[#2a180c]/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl z-20 pointer-events-auto">
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
        <div v-if="parchisStore.availableMoves.length > 0 && parchisStore.isMyTurn" class="text-xs text-white bg-green-600/80 px-2 py-0.5 rounded animate-pulse shadow-md">
          Mueve: {{ parchisStore.availableMoves.join(', ') }}
        </div>
      </div>

      <div class="h-8 w-[1px] bg-white/20"></div>
      <button 
        @click="rollDice"
        :disabled="!parchisStore.isMyTurn || parchisStore.availableMoves.length > 0"
        :class="[
          'px-6 py-2 font-bold rounded-full transition-transform shadow-lg cursor-pointer',
          parchisStore.isMyTurn && parchisStore.availableMoves.length === 0 
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(217,119,6,0.5)]' 
            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
        ]"
      >
        Tirar Dados
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ParchisToken from './ParchisToken.vue'
import ParchisDice from './ParchisDice.vue'
import { useParchisStore } from '~/stores/games/parchisStore'
import { useSocket } from '~/composables/useSocket'

const parchisStore = useParchisStore()
const { socket } = useSocket()

const rollDice = () => {
  if (parchisStore.isMyTurn) {
    socket.value?.emit('parchis:roll_dice')
  }
}

const colorPalette = ['#eab308', '#3b82f6', '#ef4444', '#4ade80', '#a855f7', '#f97316', '#ec4899', '#06b6d4'];
const getColor = (colorStr: string) => {
  const map: Record<string, string> = {
    green: '#4ade80', blue: '#3b82f6', red: '#ef4444', yellow: '#eab308', purple: '#a855f7', orange: '#f97316'
  };
  return map[colorStr] || colorStr;
}

const sides = computed(() => parchisStore.rules?.parchisBoardSize || 4);

function rotatePoint(x: number, y: number, degrees: number) {
  const rad = degrees * Math.PI / 180;
  return {
    x: x * Math.cos(rad) - y * Math.sin(rad),
    y: x * Math.sin(rad) + y * Math.cos(rad)
  };
}

const boardGeometry = computed(() => {
  const N = sides.value;

  const trackSquares = [];
  const llegadaPaths = [];
  const nests = [];
  const coordsMap = { track: [] as any[], meta: [] as any[], nests: [] as any[] };

  const rowHeight = 50;
  // Compute innerRadius so the arm width of 150 forms a complete regular polygon at the center
  const innerRadius = 75 / Math.tan(Math.PI / N);
  const trackLength = innerRadius + 8 * rowHeight;

  for (let p = 0; p < N; p++) {
    const armAngle = p * (360 / N);
    const baseColor = colorPalette[p % colorPalette.length];

    // TRACK (17 squares per player)
    for (let i = 0; i < 17; i++) {
      let globalIndex = p * 17 + i;
      let cx = 0, cy = 0, d = "", fill = "#e6c280", rot = armAngle;
      let isSalida = false;
      let isSeguro = false;

      if (i < 8) {
        // Left column of current arm, going UP (outwards)
        let row = i;
        let localX = -75;
        let localY = -innerRadius - (row + 1) * rowHeight;
        let ptCenter = rotatePoint(localX + 25, localY + 25, armAngle);
        cx = ptCenter.x; cy = ptCenter.y;
        
        let p1 = rotatePoint(localX, localY, armAngle);
        let p2 = rotatePoint(localX + 50, localY, armAngle);
        let p3 = rotatePoint(localX + 50, localY + 50, armAngle);
        let p4 = rotatePoint(localX, localY + 50, armAngle);
        d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
        
        // 5th cell from bottom (i=4) is Salida
        if (i === 4) {
          isSalida = true;
          fill = baseColor;
        }
      } else if (i === 8) {
        // Corner "Pizza Junction"
        // Connects outer left of CURRENT arm to outer right of NEXT arm (in CCW direction)
        let p1_local = { x: -75, y: -trackLength };
        let p2_local = { x: -25, y: -trackLength };
        let p3_local = rotatePoint(25, -trackLength, -360/N);
        let p4_local = rotatePoint(75, -trackLength, -360/N);
        
        let p1 = rotatePoint(p1_local.x, p1_local.y, armAngle);
        let p2 = rotatePoint(p2_local.x, p2_local.y, armAngle);
        let p3 = rotatePoint(p3_local.x, p3_local.y, armAngle);
        let p4 = rotatePoint(p4_local.x, p4_local.y, armAngle);
        
        d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
        
        cx = (p1.x + p2.x + p3.x + p4.x) / 4;
        cy = (p1.y + p2.y + p3.y + p4.y) / 4;
        
        isSeguro = true;
        fill = "#fcd34d";
      } else {
        // Right column of NEXT arm, going DOWN (inwards)
        let row = 16 - i; // i=9 -> 7, i=16 -> 0
        let localX = 25;
        let localY = -innerRadius - (row + 1) * rowHeight;
        
        let nextArmAngle = armAngle - (360 / N);
        let ptCenter = rotatePoint(localX + 25, localY + 25, nextArmAngle);
        cx = ptCenter.x; cy = ptCenter.y;
        
        let p1 = rotatePoint(localX, localY, nextArmAngle);
        let p2 = rotatePoint(localX + 50, localY, nextArmAngle);
        let p3 = rotatePoint(localX + 50, localY + 50, nextArmAngle);
        let p4 = rotatePoint(localX, localY + 50, nextArmAngle);
        d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
        
        // Seguro on cell 12
        if (i === 12) {
          isSeguro = true;
          fill = "#fcd34d";
        }
      }

      trackSquares.push({
        d, fill, isSalida, isSeguro, cx, cy, rot
      });
      coordsMap.track[globalIndex] = { x: cx, y: cy };
    }

    // META
    coordsMap.meta[p] = [];
    for (let r = 0; r < 8; r++) {
      // r=0 is outer, r=7 is inner (near center)
      let localX = -25;
      let localY = -innerRadius - (8 - r) * rowHeight;
      
      let p1 = rotatePoint(localX, localY, armAngle);
      let p2 = rotatePoint(localX + 50, localY, armAngle);
      let p3 = rotatePoint(localX + 50, localY + 50, armAngle);
      let p4 = rotatePoint(localX, localY + 50, armAngle);
      let d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
      
      let ptCenter = rotatePoint(0, localY + 25, armAngle);
      let isFinal = (r === 7);
      
      llegadaPaths.push({
        d, color: baseColor, cx: ptCenter.x, cy: ptCenter.y, rot: armAngle, isFinal
      });
      coordsMap.meta[p][r] = { x: ptCenter.x, y: ptCenter.y };
    }

    // NESTS
    // Positioned in the space between arms on the CCW side
    let nestAngle = armAngle - (360 / N) / 2;
    let nestDist = innerRadius + 220;
    if (N === 4) nestDist = 320;
    if (N === 6) nestDist = 380;
    if (N === 8) nestDist = 420;
    
    let nestRadius = N === 4 ? 110 : (N === 6 ? 90 : 70);
    let tokenOffset = N === 4 ? 40 : (N === 6 ? 30 : 25);
    
    let pt = rotatePoint(0, -nestDist, nestAngle);
    
    nests.push({
      cx: pt.x, cy: pt.y, color: baseColor, r: nestRadius, offset: tokenOffset, wedgePath: ""
    });
    coordsMap.nests[p] = { x: pt.x, y: pt.y, offset: tokenOffset };
  }

  // CENTER POLYGON
  const polyPts = [];
  for (let p = 0; p < N; p++) {
    let p1 = rotatePoint(-75, -innerRadius, p * 360 / N);
    let p2 = rotatePoint(75, -innerRadius, p * 360 / N);
    polyPts.push(`${p1.x},${p1.y}`);
    polyPts.push(`${p2.x},${p2.y}`);
  }

  return { trackSquares, llegadaPaths, nests, centerPolygon: polyPts.join(" "), coordsMap };
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
      
      if (token.state === 'HOME') {
        const nest = coordsMap.nests[baseP];
        if (nest) {
          const offset = nest.offset;
          const positions = [
            { x: nest.x - offset, y: nest.y - offset },
            { x: nest.x + offset, y: nest.y - offset },
            { x: nest.x - offset, y: nest.y + offset },
            { x: nest.x + offset, y: nest.y + offset },
          ];
          tokenCoords = positions[tIdx % 4] || {x: 0, y: 0};
        }
      } else if (token.state === 'BOARD' || token.state === 'TRACK') {
        const trackCell = coordsMap.track[token.position % (sides.value * 17)] as any;
        if (trackCell) tokenCoords = { x: trackCell.x, y: trackCell.y };
      } else if (token.state === 'META') {
        const corridorCell = coordsMap.meta[baseP]?.[token.position - 1] as any;
        if (corridorCell) tokenCoords = { x: corridorCell.x, y: corridorCell.y };
      }
      
      tokens.push({
        player, token,
        data: { id: token.id, color: colorPalette[baseP], ownerId: player.userId, position: token.position, state: token.state },
        coords: tokenCoords
      });
    });
  });
  return tokens;
});
</script>
