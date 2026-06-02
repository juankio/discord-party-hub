import { io } from "socket.io-client";
const socket = io("http://localhost:3001");
socket.on("connect", () => {
  socket.emit("join_room", {
    roomId: "JMDKV",
    userId: "dummy-chopper",
    nickname: "Chopper",
    avatarId: 3,
    color: "#ff00ff"
  });
  
  setTimeout(() => {
    socket.emit("uno:draw_card");
    console.log("Chopper drew a card!");
    process.exit(0);
  }, 1000);
});
