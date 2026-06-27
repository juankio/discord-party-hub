import anime from 'animejs';

export function useUnoDrawFx(socket: any, playerStore: any) {
  const drawCardAnimation = () => {
    socket.value?.emit('uno:draw_card');
  };

  const executeRivalDrew = (cardsCount: number, userId: string) => {
    const deckEl = document.querySelector('.deck-placeholder');
    if (!deckEl) return;

    if (userId === playerStore.userId) {
      // Somos nosotros mismos robando, así que animamos las cartas volando a nuestra mano (abajo centro)
      const deckRect = deckEl.getBoundingClientRect();
      for (let i = 0; i < cardsCount; i++) {
        setTimeout(() => {
          const clone = document.createElement('div');
          clone.className = 'w-16 h-24 bg-red-800 rounded border-2 border-white fixed z-[9999] shadow-xl';
          clone.style.top = `${deckRect.top}px`;
          clone.style.left = `${deckRect.left}px`;
          document.body.appendChild(clone);
          
          anime({
            targets: clone,
            top: window.innerHeight - 50,
            left: window.innerWidth / 2, 
            scale: 0.5, 
            opacity: [1, 0], 
            rotate: anime.random(-25, 25),
            duration: 400, 
            easing: 'easeOutCubic',
            complete: () => clone.remove()
          });
        }, i * 150);
      }
    } else {
      const rivalAvatarEl = document.getElementById(`rival-avatar-${userId}`);
      const startX = rivalAvatarEl ? rivalAvatarEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
      const startY = rivalAvatarEl ? rivalAvatarEl.getBoundingClientRect().top + 30 : -50;
      
      const deckRect = deckEl.getBoundingClientRect();
      for (let i = 0; i < cardsCount; i++) {
        setTimeout(() => {
          const clone = document.createElement('div');
          clone.className = 'w-16 h-24 bg-red-800 rounded border-2 border-white fixed z-[9999] shadow-xl';
          clone.style.top = `${deckRect.top}px`;
          clone.style.left = `${deckRect.left}px`;
          document.body.appendChild(clone);
          
          anime({
            targets: clone,
            top: startY,
            left: startX, 
            scale: 0.2, 
            opacity: [1, 0], 
            rotate: anime.random(-45, 45),
            duration: 400, 
            easing: 'easeOutCubic',
            complete: () => clone.remove()
          });
        }, i * 150);
      }
    }
  };

  return {
    drawCardAnimation,
    executeRivalDrew
  };
}
