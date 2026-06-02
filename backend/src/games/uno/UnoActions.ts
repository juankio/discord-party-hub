import type { CardColor, Card } from './UnoTypes.js';
import type { UnoEngine } from './UnoEngine.js';
import { UnoRulesManager } from './UnoRules.js';

export class UnoActions {
  static playCards(engine: UnoEngine, userId: string, cardIds: string[]) {
    if (engine.state !== 'PLAYING') return;
    const player = engine.players.find(p => p.userId === userId);
    if (!player) return;

    const cardsToPlay = player.hand.filter(c => cardIds.includes(c.id));
    if (cardsToPlay.length === 0 || cardsToPlay.length !== cardIds.length) return;
    if (cardsToPlay.length > 1 && (!engine.rules.playMultipleSame || !cardsToPlay.every(c => c.value === (cardsToPlay[0] as Card).value))) return;

    const topCard = engine.deckManager.getTopDiscard();
    const isMyTurn = engine.players[engine.currentTurnIndex]?.userId === userId;
    const firstCard = cardsToPlay[0] as Card;
    if (!firstCard) return;

    const validation = UnoRulesManager.canPlayCard(firstCard, topCard, engine.currentColor, engine.pendingDraws, isMyTurn, engine.rules, cardsToPlay.length);
    if (!validation.valid) return;

    if (validation.isIntercept) {
      engine.currentTurnIndex = engine.players.findIndex(p => p.userId === userId);
      engine.broadcastMessage(`${player.nickname} interrumpió con un corte exacto!`);
    }

    player.hand = player.hand.filter(h => !cardsToPlay.some(c => c.id === h.id));
    engine.deckManager.discard(cardsToPlay);
    
    engine.broadcastAction("rival_played", player.userId, cardsToPlay.length);

    if (firstCard.color !== 'wild') engine.currentColor = firstCard.color;

    const { skips, draws } = UnoRulesManager.getSkipsAndDraws(cardsToPlay);
    engine.pendingDraws += draws;
    
    let totalSkips = skips;
    if (cardsToPlay.some(c => c.value === 'reverse')) {
      if (engine.players.length === 2) totalSkips += cardsToPlay.filter(c => c.value === 'reverse').length;
      else engine.playDirection *= -1;
    }

    if (player.hand.length === 0) {
      engine.state = 'FINISHED'; engine.winner = player.userId;
      engine.broadcastMessage(`¡${player.nickname} HA GANADO! 🎉`);
      engine.registerWin(player.userId);
      return engine.broadcastState();
    }

    if (player.hand.length > 1) player.hasYelledUno = false;

    if (firstCard.color === 'wild') {
      engine.state = 'CHOOSING_COLOR'; engine.actionRequiredFrom = userId;
    } else if (engine.rules.zeroAndSevenRules && firstCard.value === '7' && cardsToPlay.length === 1) {
      engine.state = 'CHOOSING_PLAYER'; engine.actionRequiredFrom = userId;
    } else {
      if (engine.rules.zeroAndSevenRules && firstCard.value === '0') engine.applyZeroRule();
      engine.advanceTurn(1 + totalSkips);
    }
    engine.broadcastState();
  }

  static drawFromDeck(engine: UnoEngine, userId: string) {
    if (engine.state !== 'PLAYING') return;
    const player = engine.players[engine.currentTurnIndex];
    if (!player || player.userId !== userId) return;

    if (engine.pendingDraws > 0) {
      const cards = engine.deckManager.drawCards(engine.pendingDraws);
      player.hand.push(...cards);
      engine.broadcastAction("rival_drew", player.userId, engine.pendingDraws);
      engine.pendingDraws = 0;
      engine.advanceTurn(1);
    } else {
      let drew = 0;
      let drawnCard: Card | undefined;
      do {
        drawnCard = engine.deckManager.drawCards(1)[0];
        if (drawnCard) { player.hand.push(drawnCard); drew++; }
      } while (engine.rules.drawUntilPlayable && drawnCard && !UnoRulesManager.canPlayCard(drawnCard, engine.deckManager.getTopDiscard(), engine.currentColor, 0, true, engine.rules, 1).valid);
      
      engine.broadcastAction("rival_drew", player.userId, drew);
      engine.advanceTurn(1);
    }
    player.hasYelledUno = false;
    engine.broadcastState();
  }

  static declareColor(engine: UnoEngine, userId: string, color: CardColor) {
    if (engine.state !== 'CHOOSING_COLOR' || engine.actionRequiredFrom !== userId) return;
    engine.currentColor = color; engine.state = 'PLAYING';
    engine.advanceTurn(1);
    engine.broadcastState();
  }

  static swapHands(engine: UnoEngine, userId: string, targetUserId: string) {
    if (engine.state !== 'CHOOSING_PLAYER' || engine.actionRequiredFrom !== userId) return;
    const p1 = engine.players.find(p => p.userId === userId);
    const p2 = engine.players.find(p => p.userId === targetUserId);
    if (p1 && p2) {
      const temp = p1.hand; p1.hand = p2.hand; p2.hand = temp;
      engine.broadcastMessage(`${p1.nickname} intercambió mano con ${p2.nickname}!`);
    }
    engine.state = 'PLAYING'; engine.advanceTurn(1); engine.broadcastState();
  }

  static challengeUno(engine: UnoEngine, challengerId: string, targetId: string) {
    const target = engine.players.find(p => p.userId === targetId);
    if (target && target.hand.length === 1 && !target.hasYelledUno) {
      target.hand.push(...engine.deckManager.drawCards(2));
      const challenger = engine.players.find(p => p.userId === challengerId);
      engine.broadcastMessage(`${challenger?.nickname} denunció a ${target.nickname}. ¡Roba 2 cartas!`);
      engine.broadcastState();
    }
  }

  static surrender(engine: UnoEngine, userId: string) {
    if (!['PLAYING', 'CHOOSING_COLOR', 'CHOOSING_PLAYER'].includes(engine.state)) return;
    const player = engine.players.find(p => p.userId === userId);
    if (!player) return;
    engine.broadcastMessage(`${player.nickname} se ha rendido.`);
    if (engine.players.length === 2) {
      const winner = engine.players.find(p => p.userId !== userId);
      engine.state = 'FINISHED'; engine.winner = winner?.userId || null;
      if (winner) { engine.broadcastMessage(`¡${winner.nickname} GANÓ!`); engine.registerWin(winner.userId); }
    } else {
      return engine.removePlayer(userId);
    }
    engine.broadcastState();
  }
}
