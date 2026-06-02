/**
 * 🃏 UNO Engine (Motor de Juego)
 * Lógica Zero-Trust con Reglas Colombianas
 */

export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'skip'|'reverse'|'draw2'|'wild'|'wild_draw4';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

export interface Player {
  userId: string;
  socketId: string;
  nickname: string;
  avatarId: number;
  color: string;
  hand: Card[];
  hasYelledUno: boolean;
}

export interface UnoRules {
  stackDrawCards: boolean;
  drawUntilPlayable: boolean;
  playMultipleSame: boolean;
  interceptExact: boolean;
  zeroAndSevenRules: boolean;
}

export type GameState = 'WAITING' | 'PLAYING' | 'CHOOSING_COLOR' | 'CHOOSING_PLAYER' | 'FINISHED';

const generateId = () => Math.random().toString(36).substring(2, 15);

export class UnoEngine {
  public roomId: string;
  public players: Player[] = [];
  public state: GameState = 'WAITING';
  
  public deck: Card[] = [];
  public discardPile: Card[] = [];
  
  public currentTurnIndex: number = 0;
  public playDirection: 1 | -1 = 1;
  public currentColor: CardColor | '' = ''; 
  public pendingDraws: number = 0; // Para la regla de acumulación (+2, +4)
  public actionRequiredFrom: string = ''; // userId del que debe elegir color o jugador
  public winner: string | null = null;
  
  public rules: UnoRules = {
    stackDrawCards: false,
    drawUntilPlayable: false,
    playMultipleSame: false,
    interceptExact: false,
    zeroAndSevenRules: false
  };

  private broadcastCallback: (event: string, data?: any) => void;

  constructor(roomId: string, broadcastCallback: (event: string, data?: any) => void) {
    this.roomId = roomId;
    this.broadcastCallback = broadcastCallback;
  }

  // --- GESTIÓN DE JUGADORES ---
  public addPlayer(userId: string, socketId: string, nickname: string, avatarId: number, color: string) {
    const existing = this.players.find(p => p.userId === userId);
    
    if (!existing) {
      // Si es un jugador nuevo y el juego ya empezó, no puede entrar
      if (this.state !== 'WAITING') return;
      this.players.push({ userId, socketId, nickname, avatarId, color, hand: [], hasYelledUno: false });
    } else {
      // Si ya existía, actualizamos su conexión (Reconexión F5)
      existing.socketId = socketId;
      existing.nickname = nickname;
      existing.avatarId = avatarId;
      existing.color = color;
    }
  }

  public removePlayer(userId: string) {
    this.players = this.players.filter(p => p.userId !== userId);
    if (this.state !== 'WAITING' && this.state !== 'FINISHED') {
      if (this.players.length < 2) {
        this.state = 'FINISHED';
        this.broadcastState();
      } else {
        // Ajustar el turno si es necesario (complejo, simplificado aquí)
        this.currentTurnIndex = this.currentTurnIndex % this.players.length;
        this.broadcastState();
      }
    }
  }

  // --- INICIO DE JUEGO ---
  public startGame(rules: UnoRules) {
    if (this.players.length < 2) return;
    this.rules = rules;
    this.deck = this.generateDeck();
    this.shuffleDeck();
    this.discardPile = [];
    this.pendingDraws = 0;
    this.playDirection = 1;
    this.currentTurnIndex = 0; // Empieza el host (0)
    
    // Repartir 7 cartas
    for (let p of this.players) {
      p.hand = this.drawCards(7);
      p.hasYelledUno = false;
    }

    // Primera carta
    let firstCard = this.drawCards(1)[0];
    while (firstCard.color === 'wild' || firstCard.value === 'reverse' || firstCard.value === 'skip' || firstCard.value === 'draw2') {
      this.deck.push(firstCard);
      this.shuffleDeck();
      firstCard = this.drawCards(1)[0];
    }
    this.discardPile.push(firstCard);
    this.currentColor = firstCard.color;
    
    this.state = 'PLAYING';
    this.broadcastState();
    this.broadcastMessage(`¡La partida ha comenzado!`);
  }

