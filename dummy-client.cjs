const { io } = require("socket.io-client");
const roomId = process.argv[2] || "F40JT";
const socket = io("http://localhost:3001");
socket.on("connect", () => {
  socket.emit("join_room", {
    roomId: roomId,
    userId: "dummy-user-123",
    nickname: "Luffy",
    avatarId: 2,
    color: "#ff0000"
  });
  console.log("Dummy connected and joined room " + roomId);
});
