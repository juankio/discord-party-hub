import { Server } from "socket.io";
import { logger } from "./core/Logger.js";
import { RoomManager } from "./core/RoomManager.js";
import { startGameDispatcher, handleUnoEvents } from "./core/GameDispatcher.js";

const PORT = 3001;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager(io);

io.on("connection", (socket) => {
  logger.info(`Nuevo usuario conectado: ${socket.id}`);

  socket.on("join_room", (data: any) => roomManager.handleJoin(socket, data));
  socket.on("disconnect", () => roomManager.handleDisconnect(socket));

  // Conectar dispatchers de juegos usando la nueva arquitectura blindada
  startGameDispatcher(socket, roomManager);
  handleUnoEvents(socket, roomManager);
});

logger.info(`🚀 Socket.io Server corriendo y blindado en http://localhost:${PORT}`);
