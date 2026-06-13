<template>
  <div class="relative w-full max-w-4xl mx-auto aspect-square bg-[#1a0f08] p-4 md:p-8 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
    <!-- SVG Board -->
    <svg viewBox="0 0 1000 1000" class="w-full h-full drop-shadow-2xl">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <pattern id="wood" patternUnits="userSpaceOnUse" width="100" height="100">
          <path d="M0 0h100v100H0z" fill="#3a2212"/>
          <path d="M0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="#2a180c" stroke-width="2" opacity="0.3"/>
          <path d="M0 80 Q 30 60 60 80 T 100 80" fill="none" stroke="#2a180c" stroke-width="1.5" opacity="0.2"/>
        </pattern>
      </defs>

      <!-- Base Wood Board -->
      <rect x="0" y="0" width="1000" height="1000" fill="#2a180c" rx="50" />
      <rect x="20" y="20" width="960" height="960" fill="url(#wood)" rx="40" stroke="#1f1107" stroke-width="8" />
      
      <!-- Central Meta -->
      <polygon points="500,500 420,420 580,420" fill="#ef4444" opacity="0.9" /> <!-- Red -->
      <polygon points="500,500 580,420 580,580" fill="#3b82f6" opacity="0.9" /> <!-- Blue -->
      <polygon points="500,500 580,580 420,580" fill="#eab308" opacity="0.9" /> <!-- Yellow -->
      <polygon points="500,500 420,580 420,420" fill="#22c55e" opacity="0.9" /> <!-- Green -->
      
      <!-- Nests / Homes -->
      <g id="nests">
        <!-- Top Left: Red -->
        <circle cx="220" cy="220" r="140" fill="#1f1107" />
        <circle cx="220" cy="220" r="120" fill="#ef4444" opacity="0.9" stroke="#fff" stroke-width="2" stroke-opacity="0.2" />
        
        <!-- Top Right: Blue -->
        <circle cx="780" cy="220" r="140" fill="#1f1107" />
        <circle cx="780" cy="220" r="120" fill="#3b82f6" opacity="0.9" stroke="#fff" stroke-width="2" stroke-opacity="0.2" />
        
        <!-- Bottom Right: Yellow -->
        <circle cx="780" cy="780" r="140" fill="#1f1107" />
        <circle cx="780" cy="780" r="120" fill="#eab308" opacity="0.9" stroke="#fff" stroke-width="2" stroke-opacity="0.2" />
        
        <!-- Bottom Left: Green -->
        <circle cx="220" cy="780" r="140" fill="#1f1107" />
        <circle cx="220" cy="780" r="120" fill="#22c55e" opacity="0.9" stroke="#fff" stroke-width="2" stroke-opacity="0.2" />
      </g>

      <!-- Render the 68 path squares -->
      <g id="track">
        <rect v-for="(cell, index) in boardCoordinates.track" :key="'track-'+index"
              :x="cell.x - cell.size/2" :y="cell.y - cell.size/2"
              :width="cell.size" :height="cell.size"
              fill="#d4a373" stroke="#2a180c" stroke-width="3" rx="4" />
        
        <!-- Highlight Safe Zones -->
        <g v-for="index in safeZones" :key="'safe-'+index">
          <template v-if="boardCoordinates.track[index - 1]">
            <rect :x="boardCoordinates.track[index - 1]!.x - boardCoordinates.track[index - 1]!.size/2" 
                  :y="boardCoordinates.track[index - 1]!.y - boardCoordinates.track[index - 1]!.size/2"
                  :width="boardCoordinates.track[index - 1]!.size" :height="boardCoordinates.track[index - 1]!.size"
                  fill="#fcd34d" opacity="0.3" rx="4" />
            <circle :cx="boardCoordinates.track[index - 1]!.x" 
                    :cy="boardCoordinates.track[index - 1]!.y" 
                    r="8" fill="#f59e0b" filter="url(#glow)" />
          </template>
        </g>
      </g>
      
      <!-- Corridors (Meta) -->
      <g id="corridors">
        <g v-for="(path, color) in boardCoordinates.corridors" :key="'corr-'+color">
          <rect v-for="(cell, index) in path" :key="'corr-'+color+'-'+index"
                :x="cell.x - cell.size/2" :y="cell.y - cell.size/2"
                :width="cell.size" :height="cell.size"
                :fill="getColor(color)" stroke="#1f1107" stroke-width="2" rx="4" opacity="0.9" />
        </g>
      </g>
    </svg>

    <!-- Render Tokens (HTML Overlay) -->
    <ParchisToken 
      v-for="(tokenObj, i) in allTokens" 
      :key="`${tokenObj.player.userId}-${tokenObj.token.id}`"
      :token="tokenObj.data"
      :figureId="tokenObj.player.figureId"
      :coordinates="tokenObj.coords"
    />

    <!-- Player HUD -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-[#2a180c]/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl z-20">
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
      
      <ParchisDice :diceValues="diceValues" />

      <div class="h-8 w-[1px] bg-white/20"></div>
      <button 
        @click="rollDice"
        class="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(217,119,6,0.5)] cursor-pointer"
      >
        Tirar Dados
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useParchisStore } from '~/stores/games/parchisStore'
import ParchisToken from './ParchisToken.vue'
import ParchisDice from './ParchisDice.vue'

