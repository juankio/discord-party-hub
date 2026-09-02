import { describe, it, expect } from "bun:test";
import { ref } from "vue";
import { rotatePoint, PARCHIS_COLORS } from "../composables/parchisMath";
import { useParchisBoardGeometry } from "../composables/useParchisBoardGeometry";

function pointInPolygon(point: { x: number; y: number }, vs: { x: number; y: number }[]) {
  const x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i]!.x, yi = vs[i]!.y;
    const xj = vs[j]!.x, yj = vs[j]!.y;
    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

describe("parchisMath", () => {
  describe("rotatePoint", () => {
    it("should keep coordinates unchanged when rotated 0 degrees", () => {
      const p1 = rotatePoint(10, 20, 0);
      expect(p1.x).toBeCloseTo(10, 5);
      expect(p1.y).toBeCloseTo(20, 5);

      const p2 = rotatePoint(-5, 12, 0);
      expect(p2.x).toBeCloseTo(-5, 5);
      expect(p2.y).toBeCloseTo(12, 5);
    });

    it("should correctly rotate 90 degrees clockwise", () => {
      // (10, 0) rotated 90 deg -> (0, 10)
      const p1 = rotatePoint(10, 0, 90);
      expect(p1.x).toBeCloseTo(0, 5);
      expect(p1.y).toBeCloseTo(10, 5);

      // (0, 10) rotated 90 deg -> (-10, 0)
      const p2 = rotatePoint(0, 10, 90);
      expect(p2.x).toBeCloseTo(-10, 5);
      expect(p2.y).toBeCloseTo(0, 5);

      // (5, 5) rotated 90 deg -> (-5, 5)
      const p3 = rotatePoint(5, 5, 90);
      expect(p3.x).toBeCloseTo(-5, 5);
      expect(p3.y).toBeCloseTo(5, 5);
    });

    it("should correctly rotate 180 degrees", () => {
      // (10, 20) rotated 180 deg -> (-10, -20)
      const p1 = rotatePoint(10, 20, 180);
      expect(p1.x).toBeCloseTo(-10, 5);
      expect(p1.y).toBeCloseTo(-20, 5);

      // (-7, 14) rotated 180 deg -> (7, -14)
      const p2 = rotatePoint(-7, 14, 180);
      expect(p2.x).toBeCloseTo(7, 5);
      expect(p2.y).toBeCloseTo(-14, 5);
    });

    it("should correctly rotate 270 degrees", () => {
      // (10, 0) rotated 270 deg -> (0, -10)
      const p1 = rotatePoint(10, 0, 270);
      expect(p1.x).toBeCloseTo(0, 5);
      expect(p1.y).toBeCloseTo(-10, 5);

      // (0, 10) rotated 270 deg -> (10, 0)
      const p2 = rotatePoint(0, 10, 270);
      expect(p2.x).toBeCloseTo(10, 5);
      expect(p2.y).toBeCloseTo(0, 5);
    });

    it("should return the original point when rotated 360 degrees", () => {
      const p1 = rotatePoint(15, -25, 360);
      expect(p1.x).toBeCloseTo(15, 5);
      expect(p1.y).toBeCloseTo(-25, 5);
    });

    it("should handle negative rotation angles", () => {
      // -90 deg is equivalent to 270 deg
      const p1 = rotatePoint(10, 0, -90);
      expect(p1.x).toBeCloseTo(0, 5);
      expect(p1.y).toBeCloseTo(-10, 5);

      // -180 deg is equivalent to 180 deg
      const p2 = rotatePoint(4, -8, -180);
      expect(p2.x).toBeCloseTo(-4, 5);
      expect(p2.y).toBeCloseTo(8, 5);

      // -360 deg
      const p3 = rotatePoint(12, 34, -360);
      expect(p3.x).toBeCloseTo(12, 5);
      expect(p3.y).toBeCloseTo(34, 5);
    });

    it("should correctly rotate origin (0, 0) for any angle", () => {
      for (const angle of [0, 45, 90, 135, 180, 270, 360, -90, 720]) {
        const p = rotatePoint(0, 0, angle);
        expect(p.x).toBeCloseTo(0, 5);
        expect(p.y).toBeCloseTo(0, 5);
      }
    });

    it("should handle non-orthogonal angles like 45 degrees", () => {
      const p = rotatePoint(1, 0, 45);
      const expected = Math.SQRT2 / 2;
      expect(p.x).toBeCloseTo(expected, 5);
      expect(p.y).toBeCloseTo(expected, 5);
    });

    it("should handle large rotation angles exceeding 360 degrees", () => {
      // 450 degrees is equivalent to 90 degrees
      const p1 = rotatePoint(10, 0, 450);
      expect(p1.x).toBeCloseTo(0, 5);
      expect(p1.y).toBeCloseTo(10, 5);

      // 720 degrees is two full rotations
      const p2 = rotatePoint(7, -3, 720);
      expect(p2.x).toBeCloseTo(7, 5);
      expect(p2.y).toBeCloseTo(-3, 5);
    });
  });

  describe("PARCHIS_COLORS", () => {
    it("should contain exactly 8 color values", () => {
      expect(PARCHIS_COLORS).toBeDefined();
      expect(Array.isArray(PARCHIS_COLORS)).toBe(true);
      expect(PARCHIS_COLORS.length).toBe(8);
    });

    it("should contain valid hexadecimal color codes", () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      for (const color of PARCHIS_COLORS) {
        expect(typeof color).toBe("string");
        expect(hexRegex.test(color)).toBe(true);
      }
    });

    it("should contain all unique colors with no duplicates", () => {
      const uniqueColors = new Set(PARCHIS_COLORS);
      expect(uniqueColors.size).toBe(8);
    });

    it("should match expected default Parchis palette", () => {
      expect(PARCHIS_COLORS).toEqual([
        "#eab308",
        "#3b82f6",
        "#ef4444",
        "#4ade80",
        "#a855f7",
        "#f97316",
        "#ec4899",
        "#06b6d4",
      ]);
    });
  });

  describe("Parchis Board Geometry & Salidas Alignment", () => {
    const checkAlignment = (N: number) => {
      const sidesRef = ref(N);
      const { boardGeometry, colorPalette } = useParchisBoardGeometry(sidesRef);
      const { trackSquares, llegadaPaths, wedges, coordsMap } = boardGeometry.value;

      expect(trackSquares.length).toBe(N * 17);
      expect(llegadaPaths.length).toBe(N * 8);
      expect(wedges.length).toBe(N);

      for (let p = 0; p < N; p++) {
        const expectedColor = colorPalette[p % colorPalette.length]!;
        const salidaIndex = p * 17 + 12;

        // Verify Salida square properties
        const salidaSquare = trackSquares[salidaIndex]!;
        expect(salidaSquare.isSalida).toBe(true);
        expect(salidaSquare.isSeguro).toBe(true);
        expect(salidaSquare.fill).toBe(expectedColor);

        // Verify Meta corridor color
        const playerMeta = llegadaPaths.slice(p * 8, (p + 1) * 8);
        expect(playerMeta.length).toBe(8);
        for (const metaSquare of playerMeta) {
          expect(metaSquare.color).toBe(expectedColor);
        }

        // Verify Wedge properties and alignment
        const wedge = wedges[p]!;
        expect(wedge.color).toBe(expectedColor);
        expect(wedge.spots.length).toBe(4);

        const salidaCoords = coordsMap.track[salidaIndex]!;
        const distToSalida = Math.hypot(salidaCoords.x - wedge.cx, salidaCoords.y - wedge.cy);

        // Assert distance to own salida is under 250px (directly adjacent)
        expect(distToSalida).toBeLessThan(250);

        // Assert distance to own salida is strictly less than distance to any other arm's salida
        for (let other = 0; other < N; other++) {
          if (other === p) continue;
          const otherSalidaIndex = other * 17 + 12;
          const otherSalidaCoords = coordsMap.track[otherSalidaIndex]!;
          const distToOther = Math.hypot(otherSalidaCoords.x - wedge.cx, otherSalidaCoords.y - wedge.cy);
          expect(distToSalida).toBeLessThan(distToOther);
        }

        // Verify that all 4 token spots are strictly inside the wedge polygon
        const rawPoints = wedge.points.trim().split(" ").map(ptStr => {
          const [x, y] = ptStr.split(",").map(Number);
          return { x: x!, y: y! };
        });

        for (let s = 0; s < wedge.spots.length; s++) {
          const spot = wedge.spots[s]!;
          const isInside = pointInPolygon(spot, rawPoints);
          expect(isInside).toBe(true);
        }
      }
    };

    it("should strictly align bases with their own salidas for 4-player board", () => {
      checkAlignment(4);
    });

    it("should strictly align bases with their own salidas for 6-player board", () => {
      checkAlignment(6);
    });

    it("should strictly align bases with their own salidas for 8-player board", () => {
      checkAlignment(8);
    });
  });
});
