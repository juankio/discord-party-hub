import { fxIntercept, fxChallenge, fxReverse, fxSkip, fxZero, fxSwap } from './unoAnim';

export function useUnoActionFx(unoStore: any) {
  const getColorClass = () => {
    const color = unoStore.currentColor || unoStore.topCard?.color;
    switch (color) {
      case 'red': return 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]';
      case 'blue': return 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]';
      case 'green': return 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]';
      case 'yellow': return 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]';
      default: return 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]';
    }
  };

  const executeActionFx = (action: string, userId: string, targetId?: string) => {
    const colorClass = getColorClass();
    const victimId = targetId || userId;

    if (action === 'action_intercept') {
      fxIntercept(userId);
    } else if (action === 'action_challenge') {
      fxChallenge(victimId);
    } else if (action === 'action_reverse') {
      fxReverse(colorClass);
    } else if (action === 'action_skip') {
      fxSkip(victimId, colorClass);
    } else if (action === 'action_zero') {
      fxZero(colorClass);
    } else if (action === 'action_swap') {
      fxSwap(userId, targetId || userId);
    }
  };

  return { executeActionFx };
}
