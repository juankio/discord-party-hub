import type { Server, Socket } from 'socket.io';
import { logger } from './Logger.js';
import type { UnoEngine } from '../games/uno/UnoEngine.js';
import { z } from 'zod';

const JoinRoomSchema = z.object({
  roomId: z.string().min(1).max(50),
  userId: z.string().min(1).max(50),
  nickname: z.string().max(30).default('Anon'),
  avatarId: z.number().int().default(1),
  color: z.string().max(20).default('#ffffff')
});

export interface RoomData {
  users: Array<{
    socketId: string;
    userId: string;
    nickname: string;
    avatarId: number;
    color: string;
  }>;
  hostUserId: string;
  gameEngine?: UnoEngine;
  gameType?: string;
  lastActive: number;
}

export class RoomManager {
  private rooms = new Map<string, RoomData>();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.startGarbageCollector();
  }

  public getRoom(roomId: string): RoomData | undefined {
    return this.rooms.get(roomId);
  }

  public getRoomsMap() {
    return this.rooms; // Temp escape hatch for dispatchers
  }

  public handleJoin(socket: Socket, data: any) {
    const result = JoinRoomSchema.safeParse(data);
    if (!result.success) {
      logger.warn(`[SECURITY] Invalid join_room payload from socket: ${socket.id} - ${result.error.issues[0]?.message}`);
      return;
    }

    const { roomId, userId, nickname, avatarId, color } = result.data;

    socket.join(roomId);
    socket.data = { userId, nickname, avatarId, color, roomId };

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { users: [], hostUserId: userId, lastActive: Date.now() });
      logger.info(`Room ${roomId} created by ${nickname}`);
    }

    const room = this.rooms.get(roomId)!;
    room.lastActive = Date.now();

    let finalNickname = nickname;
    let counter = 1;
    while (room.users.some(u => u.nickname === finalNickname && u.userId !== userId)) {
      finalNickname = `${nickname} (copión ${counter})`;
      counter++;
    }

    const existingIndex = room.users.findIndex(u => u.userId === userId);
    if (existingIndex === -1) {
      room.users.push({ socketId: socket.id, userId, nickname: finalNickname, avatarId, color });
    } else {
      room.users[existingIndex] = { socketId: socket.id, userId, nickname: finalNickname, avatarId, color };
    }

    const hostStillExists = room.users.some(u => u.userId === room.hostUserId);
    if (!hostStillExists && room.users.length > 0) {
      room.hostUserId = room.users[0]!.userId;
      logger.info(`Host migrated to ${room.hostUserId} in room ${roomId}`);
    }

    this.io.to(roomId).emit("room_update", { 
      users: room.users,
      hostUserId: room.hostUserId
    });

    if (room.gameEngine && room.gameType === 'uno') {
      room.gameEngine.addPlayer(userId, socket.id, finalNickname, avatarId, color);
      this.io.to(socket.id).emit("game_started", { gameType: 'uno' });
      room.gameEngine.broadcastState();
    } else {
      this.io.to(socket.id).emit("return_to_lobby");
    }
  }

  public handleDisconnect(socket: Socket) {
    const roomId = socket.data?.roomId;
    const userId = socket.data?.userId;

    if (!roomId || !this.rooms.has(roomId)) return;

    // Grace period
    setTimeout(() => {
      const room = this.rooms.get(roomId);
      if (!room) return;

      const currentUser = room.users.find(u => u.userId === userId);
      
      // Si no ha vuelto con otro socket
      if (currentUser && currentUser.socketId === socket.id) {
        room.users = room.users.filter(u => u.userId !== userId);
        
        if (room.gameEngine) room.gameEngine.removePlayer(userId);

        if (room.users.length === 0) {
          logger.info(`Room ${roomId} marked empty (Garbage Collector will clean it soon).`);
        } else {
          if (room.hostUserId === userId) {
            room.hostUserId = room.users[0]!.userId;
            logger.info(`Host left, migrated to ${room.hostUserId} in room ${roomId}`);
          }
          this.io.to(roomId).emit("room_update", { 
            users: room.users,
            hostUserId: room.hostUserId
          });
        }
      }
    }, 3000);
  }

  private startGarbageCollector() {
    setInterval(() => {
      const now = Date.now();
      for (const [roomId, room] of this.rooms.entries()) {
        const isStale = (now - room.lastActive) > 1000 * 60 * 60; // 1 hour completely stale
        const isEmpty = room.users.length === 0;

        if (isEmpty || isStale) {
          this.rooms.delete(roomId);
          logger.info(`🧹 Garbage Collector removed room ${roomId}`);
        }
      }
    }, 1000 * 60 * 5); // Run every 5 minutes
  }
}
