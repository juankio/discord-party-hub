const { io } = require("socket.io-client");
const socket = io("http://localhost:3001");
socket.on("connect", () => {
  socket.emit("join_room", {
    roomId: "2FGGA",
    userId: "dummy_user_789",
    nickname: "Zoro_Dummy",
    avatarId: 2,
    color: "#ff0000"
  });
});
