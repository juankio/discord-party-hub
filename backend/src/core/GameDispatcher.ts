import type { Socket } from "socket.io";
import { Server } from "socket.io";
import { z } from "zod";
import { logger } from "./Logger.js";
import type { RoomManager } from "./RoomManager.js";
import { UnoEngine } from "../games/uno/UnoEngine.js";
import type { UnoRules } from "../games/uno/UnoTypes.js";

// -- Esquemas de validación ZOD --
const UnoPlayCardsSchema = z.array(z.string().max(50)).min(1).max(20);
const StringIdSchema = z.string().max(50);
const ColorSchema = z.enum(["red", "blue", "green", "yellow", "wild"]);
const HoverSchema = z.number().min(0).max(108).nullable();

const StartGameSchema = z.object({
  gameType: z.enum(["uno", "parchis", "stop", "pinturillo", "liars"]).default("uno"),
  rules: z.object({
    stackDrawCards: z.boolean().default(false),
    drawUntilPlayable: z.boolean().default(false),
    playMultipleSame: z.boolean().default(false),
    interceptExact: z.boolean().default(false),
    zeroAndSevenRules: z.boolean().default(false)
  }).optional()
});

// Guard global
function validateSocketContext(socket: Socket): boolean {
  if (!socket.data || !socket.data.roomId || !socket.data.userId) {
    logger.warn(`[SECURITY] Acción bloqueada sin autenticación en socket: ${socket.id}`);
    return false;
  }
  return true;
}

export function handleUnoEvents(socket: Socket, roomManager: RoomManager) {
  const io = (roomManager as any).io; // Accessing internal io instance
  const rooms = roomManager.getRoomsMap();

  const wrapHandler = (handler: () => void) => {
    try {
      if (!validateSocketContext(socket)) return;
      handler();
    } catch (e) {
      logger.error(`[ERROR] Unhandled error in Uno Engine for socket ${socket.id}: ${e}`);
    }
  };

  socket.on("uno:play_cards", (payload: any) => wrapHandler(() => {
    const result = UnoPlayCardsSchema.safeParse(payload);
    if (!result.success) return logger.warn(`[ZOD] Invalid play_cards from ${socket.data.userId}`);
    
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.playCards(socket.data.userId, result.data);
  }));

  socket.on("uno:draw_card", () => wrapHandler(() => {
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.drawFromDeck(socket.data.userId);
  }));

  socket.on("uno:declare_color", (payload: any) => wrapHandler(() => {
    const result = ColorSchema.safeParse(payload);
    if (!result.success) return logger.warn(`[ZOD] Invalid declare_color`);
    
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.declareColor(socket.data.userId, result.data as any);
  }));

  socket.on("uno:swap_hands", (payload: any) => wrapHandler(() => {
    const result = StringIdSchema.safeParse(payload);
    if (!result.success) return logger.warn(`[ZOD] Invalid target ID`);

    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.swapHands(socket.data.userId, result.data);
  }));

  socket.on("uno:yell_uno", () => wrapHandler(() => {
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.yellUno(socket.data.userId);
  }));

  socket.on("uno:challenge_uno", (payload: any) => wrapHandler(() => {
    const result = StringIdSchema.safeParse(payload);
    if (!result.success) return logger.warn(`[ZOD] Invalid challenge target`);

    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.challengeUno(socket.data.userId, result.data);
  }));

  socket.on("uno:hover_card", (payload: any) => wrapHandler(() => {
    const result = HoverSchema.safeParse(payload);
    if (!result.success) return;

    socket.to(socket.data.roomId).emit("uno:rival_hover", {
      userId: socket.data.userId,
      index: result.data
    });
  }));

  socket.on("uno:surrender", () => wrapHandler(() => {
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.surrender(socket.data.userId);
  }));
}

export function startGameDispatcher(socket: Socket, roomManager: RoomManager) {
  const io = (roomManager as any).io;
  const rooms = roomManager.getRoomsMap();

  socket.on("start_game", (payload: any) => {
    if (!validateSocketContext(socket)) return;

    const result = StartGameSchema.safeParse(payload);
    if (!result.success) {
      logger.warn(`[ZOD] Payload de start_game inválido de ${socket.data.userId}`);
      return;
    }

    const data = result.data;
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    const room = rooms.get(roomId);
    
    if (!room || room.hostUserId !== userId) {
      logger.warn(`[SECURITY] El usuario ${userId} intentó iniciar partida sin ser host.`);
      return; 
    }

    if (data.gameType === 'uno') {
      const rules = data.rules as UnoRules;

      room.gameType = 'uno';
      room.gameEngine = new UnoEngine(roomId, (event: string, eventPayload?: any) => {
        try {
          if (event === 'game_state_update') {
            const targetSocketId = room.users.find((u:any) => u.userId === eventPayload.targetUserId)?.socketId;
            if (targetSocketId) io.to(targetSocketId).emit(event, eventPayload.state);
          } else {
            io.to(roomId).emit(event, eventPayload);
          }
        } catch (e) {
          logger.error(`Error emitiendo evento de juego: ${e}`);
        }
      });

      room.users.forEach((u: any) => {
        room.gameEngine!.addPlayer(u.userId, u.socketId, u.nickname, u.avatarId, u.color);
      });

      io.to(roomId).emit("game_started", { gameType: 'uno' });
      room.gameEngine.startGame(rules);
      logger.info(`🎮 Partida de UNO iniciada en la sala ${roomId}`);
    }
  });
}
