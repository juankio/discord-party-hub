import { io } from "socket.io-client";
const roomId = "JMDKV";
const socket = io("http://localhost:3001");
socket.on("connect", () => {
  socket.emit("join_room", {
    roomId: roomId,
    userId: "dummy-chopper",
    nickname: "Chopper",
    avatarId: 3,
    color: "#ff00ff"
  });
  console.log("Chopper joined!");
});
socket.on("game_state_update", (state) => {
    console.log("Chopper state update:", state);
});
setInterval(() => {}, 1000);
