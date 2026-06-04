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
    const { action, userId, cardsCount, targetId } = e.detail;
    
    if (action === 'action_reverse') {
      const clone = document.createElement('div');
      clone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-32 h-32 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 17H3"/><path d="m6 14-3 3 3 3"/><path d="M3 7h18"/><path d="m18 10 3-3-3-3"/></svg>`;
      clone.className = 'fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center';
      document.body.appendChild(clone);
      
      anime({
        targets: clone,
        rotate: '1turn',
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
        duration: 1000,
        easing: 'easeOutElastic(1, .5)',
        complete: () => clone.remove()
      });
      return;
    }

    if (action === 'action_skip') {
      const victimId = targetId || userId;
      const victimAvatarEl = document.getElementById(`rival-avatar-${victimId}`);
      const victimX = victimAvatarEl ? victimAvatarEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
      const victimY = victimAvatarEl ? victimAvatarEl.getBoundingClientRect().top + 30 : window.innerHeight / 2;

      const clone = document.createElement('div');
      clone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`;
      clone.className = 'fixed z-[9999] flex items-center justify-center -translate-x-1/2 -translate-y-1/2';
      clone.style.top = `${victimY}px`;
      clone.style.left = `${victimX}px`;
      document.body.appendChild(clone);

      anime({
        targets: clone,
        scale: [2, 1],
        translateX: [-10, 10, -10, 10, 0],
        opacity: [0, 1, 1, 0],
        duration: 800,
        easing: 'easeInOutSine',
        complete: () => clone.remove()
      });
      return;
    }

    if (action === 'action_zero') {
      const clone = document.createElement('div');
      clone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-32 h-32 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
      clone.className = 'fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center';
      document.body.appendChild(clone);

      anime({
        targets: clone,
        rotate: '1080deg',
        scale: [0, 2, 0],
        opacity: [0, 1, 0],
        duration: 1500,
        easing: 'easeInOutCubic',
        complete: () => clone.remove()
      });
      return;
    }

    if (action === 'action_swap') {
      const fromEl = document.getElementById(`rival-avatar-${userId}`);
      const toEl = document.getElementById(`rival-avatar-${targetId}`);
      
      const fromX = fromEl ? fromEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
      const fromY = fromEl ? fromEl.getBoundingClientRect().top + 30 : window.innerHeight / 2;
      
      const toX = toEl ? toEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
      const toY = toEl ? toEl.getBoundingClientRect().top + 30 : window.innerHeight / 2;

      const cloneA = document.createElement('div');
      cloneA.className = 'w-12 h-16 bg-red-600 rounded border-2 border-white fixed z-[9999] shadow-2xl';
      cloneA.style.top = `${fromY}px`;
      cloneA.style.left = `${fromX}px`;
      document.body.appendChild(cloneA);

      const cloneB = document.createElement('div');
      cloneB.className = 'w-12 h-16 bg-blue-600 rounded border-2 border-white fixed z-[9999] shadow-2xl';
      cloneB.style.top = `${toY}px`;
      cloneB.style.left = `${toX}px`;
      document.body.appendChild(cloneB);

      anime({
        targets: cloneA,
        top: toY,
        left: toX,
        scale: [0.5, 1.2, 0.5],
        rotate: '1turn',
        duration: 800,
        easing: 'easeInOutQuad',
        complete: () => cloneA.remove()
      });

      anime({
        targets: cloneB,
        top: fromY,
        left: fromX,
        scale: [0.5, 1.2, 0.5],
        rotate: '-1turn',
        duration: 800,
        easing: 'easeInOutQuad',
        complete: () => cloneB.remove()
      });
      return;
    }

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
      window.addEventListener('game_action', handleRivalAnimation as EventListener);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('uno:action', handleRivalAnimation as EventListener);
      window.removeEventListener('game_action', handleRivalAnimation as EventListener);
    }
  });

  return {
    playCardAnimation,
    drawCardAnimation
  };
}
