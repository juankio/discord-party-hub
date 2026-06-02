import type { Player, UnoRules, GameState, Card, CardColor } from './UnoTypes.js';
import { UnoDeckManager } from './UnoDeck.js';
import { UnoActions } from './UnoActions.js';

export class UnoEngine {
  public roomId: string;
  public players: Player[] = [];
  public state: GameState = 'WAITING';
  
  public deckManager = new UnoDeckManager();
  
  public currentTurnIndex: number = 0;
  public playDirection: 1 | -1 = 1;
  public currentColor: CardColor | '' = ''; 
  public pendingDraws: number = 0; 
  public actionRequiredFrom: string = ''; 
  public winner: string | null = null;
  
  public rules: UnoRules = {
    stackDrawCards: false, drawUntilPlayable: false,
    playMultipleSame: false, interceptExact: false, zeroAndSevenRules: false
  };

  private broadcastCallback: (event: string, data?: any) => void;

  constructor(roomId: string, broadcastCallback: (event: string, data?: any) => void) {
    this.roomId = roomId;
    this.broadcastCallback = broadcastCallback;
  }

  public addPlayer(userId: string, socketId: string, nickname: string, avatarId: number, color: string) {
    const existing = this.players.find(p => p.userId === userId);
    if (!existing) {
      if (this.state !== 'WAITING') return;
      this.players.push({ userId, socketId, nickname, avatarId, color, hand: [], hasYelledUno: false });
    } else {
      existing.socketId = socketId; existing.nickname = nickname; existing.avatarId = avatarId; existing.color = color;
    }
  }

  public removePlayer(userId: string) {
    this.players = this.players.filter(p => p.userId !== userId);
    if (this.state !== 'WAITING' && this.state !== 'FINISHED') {
      if (this.players.length < 2) {
        this.state = 'FINISHED';
        this.broadcastState();
      } else {
        this.currentTurnIndex = this.currentTurnIndex % this.players.length;
        this.broadcastState();
      }
    }
  }

  public startGame(rules: UnoRules) {
    if (this.players.length < 2) return;
    this.rules = rules;
    this.deckManager.reset();
    this.pendingDraws = 0; this.playDirection = 1; this.currentTurnIndex = 0;
    
    for (const p of this.players) { p.hand = this.deckManager.drawCards(7); p.hasYelledUno = false; }

    let firstCard = this.deckManager.drawCards(1)[0];
    if (!firstCard) return;
    while (['wild', 'reverse', 'skip', 'draw2'].includes(firstCard.value) || firstCard.color === 'wild') {
      this.deckManager.deck.push(firstCard);
      this.deckManager.shuffleDeck();
      firstCard = this.deckManager.drawCards(1)[0] || firstCard;
    }
    this.deckManager.discardPile.push(firstCard);
    this.currentColor = firstCard.color;
    
    this.state = 'PLAYING';
    this.broadcastState();
    this.broadcastMessage(`¡La partida ha comenzado!`);
  }

  public playCards(userId: string, cardIds: string[]) {
    UnoActions.playCards(this, userId, cardIds);
  }

  public drawFromDeck(userId: string) {
    UnoActions.drawFromDeck(this, userId);
  }

  public declareColor(userId: string, color: CardColor) {
    UnoActions.declareColor(this, userId, color);
  }

  public swapHands(userId: string, targetUserId: string) {
    UnoActions.swapHands(this, userId, targetUserId);
  }

  public yellUno(userId: string) {
    const player = this.players.find(p => p.userId === userId);
    if (player && player.hand.length <= 2) {
      player.hasYelledUno = true;
      this.broadcastMessage(`¡${player.nickname} gritó UNO!`);
    }
  }

  public challengeUno(challengerId: string, targetId: string) {
    UnoActions.challengeUno(this, challengerId, targetId);
  }

  public surrender(userId: string) {
    UnoActions.surrender(this, userId);
  }

  public async registerWin(userId: string) {
    try {
      await fetch('http://localhost:3000/api/leaderboard/win', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, game: 'unoWins' })
      });
    } catch (e) { console.error('Error registrando victoria en DB:', e); }
  }

  public applyZeroRule() {
    const hands = this.players.map(p => p.hand);
    if (this.playDirection === 1) hands.unshift(hands.pop()!);
    else hands.push(hands.shift()!);
    this.players.forEach((p, i) => p.hand = hands[i] || []);
  }

  public advanceTurn(steps: number) {
    let rawIndex = this.currentTurnIndex + (steps * this.playDirection);
    while (rawIndex < 0) rawIndex += this.players.length;
    this.currentTurnIndex = rawIndex % this.players.length;
  }

  public broadcastMessage(msg: string) { this.broadcastCallback("game_message", { message: msg }); }
  public broadcastAction(action: string, userId: string, cardsCount: number) { this.broadcastCallback("game_action", { action, userId, cardsCount }); }

  public broadcastState() {
    for (const p of this.players) {
      this.broadcastCallback("game_state_update", {
        targetUserId: p.userId,
        state: {
          state: this.state, currentTurnUserId: this.players[this.currentTurnIndex]?.userId || '',
          playDirection: this.playDirection, currentColor: this.currentColor,
          pendingDraws: this.pendingDraws, topCard: this.deckManager.getTopDiscard(),
          actionRequiredFrom: this.actionRequiredFrom, winner: this.winner, myHand: p.hand,
          rivals: this.players.filter(r => r.userId !== p.userId).map(r => ({
            userId: r.userId, nickname: r.nickname, avatarId: r.avatarId, color: r.color,
            cardCount: r.hand.length, hasYelledUno: r.hasYelledUno
          }))
        }
      });
    }
  }
}

