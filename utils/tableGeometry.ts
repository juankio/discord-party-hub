export const getAvatarPositionLogic = (index: number, total: number, _unused: number) => {
  const slots = [
    { left: '50%', top: 'calc(100% - var(--hole-mid-y))', transform: 'translate(-50%, -50%)' }, // 0 (Centro Abajo)
    { left: '50%', top: 'var(--hole-mid-y)', transform: 'translate(-50%, -50%)' },   // 1 (Centro Arriba)
    { left: 'var(--hole-offset-x)', top: 'var(--hole-offset-y)', transform: 'translate(-50%, -50%)' },    // 2 (Sup Izq)
    { left: 'calc(100% - var(--hole-offset-x))', top: 'var(--hole-offset-y)', transform: 'translate(-50%, -50%)' },  // 3 (Sup Der)
    { left: 'var(--hole-offset-x)', top: 'calc(100% - var(--hole-offset-y))', transform: 'translate(-50%, -50%)' },  // 4 (Inf Izq)
    { left: 'calc(100% - var(--hole-offset-x))', top: 'calc(100% - var(--hole-offset-y))', transform: 'translate(-50%, -50%)' }, // 5 (Inf Der)
    { left: 'calc(var(--hole-offset-x) - 1.5rem)', top: '50%', transform: 'translate(-50%, -50%)' }, // 6 (Ext Izq)
    { left: 'calc(100% - var(--hole-offset-x) + 1.5rem)', top: '50%', transform: 'translate(-50%, -50%)' } // 7 (Ext Der)
  ];

  let mapping: number[] = [];
  if (total <= 1) mapping = [0];
  else if (total === 2) mapping = [0, 1];
  else if (total === 3) mapping = [0, 2, 3]; // CentroAbajo, SupIzq, SupDer
  else if (total === 4) mapping = [0, 2, 1, 3]; // CentroAbajo, SupIzq, CentroArriba, SupDer
  else if (total === 5) mapping = [0, 4, 2, 3, 5]; // CentroAbajo, InfIzq, SupIzq, SupDer, InfDer
  else if (total === 6) mapping = [0, 4, 2, 1, 3, 5]; // Todas las troneras
  else if (total === 7) mapping = [0, 4, 6, 2, 1, 3, 5];
  else mapping = [0, 4, 6, 2, 1, 3, 7, 5]; // 8 jugadores

  const slotIndex = mapping[index] ?? 0;
  return slots[slotIndex]!;
};
