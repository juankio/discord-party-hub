const { io } = require("socket.io-client");
const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("Connected as dummy player");
  socket.emit("join_room", {
    roomId: "W9S48",
    userId: "dummy_user_123",
    nickname: "UsoppDummy",
    avatarId: 2,
    color: "red"
  });
});
