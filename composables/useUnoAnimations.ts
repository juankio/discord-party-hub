import { nextTick, watch, onMounted, onUnmounted } from 'vue';
import anime from 'animejs';

export function useUnoAnimations(unoStore: any, playerStore: any, socket: any) {
  const playCardAnimation = (id: string) => {
    socket.value?.emit('uno:play_cards', [id]);
  };

  const drawCardAnimation = () => {
    socket.value?.emit('uno:draw_card');
  };

  const handleRivalAnimation = (e: CustomEvent) => {
    const { action, userId, cardsCount } = e.detail;
    const deckEl = document.querySelector('.deck-placeholder');

    if (userId === playerStore.userId) {
      if (action === 'rival_drew' && deckEl) {
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
      }
      return; // No ejecutamos la animación de "Rival"
    }

    const topCardEl = document.querySelector('.top-card-placeholder');
    const rivalAvatarEl = document.getElementById(`rival-avatar-${userId}`);
    
    // Coordenadas por defecto si el avatar no está visible por alguna razón
    const startX = rivalAvatarEl ? rivalAvatarEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
    const startY = rivalAvatarEl ? rivalAvatarEl.getBoundingClientRect().top + 30 : -50;
    
    if (action === 'rival_played' && topCardEl) {
      const topRect = topCardEl.getBoundingClientRect();
      const clone = document.createElement('div');
      clone.className = 'w-16 h-24 bg-red-800 rounded border-2 border-white fixed z-[9999] shadow-xl';
      clone.style.top = `${startY}px`;
      clone.style.left = `${startX}px`;
      document.body.appendChild(clone);
      
      anime({
        targets: clone,
        top: topRect.top, 
        left: topRect.left, 
        scale: [0.5, 1], 
        opacity: [0, 1, 0], 
        rotate: anime.random(-25, 25),
        duration: 400, 
        easing: 'easeOutElastic(1, .5)',
        complete: () => clone.remove()
      });
    }
    
    if (action === 'rival_drew' && deckEl) {
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

  watch(() => unoStore.topCard, async (newCard, oldCard) => {
    if (newCard && newCard.id !== oldCard?.id) {
      await nextTick();
      anime({
        targets: '.top-card-anim',
        scale: [1.5, 1],
        opacity: [0, 1],
        rotate: () => anime.random(-15, 15),
        duration: 400,
        easing: 'easeOutBounce'
      });
    }
  }, { deep: true });

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('uno:action', handleRivalAnimation as EventListener);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('uno:action', handleRivalAnimation as EventListener);
    }
  });

  return {
    playCardAnimation,
    drawCardAnimation
  };
}
