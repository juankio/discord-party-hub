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

export const generateId = () => Math.random().toString(36).substring(2, 15);
