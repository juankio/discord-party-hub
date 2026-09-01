import { describe, it, expect } from "bun:test";

describe("Parchis isMyTurn Logic", () => {
  it("should evaluate isMyTurn correctly based on currentTurnIndex and player userId", () => {
    const players = [
      { userId: "user-zoro", nickname: "Zoro", tokens: [] },
      { userId: "user-luffy", nickname: "Luffy", tokens: [] },
      { userId: "user-sanji", nickname: "Sanji", tokens: [] },
    ];

    const currentTurnIndex = 0;
    const currentUserId = "user-zoro";

    const isMyTurn = players[currentTurnIndex]?.userId === currentUserId;
    expect(isMyTurn).toBe(true);

    const isNotMyTurn = players[1]?.userId === currentUserId;
    expect(isNotMyTurn).toBe(false);
  });

  it("should return false when players array is empty or currentTurnIndex is out of bounds", () => {
    const players: any[] = [];
    const currentTurnIndex = 0;
    const currentUserId = "user-zoro";

    const isMyTurn = players[currentTurnIndex]?.userId === currentUserId;
    expect(isMyTurn).toBe(false);
  });
});

describe("Game Guard Navigation Logic", () => {
  const evaluateGameGuard = (params: {
    path: string;
    nickname: string;
    playersInRoom: any[];
    unoState?: string;
    stopState?: string;
    parchisState?: string;
  }): { allowed: boolean; redirectUrl?: string } => {
    const roomId = "test-room-123";

    if (!params.nickname || params.playersInRoom.length === 0) {
      return { allowed: false, redirectUrl: `/sala/${roomId}` };
    }

    let gameState: string | null = null;
    if (params.path.includes("/uno")) {
      gameState = params.unoState || "WAITING";
    } else if (params.path.includes("/stop")) {
      gameState = params.stopState || "LOBBY";
    } else if (params.path.includes("/parchis")) {
      gameState = params.parchisState || "WAITING";
    }

    if (gameState === "WAITING" || gameState === "LOBBY") {
      return { allowed: false, redirectUrl: `/sala/${roomId}` };
    }

    return { allowed: true };
  };

  it("should block access if player has no nickname or room has no players", () => {
    const res1 = evaluateGameGuard({
      path: "/sala/test-room-123/stop",
      nickname: "",
      playersInRoom: [{ id: "p1" }],
      stopState: "PLAYING",
    });
    expect(res1.allowed).toBe(false);
    expect(res1.redirectUrl).toBe("/sala/test-room-123");

    const res2 = evaluateGameGuard({
      path: "/sala/test-room-123/impostor",
      nickname: "Zoro",
      playersInRoom: [],
    });
    expect(res2.allowed).toBe(false);
  });

  it("should redirect when game is in initial WAITING or LOBBY state", () => {
    const resUno = evaluateGameGuard({
      path: "/sala/test-room-123/uno",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
      unoState: "WAITING",
    });
    expect(resUno.allowed).toBe(false);
    expect(resUno.redirectUrl).toBe("/sala/test-room-123");

    const resStop = evaluateGameGuard({
      path: "/sala/test-room-123/stop",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
      stopState: "LOBBY",
    });
    expect(resStop.allowed).toBe(false);
    expect(resStop.redirectUrl).toBe("/sala/test-room-123");

    const resParchis = evaluateGameGuard({
      path: "/sala/test-room-123/parchis",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
      parchisState: "WAITING",
    });
    expect(resParchis.allowed).toBe(false);
  });

  it("should allow access when game is in active PLAYING state", () => {
    const resUno = evaluateGameGuard({
      path: "/sala/test-room-123/uno",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
      unoState: "PLAYING",
    });
    expect(resUno.allowed).toBe(true);

    const resStop = evaluateGameGuard({
      path: "/sala/test-room-123/stop",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
      stopState: "PLAYING",
    });
    expect(resStop.allowed).toBe(true);

    const resImpostor = evaluateGameGuard({
      path: "/sala/test-room-123/impostor",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
    });
    expect(resImpostor.allowed).toBe(true);

    const resLiars = evaluateGameGuard({
      path: "/sala/test-room-123/liars",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
    });
    expect(resLiars.allowed).toBe(true);
  });
});
