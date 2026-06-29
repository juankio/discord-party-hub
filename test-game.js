import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

socket.on("connect", () => {
  socket.emit("join_room", { 
    userId: "host-1", 
    roomId: "9ONCH",
    nickname: "Host", avatarId: 1, color: "#fff", totalWins: 0 
  });
});

socket.on("room_update", (data) => {
  const payload = {
    gameType: 'stop',
    rules: {
      stackDrawCards: true, playMultipleSame: true, zeroAndSevenRules: true, drawUntilPlayable: false, interceptExact: false, extendedLobby: false,
      stopCategories: ['NOMBRE', 'ANIMAL', 'COLOR', 'COSA', 'FRUTA'], stopRounds: 5, bannedLetters: ['W', 'X', 'Y', 'Z'],
      verificationTime: 30
    }
  };
  socket.emit("start_game", payload);
  setTimeout(() => process.exit(0), 1000);
});
