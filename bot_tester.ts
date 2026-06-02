import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3001";
const ROOM_ID = "BOT_TEST";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function createBot(name: string, isHost: boolean) {
  const socket = io(SERVER_URL);
  const userId = "bot_" + name;
  let myHand: any[] = [];
  let isMyTurn = false;
  let gameFinished = false;

  socket.on("connect", () => {
    console.log(`🤖 ${name} conectado.`);
    socket.emit("join_room", {
      roomId: ROOM_ID,
      userId: userId,
      nickname: name,
      avatarId: 1,
      color: "#ff0000"
    });

    if (isHost) {
      setTimeout(() => {
        console.log(`🤖 ${name} (Host) iniciando partida...`);
        socket.emit("start_game", { 
          gameType: "uno", 
          rules: {
            stackDrawCards: true,
            playMultipleSame: true,
            zeroAndSevenRules: true,
            drawUntilPlayable: false,
            interceptExact: false
          } 
        });
      }, 1000);
    }
  });

  socket.on("game_state_update", async (data) => {
    if (gameFinished) return;
    
    myHand = data.myHand;
    const topCard = data.topCard;
    const currentColor = data.currentColor;
    const pendingDraws = data.pendingDraws;

    if (data.state === "FINISHED") {
      gameFinished = true;
      if (data.winner === userId) {
        console.log(`🏆 ¡${name} HA GANADO LA PARTIDA!`);
      }
      return;
    }

    if (data.state === "CHOOSING_COLOR" && data.actionRequiredFrom === userId) {
      const colors = ["red", "blue", "green", "yellow"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      console.log(`🤖 ${name} elige color: ${randomColor}`);
      await delay(200);
      socket.emit("uno:declare_color", randomColor);
      return;
    }

    if (data.state === "CHOOSING_PLAYER" && data.actionRequiredFrom === userId) {
      // Regla del 7 - Elige a un rival al azar
      const target = data.rivals[0].userId;
      console.log(`🤖 ${name} usa el 7 para intercambiar con ${target}`);
      await delay(200);
      socket.emit("uno:swap_hands", target);
      return;
    }

    if (data.currentTurnUserId === userId && data.state === "PLAYING") {
      await delay(300); // Pensar...
      
      // Decir UNO
      if (myHand.length === 2) {
        socket.emit("uno:yell_uno");
        console.log(`🤖 ${name} grita ¡UNO!`);
      }

      // Lógica para jugar
      let playableCard = null;

      if (pendingDraws > 0) {
        playableCard = myHand.find(c => c.value === "draw2" || c.value === "wild_draw4");
      } else {
        playableCard = myHand.find(c => 
          c.color === "wild" || 
          c.color === currentColor || 
          c.color === topCard?.color || 
          c.value === topCard?.value
        );
      }

      if (playableCard) {
        console.log(`🤖 ${name} juega: [${playableCard.color} ${playableCard.value}] (Quedan ${myHand.length - 1})`);
        socket.emit("uno:play_cards", [playableCard.id]);
      } else {
        console.log(`🤖 ${name} no tiene cartas. Roba del mazo.`);
        socket.emit("uno:draw_card");
      }
    }
  });

  return socket;
}

async function runTest() {
  console.log("Iniciando Simulador de UNO de Usopp...");
  const bot1 = await createBot("Luffy", true);
  await delay(200);
  const bot2 = await createBot("Zoro", false);
}

runTest();