  // --- LÓGICA PRINCIPAL ---
  public playCards(userId: string, cardIds: string[]) {
    if (this.state !== 'PLAYING') return;
    
    const player = this.players.find(p => p.userId === userId);
    if (!player) return;

    const cardsToPlay = player.hand.filter(c => cardIds.includes(c.id));
    if (cardsToPlay.length === 0 || cardsToPlay.length !== cardIds.length) return; // No tiene las cartas

    const topCard = this.discardPile[this.discardPile.length - 1];
    const isMyTurn = this.players[this.currentTurnIndex].userId === userId;

    // INTERCEPCIÓN (Regla de Corte)
    if (!isMyTurn && this.rules.interceptExact && cardsToPlay.length === 1) {
      if (cardsToPlay[0].color !== 'wild' && cardsToPlay[0].color === topCard.color && cardsToPlay[0].value === topCard.value) {
        // ¡Corte válido!
        this.currentTurnIndex = this.players.findIndex(p => p.userId === userId);
        this.broadcastMessage(`${player.nickname} interrumpió el turno con un corte exacto!`);
      } else {
        return; // Corte inválido
      }
    } else if (!isMyTurn) {
      return; // No es su turno
    }

    // REGLA DE MÚLTIPLES CARTAS
    if (cardsToPlay.length > 1) {
      if (!this.rules.playMultipleSame) return;
      const firstVal = cardsToPlay[0].value;
      if (!cardsToPlay.every(c => c.value === firstVal)) return; // Deben ser del mismo valor
    }

    const firstCard = cardsToPlay[0];

    // VALIDAR JUGADA SOBRE LA MESA
    if (this.pendingDraws > 0) {
      // Estamos acumulando cartas
      if (this.rules.stackDrawCards) {
        if (firstCard.value !== 'draw2' && firstCard.value !== 'wild_draw4') return;
      } else {
        return; // No se puede jugar, DEBE comer
      }
    } else {
      // Jugada normal
      const validColor = firstCard.color === 'wild' || firstCard.color === this.currentColor;
      const validValue = firstCard.value === topCard.value;
      if (!validColor && !validValue) return;
    }

    // APLICAR JUGADA
    for (const c of cardsToPlay) {
      player.hand = player.hand.filter(handCard => handCard.id !== c.id);
      this.discardPile.push(c);
    }
    
    // Animar rival tirando carta
    this.broadcastCallback("game_action", {
      action: "rival_played",
      userId: player.userId,
      cardsCount: cardsToPlay.length
    });

    if (firstCard.color !== 'wild') {
      this.currentColor = firstCard.color;
    }

    // EVALUAR EFECTOS
    let skips = 0;
    for (const c of cardsToPlay) {
      if (c.value === 'reverse') this.playDirection *= -1;
      if (c.value === 'skip') skips++;
      if (c.value === 'draw2') this.pendingDraws += 2;
      if (c.value === 'wild_draw4') this.pendingDraws += 4;
    }

    // Comprobar fin de juego (UNO)
    if (player.hand.length === 1 && !player.hasYelledUno) {
      // No gritó UNO (puede ser penalizado si alguien lo denuncia)
    } else if (player.hand.length === 0) {
      this.state = 'FINISHED';
      this.winner = player.userId;
      this.broadcastMessage(`¡${player.nickname} HA GANADO LA PARTIDA! 🎉`);
      this.broadcastState();
      return;
    }

    player.hasYelledUno = false; // Resetear el grito si tira cartas y le quedan más de 1

    // Transiciones de estado
    if (firstCard.color === 'wild') {
      this.state = 'CHOOSING_COLOR';
      this.actionRequiredFrom = userId;
      // No avanzamos turno aún
    } else if (this.rules.zeroAndSevenRules && firstCard.value === '7' && cardsToPlay.length === 1) {
      this.state = 'CHOOSING_PLAYER';
      this.actionRequiredFrom = userId;
    } else {
      if (this.rules.zeroAndSevenRules && firstCard.value === '0') {
        this.applyZeroRule();
      }
      this.advanceTurn(1 + skips);
    }

    this.broadcastState();
  }

  public drawFromDeck(userId: string) {
    if (this.state !== 'PLAYING') return;
    if (this.players[this.currentTurnIndex].userId !== userId) return;

    const player = this.players[this.currentTurnIndex];

    if (this.pendingDraws > 0) {
      // Comerse las acumuladas
      const cards = this.drawCards(this.pendingDraws);
      player.hand.push(...cards);
      this.broadcastMessage(`${player.nickname} robó ${this.pendingDraws} cartas.`);
      
      this.broadcastCallback("game_action", {
        action: "rival_drew",
        userId: player.userId,
        cardsCount: this.pendingDraws
      });

      this.pendingDraws = 0;
      this.advanceTurn(1);
    } else {
      // Robar normal
      if (this.rules.drawUntilPlayable) {
        let drew = 0;
        let drawnCard: Card;
        do {
          drawnCard = this.drawCards(1)[0];
          player.hand.push(drawnCard);
          drew++;
        } while (drawnCard.color !== 'wild' && drawnCard.color !== this.currentColor && drawnCard.value !== this.discardPile[this.discardPile.length-1].value);
        this.broadcastMessage(`${player.nickname} robó ${drew} cartas buscando una jugable.`);
        
        this.broadcastCallback("game_action", {
          action: "rival_drew",
          userId: player.userId,
          cardsCount: drew
        });
      } else {
        const card = this.drawCards(1)[0];
        player.hand.push(card);
        this.broadcastMessage(`${player.nickname} robó una carta.`);
        
        this.broadcastCallback("game_action", {
          action: "rival_drew",
          userId: player.userId,
          cardsCount: 1
        });
      }
      this.advanceTurn(1);
    }
    
    player.hasYelledUno = false;
    this.broadcastState();
  }

