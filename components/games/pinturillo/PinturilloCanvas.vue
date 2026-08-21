<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { DrawEvent } from './types';
import { usePinturilloAudio } from '@/composables/usePinturilloAudio';

const props = defineProps<{
  isDrawer: boolean;
  currentColor: string;
  currentThickness: number;
  strokesToRender: DrawEvent[]; // Real-time strokes from server
  clearCanvasSignal?: number; // Prop to trigger clear
}>();

const emit = defineEmits<{
  (e: 'draw', event: DrawEvent): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const isDrawing = ref(false);
const lastPos = ref<{ x: number; y: number } | null>(null);

// Fixed internal resolution
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d');
    if (ctx.value) {
      ctx.value.lineCap = 'round';
      ctx.value.lineJoin = 'round';
      clearCanvas();
    }
  }
});

watch(() => props.clearCanvasSignal, () => {
  clearCanvas();
});

watch(() => props.strokesToRender, (newStrokes) => {
  if (!ctx.value) return;
  // This is a naive re-render or just appending.
  // Ideally, we just draw the newly added strokes if we manage it externally.
  // Assuming this prop is just the latest stroke or we draw all of them.
  // Let's assume strokesToRender are events we just need to draw immediately.
}, { deep: true });

// For now we will expose a method to draw an incoming event directly
const drawIncomingEvent = (event: DrawEvent) => {
  if (!ctx.value) return;
  ctx.value.beginPath();
  ctx.value.moveTo(event.startX, event.startY);
  ctx.value.lineTo(event.endX, event.endY);
  ctx.value.strokeStyle = event.color;
  ctx.value.lineWidth = event.thickness;
  ctx.value.stroke();
  ctx.value.closePath();
};

defineExpose({
  drawIncomingEvent,
  clearCanvas
});

function clearCanvas() {
  if (ctx.value && canvasRef.value) {
    ctx.value.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

function getCoords(e: MouseEvent | TouchEvent) {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  
  let clientX, clientY;
  if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else if ('touches' in e && e.touches.length > 0) {
    const touch = e.touches[0];
    if (!touch) return { x: 0, y: 0 };
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    return { x: 0, y: 0 };
  }

  // Scale coordinates to internal resolution
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

const { playDraw, stopDraw } = usePinturilloAudio();

const startDrawing = (e: MouseEvent | TouchEvent) => {
  if (!props.isDrawer) return;
  e.preventDefault(); // Prevent scrolling on touch
  isDrawing.value = true;
  lastPos.value = getCoords(e);
  playDraw();
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !props.isDrawer || !lastPos.value || !ctx.value) return;
  e.preventDefault();

  const newPos = getCoords(e);
  
  const drawEvt: DrawEvent = {
    startX: lastPos.value.x,
    startY: lastPos.value.y,
    endX: newPos.x,
    endY: newPos.y,
    color: props.currentColor,
    thickness: props.currentThickness
  };

  // Draw locally
  drawIncomingEvent(drawEvt);
  
  // Emit to parent
  emit('draw', drawEvt);

  lastPos.value = newPos;
};

const stopDrawing = () => {
  isDrawing.value = false;
  lastPos.value = null;
  stopDraw();
};
</script>

<template>
  <div class="relative w-full h-full p-2 lg:p-4 bg-[#8b5a2b] rounded-md shadow-2xl border-b-[8px] border-[#5c3a21] flex items-center justify-center">
    <!-- The wooden easel / chalkboard frame -->
    <div class="relative w-full aspect-[4/3] bg-[#d2b48c] border-[12px] border-[#3e2723] rounded shadow-inner flex overflow-hidden">
      <!-- The paper / canvas itself -->
      <canvas
        ref="canvasRef"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
        class="w-full h-full bg-[#f4e4bc] cursor-crosshair touch-none"
        style="box-shadow: inset 0 0 40px rgba(0,0,0,0.1);"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawing"
        @touchmove="draw"
        @touchend="stopDrawing"
        @touchcancel="stopDrawing"
      ></canvas>
      
      <!-- Overlay for waiting/results (not drawing) -->
      <div v-if="!isDrawer" class="absolute inset-0 pointer-events-none" style="background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px);"></div>
    </div>
  </div>
</template>
