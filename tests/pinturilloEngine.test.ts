import { describe, it, expect } from "bun:test";
import type { DrawEvent } from "../components/games/pinturillo/types";

describe("Pinturillo Engine & Strokes Sync Logic", () => {
  describe("Strokes buffer management", () => {
    it("should append incoming draw events", () => {
      const strokes: DrawEvent[] = [];
      const drawEvt: DrawEvent = {
        startX: 10,
        startY: 20,
        endX: 30,
        endY: 40,
        color: "#000000",
        thickness: 5,
      };

      strokes.push(drawEvt);
      expect(strokes.length).toBe(1);
      expect(strokes[0]).toEqual(drawEvt);
    });

    it("should clear strokes on round or turn change", () => {
      let strokes: DrawEvent[] = [
        { startX: 0, startY: 0, endX: 10, endY: 10, color: "#ff0000", thickness: 3 },
        { startX: 10, startY: 10, endX: 20, endY: 20, color: "#ff0000", thickness: 3 },
      ];

      const oldState = { round: 1, currentDrawerId: "drawer-1", state: "DRAWING" };
      const newState = { round: 2, currentDrawerId: "drawer-2", state: "CHOOSING_WORD" };

      const shouldClear = 
        newState.round !== oldState.round ||
        newState.currentDrawerId !== oldState.currentDrawerId ||
        (newState.state !== oldState.state && ["CHOOSING_WORD", "WAITING", "ROUND_RESULTS", "FINISHED"].includes(newState.state));

      if (shouldClear) {
        strokes = [];
      }

      expect(strokes.length).toBe(0);
    });

    it("should replace strokes on draw_history_sync event", () => {
      let strokes: DrawEvent[] = [
        { startX: 1, startY: 1, endX: 2, endY: 2, color: "#111111", thickness: 1 },
      ];
      expect(strokes.length).toBe(1);

      const history: DrawEvent[] = [
        { startX: 5, startY: 5, endX: 15, endY: 15, color: "#00ff00", thickness: 2 },
        { startX: 15, startY: 15, endX: 25, endY: 25, color: "#00ff00", thickness: 2 },
      ];

      strokes = history;
      expect(strokes.length).toBe(2);
      expect(strokes[1]!.endX).toBe(25);
    });
  });

  describe("Canvas incremental rendering tracker", () => {
    it("should correctly compute remaining strokes to render", () => {
      let renderedCount = 0;
      const strokes: DrawEvent[] = [
        { startX: 0, startY: 0, endX: 1, endY: 1, color: "#000", thickness: 1 },
        { startX: 1, startY: 1, endX: 2, endY: 2, color: "#000", thickness: 1 },
      ];

      const unrendered: DrawEvent[] = [];
      for (let i = renderedCount; i < strokes.length; i++) {
        unrendered.push(strokes[i]!);
      }
      renderedCount = strokes.length;

      expect(unrendered.length).toBe(2);
      expect(renderedCount).toBe(2);

      // New stroke arrives
      strokes.push({ startX: 2, startY: 2, endX: 3, endY: 3, color: "#000", thickness: 1 });
      const nextBatch: DrawEvent[] = [];
      for (let i = renderedCount; i < strokes.length; i++) {
        nextBatch.push(strokes[i]!);
      }
      renderedCount = strokes.length;

      expect(nextBatch.length).toBe(1);
      expect(renderedCount).toBe(3);
    });
  });
});
