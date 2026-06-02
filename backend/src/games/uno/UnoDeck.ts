import { generateId } from './UnoTypes.js';
import type { Card, CardColor, CardValue } from './UnoTypes.js';

export class UnoDeckManager {
  public deck: Card[] = [];
  public discardPile: Card[] = [];

  constructor() {
    this.deck = this.generateDeck();
    this.shuffleDeck();
  }

  public reset() {
    this.deck = this.generateDeck();
    this.shuffleDeck();
    this.discardPile = [];
  }

  public drawCards(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        const topCard = this.discardPile.pop();
        this.deck = this.discardPile;
        this.shuffleDeck();
        this.discardPile = topCard ? [topCard] : [];
        if (this.deck.length === 0) break;
      }
      const card = this.deck.pop();
      if (card !== undefined) {
        drawn.push(card);
      }
    }
    return drawn;
  }

  public getTopDiscard(): Card | undefined {
    return this.discardPile[this.discardPile.length - 1];
  }

  public discard(cards: Card[]) {
    this.discardPile.push(...cards);
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
      for (const action of ['skip', 'reverse', 'draw2'] as CardValue[]) {
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

  public shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.deck[i];
      const target = this.deck[j];
      if (temp !== undefined && target !== undefined) {
        this.deck[i] = target;
        this.deck[j] = temp;
      }
    }
  }
}
