import type { Card, UnoRules } from './UnoTypes.js';

export class UnoRulesManager {
  static canPlayCard(
    card: Card, 
    topCard: Card | undefined, 
    currentColor: string, 
    pendingDraws: number, 
    isMyTurn: boolean, 
    rules: UnoRules, 
    cardsToPlayCount: number
  ): { valid: boolean; isIntercept: boolean } {
    if (!topCard) return { valid: false, isIntercept: false };

    // Interception (Corte)
    if (!isMyTurn && rules.interceptExact && cardsToPlayCount === 1) {
      if (card.color !== 'wild' && card.color === topCard.color && card.value === topCard.value) {
        return { valid: true, isIntercept: true };
      }
      return { valid: false, isIntercept: false };
    } else if (!isMyTurn) {
      return { valid: false, isIntercept: false };
    }

    // Pending Draws (Stacking)
    if (pendingDraws > 0) {
      if (rules.stackDrawCards) {
        if (card.value === 'draw2' || card.value === 'wild_draw4') {
          return { valid: true, isIntercept: false };
        }
      }
      return { valid: false, isIntercept: false };
    }

    // Normal play
    const validColor = card.color === 'wild' || card.color === currentColor;
    const validValue = card.value === topCard.value;
    
    return { valid: validColor || validValue, isIntercept: false };
  }

  static getSkipsAndDraws(cards: Card[]): { skips: number; draws: number } {
    let skips = 0;
    let draws = 0;
    for (const c of cards) {
      if (c.value === 'skip') skips++;
      if (c.value === 'reverse') skips++; // Depending on player count handled in engine
      if (c.value === 'draw2') draws += 2;
      if (c.value === 'wild_draw4') draws += 4;
    }
    return { skips, draws };
  }
}
