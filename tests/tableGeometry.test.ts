import { describe, it, expect } from "bun:test";
import { getAvatarPositionLogic } from "../utils/tableGeometry";

describe("tableGeometry", () => {
  const EXPECTED_SLOTS = [
    { left: "50%", top: "calc(100% - var(--hole-mid-y))", transform: "translate(-50%, -50%)" }, // Slot 0
    { left: "50%", top: "var(--hole-mid-y)", transform: "translate(-50%, -50%)" },               // Slot 1
    { left: "var(--hole-offset-x)", top: "var(--hole-offset-y)", transform: "translate(-50%, -50%)" }, // Slot 2
    { left: "calc(100% - var(--hole-offset-x))", top: "var(--hole-offset-y)", transform: "translate(-50%, -50%)" }, // Slot 3
    { left: "var(--hole-offset-x)", top: "calc(100% - var(--hole-offset-y))", transform: "translate(-50%, -50%)" }, // Slot 4
    { left: "calc(100% - var(--hole-offset-x))", top: "calc(100% - var(--hole-offset-y))", transform: "translate(-50%, -50%)" }, // Slot 5
    { left: "calc(var(--hole-offset-x) - 1.5rem)", top: "50%", transform: "translate(-50%, -50%)" }, // Slot 6
    { left: "calc(100% - var(--hole-offset-x) + 1.5rem)", top: "50%", transform: "translate(-50%, -50%)" }, // Slot 7
  ];

  describe("Player slot mappings (1 to 8 players)", () => {
    it("should correctly position 1 player", () => {
      // total = 1 -> mapping: [0]
      expect(getAvatarPositionLogic(0, 1, 0)).toEqual(EXPECTED_SLOTS[0]!);
    });

    it("should correctly position 2 players", () => {
      // total = 2 -> mapping: [0, 1]
      expect(getAvatarPositionLogic(0, 2, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(1, 2, 0)).toEqual(EXPECTED_SLOTS[1]!);
    });

    it("should correctly position 3 players", () => {
      // total = 3 -> mapping: [0, 2, 3]
      expect(getAvatarPositionLogic(0, 3, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(1, 3, 0)).toEqual(EXPECTED_SLOTS[2]!);
      expect(getAvatarPositionLogic(2, 3, 0)).toEqual(EXPECTED_SLOTS[3]!);
    });

    it("should correctly position 4 players", () => {
      // total = 4 -> mapping: [0, 2, 1, 3]
      expect(getAvatarPositionLogic(0, 4, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(1, 4, 0)).toEqual(EXPECTED_SLOTS[2]!);
      expect(getAvatarPositionLogic(2, 4, 0)).toEqual(EXPECTED_SLOTS[1]!);
      expect(getAvatarPositionLogic(3, 4, 0)).toEqual(EXPECTED_SLOTS[3]!);
    });

    it("should correctly position 5 players", () => {
      // total = 5 -> mapping: [0, 4, 2, 3, 5]
      expect(getAvatarPositionLogic(0, 5, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(1, 5, 0)).toEqual(EXPECTED_SLOTS[4]!);
      expect(getAvatarPositionLogic(2, 5, 0)).toEqual(EXPECTED_SLOTS[2]!);
      expect(getAvatarPositionLogic(3, 5, 0)).toEqual(EXPECTED_SLOTS[3]!);
      expect(getAvatarPositionLogic(4, 5, 0)).toEqual(EXPECTED_SLOTS[5]!);
    });

    it("should correctly position 6 players", () => {
      // total = 6 -> mapping: [0, 4, 2, 1, 3, 5]
      expect(getAvatarPositionLogic(0, 6, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(1, 6, 0)).toEqual(EXPECTED_SLOTS[4]!);
      expect(getAvatarPositionLogic(2, 6, 0)).toEqual(EXPECTED_SLOTS[2]!);
      expect(getAvatarPositionLogic(3, 6, 0)).toEqual(EXPECTED_SLOTS[1]!);
      expect(getAvatarPositionLogic(4, 6, 0)).toEqual(EXPECTED_SLOTS[3]!);
      expect(getAvatarPositionLogic(5, 6, 0)).toEqual(EXPECTED_SLOTS[5]!);
    });

    it("should correctly position 7 players", () => {
      // total = 7 -> mapping: [0, 4, 6, 2, 1, 3, 5]
      expect(getAvatarPositionLogic(0, 7, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(1, 7, 0)).toEqual(EXPECTED_SLOTS[4]!);
      expect(getAvatarPositionLogic(2, 7, 0)).toEqual(EXPECTED_SLOTS[6]!);
      expect(getAvatarPositionLogic(3, 7, 0)).toEqual(EXPECTED_SLOTS[2]!);
      expect(getAvatarPositionLogic(4, 7, 0)).toEqual(EXPECTED_SLOTS[1]!);
      expect(getAvatarPositionLogic(5, 7, 0)).toEqual(EXPECTED_SLOTS[3]!);
      expect(getAvatarPositionLogic(6, 7, 0)).toEqual(EXPECTED_SLOTS[5]!);
    });

    it("should correctly position 8 players", () => {
      // total = 8 -> mapping: [0, 4, 6, 2, 1, 3, 7, 5]
      expect(getAvatarPositionLogic(0, 8, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(1, 8, 0)).toEqual(EXPECTED_SLOTS[4]!);
      expect(getAvatarPositionLogic(2, 8, 0)).toEqual(EXPECTED_SLOTS[6]!);
      expect(getAvatarPositionLogic(3, 8, 0)).toEqual(EXPECTED_SLOTS[2]!);
      expect(getAvatarPositionLogic(4, 8, 0)).toEqual(EXPECTED_SLOTS[1]!);
      expect(getAvatarPositionLogic(5, 8, 0)).toEqual(EXPECTED_SLOTS[3]!);
      expect(getAvatarPositionLogic(6, 8, 0)).toEqual(EXPECTED_SLOTS[7]!);
      expect(getAvatarPositionLogic(7, 8, 0)).toEqual(EXPECTED_SLOTS[5]!);
    });
  });

  describe("Edge cases and boundary checks", () => {
    it("should fallback to slot 0 when total is 0", () => {
      // total <= 1 -> mapping = [0]
      expect(getAvatarPositionLogic(0, 0, 0)).toEqual(EXPECTED_SLOTS[0]!);
    });

    it("should fallback to slot 0 when total is negative", () => {
      expect(getAvatarPositionLogic(0, -1, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(0, -10, 0)).toEqual(EXPECTED_SLOTS[0]!);
    });

    it("should fallback to slot 0 when index is out of bounds (greater or equal to total)", () => {
      // For total = 4 (indices 0..3), index 4 or 99 should fallback to slot 0
      expect(getAvatarPositionLogic(4, 4, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(10, 4, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(99, 2, 0)).toEqual(EXPECTED_SLOTS[0]!);
    });

    it("should fallback to slot 0 when index is negative", () => {
      expect(getAvatarPositionLogic(-1, 4, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(-5, 8, 0)).toEqual(EXPECTED_SLOTS[0]!);
    });

    it("should use 8-player mapping when total is greater than 8", () => {
      // For total > 8, fallback mapping is [0, 4, 6, 2, 1, 3, 7, 5]
      expect(getAvatarPositionLogic(0, 10, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(1, 10, 0)).toEqual(EXPECTED_SLOTS[4]!);
      expect(getAvatarPositionLogic(2, 10, 0)).toEqual(EXPECTED_SLOTS[6]!);
      expect(getAvatarPositionLogic(3, 10, 0)).toEqual(EXPECTED_SLOTS[2]!);
      expect(getAvatarPositionLogic(4, 10, 0)).toEqual(EXPECTED_SLOTS[1]!);
      expect(getAvatarPositionLogic(5, 10, 0)).toEqual(EXPECTED_SLOTS[3]!);
      expect(getAvatarPositionLogic(6, 10, 0)).toEqual(EXPECTED_SLOTS[7]!);
      expect(getAvatarPositionLogic(7, 10, 0)).toEqual(EXPECTED_SLOTS[5]!);
      // index >= 8 should fallback to slot 0
      expect(getAvatarPositionLogic(8, 10, 0)).toEqual(EXPECTED_SLOTS[0]!);
      expect(getAvatarPositionLogic(9, 10, 0)).toEqual(EXPECTED_SLOTS[0]!);
    });

    it("should always return an object containing left, top, and transform CSS strings", () => {
      for (let total = 1; total <= 8; total++) {
        for (let idx = 0; idx < total; idx++) {
          const pos = getAvatarPositionLogic(idx, total, 0);
          expect(typeof pos.left).toBe("string");
          expect(typeof pos.top).toBe("string");
          expect(pos.transform).toBe("translate(-50%, -50%)");
        }
      }
    });
  });
});
