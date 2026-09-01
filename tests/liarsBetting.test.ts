import { describe, it, expect } from "bun:test";

// Logic helpers matching Liars Bar frontend normalization
export const normalizeBet = (bet?: { amount?: number; count?: number; face?: number; playerId?: string; userId?: string } | null) => {
  if (!bet) return null;
  const count = bet.count ?? bet.amount ?? 1;
  const face = bet.face ?? 2;
  const playerId = bet.playerId ?? bet.userId ?? "";
  const validCount = typeof count === "number" && !Number.isNaN(count) ? count : 1;
  const validFace = typeof face === "number" && !Number.isNaN(face) ? Math.min(6, Math.max(1, face)) : 2;
  return { count: validCount, amount: validCount, face: validFace, playerId, userId: playerId };
};

export const calculateNextMinBet = (currentBet: { amount?: number; count?: number; face?: number } | null | undefined) => {
  const norm = normalizeBet(currentBet);
  if (!norm) {
    return { amount: 1, count: 1, face: 2 };
  }
  if (norm.face < 6) {
    return { amount: norm.count, count: norm.count, face: norm.face + 1 };
  } else {
    return { amount: norm.count + 1, count: norm.count + 1, face: 2 };
  }
};

export const resolvePlayerName = (
  players: Array<{ id: string; userId?: string; name?: string; nickname?: string; username?: string }>,
  targetIdOrObj: string | { id?: string; userId?: string; name?: string } | undefined
) => {
  if (!targetIdOrObj) return "";
  if (typeof targetIdOrObj === "object") {
    return targetIdOrObj.name || targetIdOrObj.id || "Alguien";
  }
  const id = targetIdOrObj;
  const found = players.find(p => p.id === id || p.userId === id);
  return found ? (found.name || found.nickname || found.username || "Alguien") : (isNaN(Number(id)) ? id : "Alguien");
};

describe("Liar's Bar Bet & State Normalization", () => {
  const mockPlayers = [
    { id: "p1", userId: "u1", name: "Luffy" },
    { id: "p2", userId: "u2", nickname: "Zoro" },
    { id: "p3", userId: "u3", username: "Nami" },
  ];

  describe("normalizeBet", () => {
    it("should handle bet with 'amount' property without producing NaN", () => {
      const bet = { amount: 3, face: 4, playerId: "p1" };
      const normalized = normalizeBet(bet);
      expect(normalized).not.toBeNull();
      expect(normalized!.count).toBe(3);
      expect(normalized!.amount).toBe(3);
      expect(normalized!.face).toBe(4);
      expect(normalized!.playerId).toBe("p1");
    });

    it("should handle bet with 'count' property without producing NaN", () => {
      const bet = { count: 5, face: 6, userId: "u2" };
      const normalized = normalizeBet(bet);
      expect(normalized).not.toBeNull();
      expect(normalized!.count).toBe(5);
      expect(normalized!.amount).toBe(5);
      expect(normalized!.face).toBe(6);
      expect(normalized!.playerId).toBe("u2");
      expect(normalized!.userId).toBe("u2");
    });

    it("should handle malformed or undefined count/amount safely", () => {
      const bet = { face: 3 } as any;
      const normalized = normalizeBet(bet);
      expect(normalized).not.toBeNull();
      expect(normalized!.count).toBe(1);
      expect(Number.isNaN(normalized!.count)).toBe(false);
      expect(normalized!.face).toBe(3);
    });

    it("should return null when no current bet exists", () => {
      expect(normalizeBet(null)).toBeNull();
      expect(normalizeBet(undefined)).toBeNull();
    });
  });

  describe("calculateNextMinBet", () => {
    it("should start with count 1, face 2 when no prior bet exists", () => {
      const next = calculateNextMinBet(null);
      expect(next.count).toBe(1);
      expect(next.face).toBe(2);
    });

    it("should increment face when face < 6 with 'count'", () => {
      const next = calculateNextMinBet({ count: 2, face: 3 });
      expect(next.count).toBe(2);
      expect(next.face).toBe(4);
    });

    it("should increment face when face < 6 with 'amount'", () => {
      const next = calculateNextMinBet({ amount: 2, face: 3 });
      expect(next.count).toBe(2);
      expect(next.face).toBe(4);
    });

    it("should wrap to face 2 and increment amount when face is 6", () => {
      const next = calculateNextMinBet({ count: 4, face: 6 });
      expect(next.count).toBe(5);
      expect(next.face).toBe(2);
    });
  });

  describe("resolvePlayerName", () => {
    it("should resolve player by id", () => {
      expect(resolvePlayerName(mockPlayers, "p1")).toBe("Luffy");
    });

    it("should resolve player by userId", () => {
      expect(resolvePlayerName(mockPlayers, "u2")).toBe("Zoro");
      expect(resolvePlayerName(mockPlayers, "u3")).toBe("Nami");
    });

    it("should resolve player when object is passed", () => {
      expect(resolvePlayerName(mockPlayers, { id: "p1", name: "Luffy Custom" })).toBe("Luffy Custom");
      expect(resolvePlayerName(mockPlayers, { id: "p2" })).toBe("p2");
    });

    it("should return fallback if player not found", () => {
      expect(resolvePlayerName(mockPlayers, "unknown_player")).toBe("unknown_player");
      expect(resolvePlayerName(mockPlayers, undefined)).toBe("");
    });
  });
});
