/**
 * 🃏 UNO Engine (Esqueleto Base)
 * 
 * Este motor manejará la lógica Zero-Trust del juego de UNO.
 * Mantendrá en memoria el mazo (deck), la pila de descarte (discardPile),
 * las manos secretas de cada jugador y el flujo de los turnos.
 */

export interface Card {
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string; // '0'-'9', 'skip', 'reverse', 'draw2', 'wild', 'wild_draw4'
  id: string; // UUID único para evitar trampas
}

export interface Player {
  userId: string;
  socketId: string;
  hand: Card[]; // Array secreto, no se envía completo al cliente
}

export class UnoEngine {
  private roomId: string;
  private players: Map<string, Player> = new Map();
  
  private deck: Card[] = [];
  private discardPile: Card[] = [];
  
  private currentTurnIndex: number = 0;
  private playDirection: 1 | -1 = 1; // 1 = horario, -1 = antihorario
  private currentColor: string = ''; // Relevante para cuando se juega un comodín (Wild)

  // Opciones de "Reglas de la casa" que definiremos con el usuario
  private rules = {
    stackDrawCards: false,   // ¿Acumular +2/+4?
    playMultipleSame: false, // ¿Jugar múltiples cartas iguales?
    zeroPassHand: false,     // ¿Regla del 0 (Pasa mano)?
    sevenSwapHand: false     // ¿Regla del 7 (Intercambia mano)?
  };

  constructor(roomId: string) {
    this.roomId = roomId;
    // this.initializeDeck();
  }

  // ---- MÉTODOS PÚBLICOS (API del Motor) ----

  public addPlayer(userId: string, socketId: string) {
    this.players.set(userId, { userId, socketId, hand: [] });
  }

  public removePlayer(userId: string) {
    this.players.delete(userId);
    // TODO: Si el juego ya empezó, ¿qué hacemos con sus cartas? 
    // ¿Las devolvemos al mazo?
  }

  public startGame() {
    // TODO: Barajar mazo, repartir 7 cartas a cada jugador
    // TODO: Voltear la primera carta (que no sea un comodín +4)
    // TODO: Emitir evento de 'game_started'
  }

  public playCard(userId: string, cardId: string, declaredColor?: string) {
    // TODO: 1. Validar que es el turno de userId
    // TODO: 2. Validar que userId tiene cardId en su mano
    // TODO: 3. Validar que la carta se puede jugar sobre la pila de descarte
    // TODO: 4. Aplicar efecto (Salto, Reversa, Robar, Cambio de color)
    // TODO: 5. Avanzar el turno
  }

  public drawCard(userId: string) {
    // TODO: Validar que es su turno. Robar 1 carta del deck.
  }

  // ---- MÉTODOS PRIVADOS (Internos) ----

  private initializeDeck() {
    // Lógica para crear las 108 cartas de un mazo estándar de UNO
  }

  private shuffleDeck() {
    // Algoritmo de Fisher-Yates
  }

  private nextTurn() {
    // Avanzar currentTurnIndex respetando el playDirection y saltando a los eliminados
  }

  /**
   * Genera la vista "sanitizada" del estado del juego para un jugador específico.
   * Oculta las manos de los demás.
   */
  public getGameStateForPlayer(userId: string) {
    return {
      currentColor: this.currentColor,
      topCard: this.discardPile[this.discardPile.length - 1],
      isMyTurn: this.isPlayerTurn(userId),
      // Mapeamos a los rivales para enviar solo el COUNT de sus cartas
      rivals: Array.from(this.players.values())
        .filter(p => p.userId !== userId)
        .map(p => ({ userId: p.userId, cardCount: p.hand.length })),
      myHand: this.players.get(userId)?.hand || []
    };
  }

  private isPlayerTurn(userId: string): boolean {
    const playerKeys = Array.from(this.players.keys());
    return playerKeys[this.currentTurnIndex] === userId;
  }
}
