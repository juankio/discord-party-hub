export const getAvatarPositionLogic = (index: number, total: number, normalizedMyIndex: number) => {
  const slots = [
    { left: '50%', top: 'calc(100% - var(--hole-mid-y))', transform: 'translate(-50%, -50%)' }, // 0
    { left: '50%', top: 'var(--hole-mid-y)', transform: 'translate(-50%, -50%)' },   // 1
    { left: 'var(--hole-offset-x)', top: 'var(--hole-offset-y)', transform: 'translate(-50%, -50%)' },    // 2
    { left: 'calc(100% - var(--hole-offset-x))', top: 'var(--hole-offset-y)', transform: 'translate(-50%, -50%)' },  // 3
    { left: 'var(--hole-offset-x)', top: 'calc(100% - var(--hole-offset-y))', transform: 'translate(-50%, -50%)' },  // 4
    { left: 'calc(100% - var(--hole-offset-x))', top: 'calc(100% - var(--hole-offset-y))', transform: 'translate(-50%, -50%)' }, // 5
    { left: 'calc(var(--hole-offset-x) - 1.5rem)', top: '50%', transform: 'translate(-50%, -50%)' }, // 6
    { left: 'calc(100% - var(--hole-offset-x) + 1.5rem)', top: '50%', transform: 'translate(-50%, -50%)' } // 7
  ];

  const distance = (index - normalizedMyIndex + total) % total;

  let layout: number[] = [];
  if (total <= 1) {
    layout = [0];
  } else if (total === 2) {
    layout = [0, 1];
  } else if (total === 3) {
    layout = [0, 2, 3];
  } else if (total === 4) {
    layout = [4, 2, 3, 5]; 
  } else if (total === 5) {
    layout = [0, 4, 2, 3, 5]; 
  } else if (total === 6) {
    layout = [0, 4, 2, 1, 3, 5]; 
  } else if (total === 7) {
    layout = [0, 4, 6, 2, 1, 3, 5]; 
  } else {
    layout = [0, 4, 6, 2, 1, 3, 7, 5]; 
  }

  const slotIndex = layout[distance] !== undefined ? layout[distance] : 0;
  return slots[slotIndex % slots.length]!;
};
