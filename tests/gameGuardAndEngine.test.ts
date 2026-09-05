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
    isWaitingInLobby?: boolean;
    isGameActive?: boolean;
    unoState?: string;
    stopState?: string;
    parchisState?: string;
  }): { allowed: boolean; redirectUrl?: string } => {
    const roomId = "test-room-123";

    if (!params.nickname || params.playersInRoom.length === 0) {
      return { allowed: false, redirectUrl: `/sala/${roomId}` };
    }

    if (params.isWaitingInLobby === true) {
      return { allowed: false, redirectUrl: `/sala/${roomId}` };
    }

    const isGameActive = params.isGameActive !== undefined ? params.isGameActive : true;
    if (!isGameActive) {
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

  it("should block access if player is waiting in lobby (isWaitingInLobby === true)", () => {
    const res = evaluateGameGuard({
      path: "/sala/test-room-123/uno",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
      isWaitingInLobby: true,
      isGameActive: true,
      unoState: "PLAYING",
    });
    expect(res.allowed).toBe(false);
    expect(res.redirectUrl).toBe("/sala/test-room-123");
  });

  it("should block access if game is not active (isGameActive === false)", () => {
    const res = evaluateGameGuard({
      path: "/sala/test-room-123/uno",
      nickname: "Zoro",
      playersInRoom: [{ id: "p1" }],
      isGameActive: false,
      unoState: "PLAYING",
    });
    expect(res.allowed).toBe(false);
    expect(res.redirectUrl).toBe("/sala/test-room-123");
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

  it("should cover and allow access for all 6 games when conditions are valid", () => {
    const allGames = [
      { path: "/sala/test-room-123/uno", unoState: "PLAYING" },
      { path: "/sala/test-room-123/stop", stopState: "PLAYING" },
      { path: "/sala/test-room-123/parchis", parchisState: "PLAYING" },
      { path: "/sala/test-room-123/liars" },
      { path: "/sala/test-room-123/pinturillo" },
      { path: "/sala/test-room-123/impostor" },
    ];

    for (const game of allGames) {
      const res = evaluateGameGuard({
        path: game.path,
        nickname: "Zoro",
        playersInRoom: [{ id: "p1" }],
        isGameActive: true,
        isWaitingInLobby: false,
        unoState: game.unoState,
        stopState: game.stopState,
        parchisState: game.parchisState,
      });
      expect(res.allowed).toBe(true);
    }
  });

  it("should block all 6 games if user is waiting in lobby or game is inactive", () => {
    const paths = [
      "/sala/test-room-123/uno",
      "/sala/test-room-123/stop",
      "/sala/test-room-123/parchis",
      "/sala/test-room-123/liars",
      "/sala/test-room-123/pinturillo",
      "/sala/test-room-123/impostor",
    ];

    for (const path of paths) {
      const resWaiting = evaluateGameGuard({
        path,
        nickname: "Zoro",
        playersInRoom: [{ id: "p1" }],
        isWaitingInLobby: true,
        isGameActive: true,
        unoState: "PLAYING",
        stopState: "PLAYING",
        parchisState: "PLAYING",
      });
      expect(resWaiting.allowed).toBe(false);
      expect(resWaiting.redirectUrl).toBe("/sala/test-room-123");

      const resInactive = evaluateGameGuard({
        path,
        nickname: "Zoro",
        playersInRoom: [{ id: "p1" }],
        isWaitingInLobby: false,
        isGameActive: false,
        unoState: "PLAYING",
        stopState: "PLAYING",
        parchisState: "PLAYING",
      });
      expect(resInactive.allowed).toBe(false);
      expect(resInactive.redirectUrl).toBe("/sala/test-room-123");
    }
  });
});

describe("Lobby Waiting In Progress Resolution", () => {
  const resolveGameDisplayName = (gameType?: string | null): string => {
    if (!gameType) return "Partida";
    const games = [
      { id: "uno", name: "UNO" },
      { id: "parchis", name: "Parchís" },
      { id: "liars", name: "Liar's Bar" },
      { id: "stop", name: "Stop" },
      { id: "pinturillo", name: "Pinturillo" },
      { id: "impostor", name: "Impostor" },
    ];
    const found = games.find((g) => g.id.toLowerCase() === gameType?.toLowerCase());
    return found?.name || gameType.toUpperCase();
  };

  it("should resolve clean display names for supported game types", () => {
    expect(resolveGameDisplayName("uno")).toBe("UNO");
    expect(resolveGameDisplayName("parchis")).toBe("Parchís");
    expect(resolveGameDisplayName("liars")).toBe("Liar's Bar");
    expect(resolveGameDisplayName("stop")).toBe("Stop");
    expect(resolveGameDisplayName("pinturillo")).toBe("Pinturillo");
    expect(resolveGameDisplayName("impostor")).toBe("Impostor");
  });

  it("should fallback gracefully when gameType is null or custom", () => {
    expect(resolveGameDisplayName(null)).toBe("Partida");
    expect(resolveGameDisplayName(undefined)).toBe("Partida");
    expect(resolveGameDisplayName("custom_game")).toBe("CUSTOM_GAME");
  });

  it("should update room state with active game flags and lobby waiting status", () => {
    const state = {
      isGameActive: false,
      activeGameType: null as string | null,
      isWaitingInLobby: false,
    };

    const updateRoomState = (
      isGameActive?: boolean,
      activeGameType?: string | null,
      isWaitingInLobby?: boolean,
    ) => {
      if (isGameActive !== undefined) {
        state.isGameActive = isGameActive;
        if (!isGameActive) state.isWaitingInLobby = false;
      }
      if (activeGameType !== undefined) state.activeGameType = activeGameType;
      if (isWaitingInLobby !== undefined) state.isWaitingInLobby = isWaitingInLobby;
    };

    updateRoomState(true, "uno", true);
    expect(state.isGameActive).toBe(true);
    expect(state.activeGameType).toBe("uno");
    expect(state.isWaitingInLobby).toBe(true);

    updateRoomState(undefined, undefined);
    expect(state.isGameActive).toBe(true);
    expect(state.activeGameType).toBe("uno");
    expect(state.isWaitingInLobby).toBe(true);

    updateRoomState(false, null);
    expect(state.isGameActive).toBe(false);
    expect(state.activeGameType).toBeNull();
    expect(state.isWaitingInLobby).toBe(false);
  });
});
