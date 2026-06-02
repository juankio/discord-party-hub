import { nextTick, watch, onMounted, onUnmounted } from 'vue';
import anime from 'animejs';

export function useUnoAnimations(unoStore: any, playerStore: any, socket: any) {
  const playCardAnimation = (id: string) => {
    socket.value?.emit('uno:play_cards', [id]);
  };

  const drawCardAnimation = () => {
    const deckEl = document.querySelector('.deck-placeholder');
    if (deckEl) {
      const rect = deckEl.getBoundingClientRect();
      const clone = document.createElement('div');
      clone.className = 'w-20 h-32 bg-red-600 rounded-lg border-4 border-white shadow-xl fixed z-[9999]';
      clone.style.top = `${rect.top}px`;
      clone.style.left = `${rect.left}px`;
      document.body.appendChild(clone);
      
      anime({
        targets: clone,
        top: window.innerHeight - 100,
        left: window.innerWidth / 2,
        scale: 0.5,
        rotate: anime.random(-45, 45),
        opacity: [1, 0],
        duration: 400,
        easing: 'easeInQuad',
        complete: () => {
          clone.remove();
          socket.value?.emit('uno:draw_card');
        }
      });
    } else {
      socket.value?.emit('uno:draw_card');
    }
  };

  const handleRivalAnimation = (e: CustomEvent) => {
    const { action, userId, cardsCount } = e.detail;
    if (userId === playerStore.userId) return;

    const topCardEl = document.querySelector('.top-card-placeholder');
    const deckEl = document.querySelector('.deck-placeholder');
    
    if (action === 'rival_played' && topCardEl) {
      const topRect = topCardEl.getBoundingClientRect();
      const clone = document.createElement('div');
      clone.className = 'w-16 h-24 bg-red-800 rounded border-2 border-white fixed z-[9999]';
      clone.style.top = `-50px`;
      clone.style.left = `${window.innerWidth / 2}px`;
      document.body.appendChild(clone);
      
      anime({
        targets: clone,
        top: topRect.top, left: topRect.left, scale: 0.5, opacity: 0, rotate: anime.random(-45, 45),
        duration: 400, easing: 'easeInCubic',
        complete: () => clone.remove()
      });
    }
    
    if (action === 'rival_drew' && deckEl) {
      const deckRect = deckEl.getBoundingClientRect();
      for (let i = 0; i < cardsCount; i++) {
        setTimeout(() => {
          const clone = document.createElement('div');
          clone.className = 'w-16 h-24 bg-red-800 rounded border-2 border-white fixed z-[9999]';
          clone.style.top = `${deckRect.top}px`;
          clone.style.left = `${deckRect.left}px`;
          document.body.appendChild(clone);
          
          anime({
            targets: clone,
            top: -50, scale: 0.5, opacity: 0, rotate: anime.random(-45, 45),
            duration: 400, easing: 'easeOutCubic',
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
