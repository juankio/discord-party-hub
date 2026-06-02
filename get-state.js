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
});
socket.on("game_state_update", (state) => {
    console.log("STATE:", JSON.stringify(state, null, 2));
    process.exit(0);
});