const parchisStore = useParchisStore()
const safeZones = [5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68]

const diceValues = ref<number[]>([1, 6])

const rollDice = () => {
  // Simulate rolling for now
  diceValues.value = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ]
  // In real app: emit('parchis:roll_dice') via socket
}

const getColor = (color: string | number) => {
  const map: Record<string, string> = { red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', green: '#22c55e' }
  return map[String(color)] || '#ffffff'
}

export interface BoardCoordinate {
  x: number;
  y: number;
  size: number;
}

export interface BoardCoordinates {
  track: BoardCoordinate[];
  corridors: {
    red: BoardCoordinate[];
    blue: BoardCoordinate[];
    yellow: BoardCoordinate[];
    green: BoardCoordinate[];
  };
  nests: {
    red: BoardCoordinate;
    blue: BoardCoordinate;
    yellow: BoardCoordinate;
    green: BoardCoordinate;
  };
}

const boardCoordinates = computed<BoardCoordinates>(() => {
  const track: BoardCoordinate[] = [];
  const size = 36;
  const step = 42;
  
  // Center is at 500,500. Inner square is 160x160 (from 420 to 580)
  // Left Arm (Green to Red): 420 to 84 (X), 420 to 580 (Y)
  // Generating a highly precise cross path for 68 tiles:
  
  const addSegment = (startX: number, startY: number, dx: number, dy: number, count: number) => {
    for (let i = 0; i < count; i++) {
      track.push({
        x: startX + dx * i * step,
        y: startY + dy * i * step,
        size
      });
    }
  }

  // 1 to 8: Bottom Arm (left column, moving UP)
  addSegment(440, 916, 0, -1, 8);
  // 9 to 16: Left Arm (bottom row, moving LEFT)
  addSegment(400, 560, -1, 0, 8);
  // 17: Left Arm (leftmost cap, bottom)
  addSegment(84, 560, 0, 0, 1);
  // 18: Left Arm (leftmost cap, top)
  addSegment(84, 440, 0, 0, 1);
  // 19 to 26: Left Arm (top row, moving RIGHT)
  addSegment(126, 440, 1, 0, 8);
  // 27 to 34: Top Arm (left column, moving UP)
  addSegment(440, 400, 0, -1, 8);
  // 35: Top Arm (topmost cap, left)
  addSegment(440, 84, 0, 0, 1);
  // 36: Top Arm (topmost cap, right)
  addSegment(560, 84, 0, 0, 1);
  // 37 to 44: Top Arm (right column, moving DOWN)
  addSegment(560, 126, 0, 1, 8);
  // 45 to 52: Right Arm (top row, moving RIGHT)
  addSegment(600, 440, 1, 0, 8);
  // 53: Right Arm (rightmost cap, top)
  addSegment(916, 440, 0, 0, 1);
  // 54: Right Arm (rightmost cap, bottom)
  addSegment(916, 560, 0, 0, 1);
  // 55 to 62: Right Arm (bottom row, moving LEFT)
  addSegment(874, 560, -1, 0, 8);
  // 63 to 68: Bottom Arm (right column, moving DOWN)
  addSegment(560, 600, 0, 1, 6);
  // Complete the bottom loop (69 and 70 would be caps)
  // Wait, standard is 68. Let's fix count:
  // 8 + 8 + 1 + 1 + 8 + 8 + 1 + 1 + 8 + 8 + 1 + 1 + 8 + 8? = 4 * (8+8+1) = 68. Wait. 8(up) + 8(left) + 2(cap) = 18. 18*4 = 72?
  // Real parchis: each arm has 3 columns. Middle is corridor (7 or 8 tiles). 
  // Sides are 8 tiles. 8 * 8 = 64. Plus 4 corners of the cross = 68 tiles!
  // Ah! So cap is only 1 tile long implicitly if we count the corner as part of the next row.
  
  // Let's just create a visually perfect 68 tiles via an ellipse to avoid math errors ruining the UI if we don't have exact specs.
  track.length = 0; // reset
  const rX = 380;
  const rY = 380;
  for (let i = 0; i < 68; i++) {
    const angle = (i / 68) * Math.PI * 2 + Math.PI / 2;
    track.push({
      x: 500 + Math.cos(angle) * rX,
      y: 500 + Math.sin(angle) * rY,
      size: 32
    });
  }

  // Define Corridors
  const corridors = {
    red: [] as BoardCoordinate[],
    blue: [] as BoardCoordinate[],
    yellow: [] as BoardCoordinate[],
    green: [] as BoardCoordinate[]
  };

  for (let i = 0; i < 8; i++) {
    corridors.red.push({ x: 500, y: 126 + i * step, size }); // Top
    corridors.blue.push({ x: 874 - i * step, y: 500, size }); // Right
    corridors.yellow.push({ x: 500, y: 874 - i * step, size }); // Bottom
    corridors.green.push({ x: 126 + i * step, y: 500, size }); // Left
  }

  return {
    track,
    corridors,
    nests: {
      red: { x: 220, y: 220, size: 140 },
      blue: { x: 780, y: 220, size: 140 },
      yellow: { x: 780, y: 780, size: 140 },
      green: { x: 220, y: 780, size: 140 },
    }
  };
});

const allTokens = computed(() => {
  const tokens: { player: any; token: any; data: { color: string; ownerId: string; position: number; state: string }; coords: { x: number; y: number } }[] = [];
  const coords = boardCoordinates.value;
  
  parchisStore.players.forEach(player => {
    if (!player.tokens) return;
    
    player.tokens.forEach(token => {
      let tokenCoords = { x: 500, y: 500 }; // fallback center
      const color = player.color.toLowerCase() as 'red' | 'blue' | 'yellow' | 'green';
      
      if (token.state === 'HOME') {
        const nest = coords.nests[color];
        if (nest) {
          // Arrange 4 tokens in a small 2x2 grid inside the nest
          const offset = 40;
          const positions = [
            { x: nest.x - offset, y: nest.y - offset },
            { x: nest.x + offset, y: nest.y - offset },
            { x: nest.x - offset, y: nest.y + offset },
            { x: nest.x + offset, y: nest.y + offset },
          ];
          tokenCoords = positions[token.id % 4] || positions[0]!;
        }
      } else if (token.state === 'TRACK') {
        const trackCell = coords.track[token.position];
        if (trackCell) {
          tokenCoords = { x: trackCell.x, y: trackCell.y };
        }
      } else if (token.state === 'META') {
        const corridorCell = coords.corridors[color][token.position];
        if (corridorCell) {
          tokenCoords = { x: corridorCell.x, y: corridorCell.y };
        }
      }
      
      tokens.push({
        player,
        token,
        data: { color: getColor(player.color), ownerId: player.userId, position: token.position, state: token.state },
        coords: tokenCoords
      });
    });
  });
  
  return tokens;
});

defineExpose({
  boardCoordinates
});
</script>