  public declareColor(userId: string, color: CardColor) {
    if (this.state !== 'CHOOSING_COLOR' || this.actionRequiredFrom !== userId) return;
    this.currentColor = color;
    this.state = 'PLAYING';
    
    // Si era un 7 de color (regla colombiana wild 7?), no lo implementamos para wild.
    this.advanceTurn(1); // El comodín ya incluye su propio efecto en playCards (como wild_draw4), solo avanzamos
    this.broadcastState();
  }

  public swapHands(userId: string, targetUserId: string) {
    if (this.state !== 'CHOOSING_PLAYER' || this.actionRequiredFrom !== userId) return;
    
    const p1 = this.players.find(p => p.userId === userId);
    const p2 = this.players.find(p => p.userId === targetUserId);
    
    if (p1 && p2) {
      const temp = p1.hand;
      p1.hand = p2.hand;
      p2.hand = temp;
      this.broadcastMessage(`${p1.nickname} intercambió su mano con ${p2.nickname}!`);
    }

    this.state = 'PLAYING';
    this.advanceTurn(1);
    this.broadcastState();
  }

  public yellUno(userId: string) {
    const player = this.players.find(p => p.userId === userId);
    if (!player) return;
    
    if (player.hand.length <= 2) {
      player.hasYelledUno = true;
      this.broadcastMessage(`¡${player.nickname} gritó UNO!`);
    }
  }

  public challengeUno(challengerId: string, targetId: string) {
    const target = this.players.find(p => p.userId === targetId);
    if (!target) return;

    if (target.hand.length === 1 && !target.hasYelledUno) {
      target.hand.push(...this.drawCards(2));
      const challenger = this.players.find(p => p.userId === challengerId);
      this.broadcastMessage(`${challenger?.nickname} denunció a ${target.nickname}. ¡Roba 2 cartas!`);
      this.broadcastState();
    }
  }

  // --- UTILS ---
  private applyZeroRule() {
    this.broadcastMessage(`¡REGLA DEL 0! Todas las manos rotan.`);
    const hands = this.players.map(p => p.hand);
    
    if (this.playDirection === 1) {
      // Rotar a la derecha
      const lastHand = hands.pop()!;
      hands.unshift(lastHand);
    } else {
      // Rotar a la izquierda
      const firstHand = hands.shift()!;
      hands.push(firstHand);
    }

    this.players.forEach((p, i) => p.hand = hands[i]);
  }

  private advanceTurn(steps: number) {
    let rawIndex = this.currentTurnIndex + (steps * this.playDirection);
    while (rawIndex < 0) rawIndex += this.players.length;
    this.currentTurnIndex = rawIndex % this.players.length;
  }

  private drawCards(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        // Reshuffle discard pile (except top card)
        const topCard = this.discardPile.pop();
        this.deck = this.discardPile;
        this.shuffleDeck();
        this.discardPile = topCard ? [topCard] : [];
        if (this.deck.length === 0) break; // Si no hay cartas, rompemos
      }
      drawn.push(this.deck.pop()!);
    }
    return drawn;
  }

  private generateDeck(): Card[] {
    const deck: Card[] = [];
    const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
    
    for (const color of colors) {
      deck.push({ id: generateId(), color, value: '0' });
      for (let i = 1; i <= 9; i++) {
        deck.push({ id: generateId(), color, value: i.toString() as CardValue });
        deck.push({ id: generateId(), color, value: i.toString() as CardValue });
      }
      for (let action of ['skip', 'reverse', 'draw2'] as CardValue[]) {
        deck.push({ id: generateId(), color, value: action });
        deck.push({ id: generateId(), color, value: action });
      }
    }
    
    for (let i = 0; i < 4; i++) {
      deck.push({ id: generateId(), color: 'wild', value: 'wild' });
      deck.push({ id: generateId(), color: 'wild', value: 'wild_draw4' });
    }
    
    return deck;
  }

  private shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // --- BROADCAST (Zero Trust Output) ---
  private broadcastMessage(msg: string) {
    this.broadcastCallback("game_message", { message: msg });
  }

  public broadcastState() {
    // A cada jugador le enviamos su estado privado
    for (const p of this.players) {
      const state = {
        state: this.state,
        currentTurnUserId: this.players[this.currentTurnIndex]?.userId || '',
        playDirection: this.playDirection,
        currentColor: this.currentColor,
        pendingDraws: this.pendingDraws,
        topCard: this.discardPile[this.discardPile.length - 1],
        actionRequiredFrom: this.actionRequiredFrom,
        winner: this.winner,
        myHand: p.hand, // Secreto
        // Información pública de rivales
        rivals: this.players.filter(r => r.userId !== p.userId).map(r => ({
          userId: r.userId,
          nickname: r.nickname,
          avatarId: r.avatarId,
          color: r.color,
          cardCount: r.hand.length,
          hasYelledUno: r.hasYelledUno
        }))
      };
      // Aquí el puente es el Socket.io global (se llamará desde server.ts)
      this.broadcastCallback("game_state_update", { targetUserId: p.userId, state });
    }
  }
}
