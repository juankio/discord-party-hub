import anime from 'animejs';

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
    if (action === 'action_intercept') {
      const interceptorEl = document.getElementById(`rival-avatar-${userId}`);
      const interceptorX = interceptorEl ? interceptorEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
      const interceptorY = interceptorEl ? interceptorEl.getBoundingClientRect().top + 30 : window.innerHeight / 2;

      // Onda expansiva localizada (Shockwave ring)
      const ring = document.createElement('div');
      ring.className = 'fixed z-[9998] rounded-full border-[3px] border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] pointer-events-none';
      ring.style.left = `${interceptorX}px`;
      ring.style.top = `${interceptorY}px`;
      ring.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(ring);

      anime({
        targets: ring,
        width: ['0px', '250px'],
        height: ['0px', '250px'],
        opacity: [1, 0],
        borderWidth: ['10px', '0px'],
        duration: 600,
        easing: 'easeOutCubic',
        complete: () => ring.remove()
      });

      // Tipografía veloz y de neón "CORTE EXACTO"
      const text = document.createElement('div');
      text.textContent = 'CORTE EXACTO';
      text.className = 'fixed z-[9999] top-1/2 left-1/2 text-4xl md:text-6xl text-white font-black uppercase italic tracking-[0.2em] whitespace-nowrap pointer-events-none';
      text.style.textShadow = '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.6)';
      document.body.appendChild(text);

      anime.timeline({
        targets: text,
        complete: () => text.remove()
      })
      .add({
        translateX: ['-100vw', '-50%'],
        translateY: ['-50%', '-50%'],
        skewX: [45, 15],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutCubic'
      })
      .add({
        translateX: ['-50%', '100vw'],
        skewX: [15, -45],
        opacity: [1, 0],
        duration: 350,
        delay: 500,
        easing: 'easeInCubic'
      });
      return;
    }

    if (action === 'action_challenge') {
      const victimId = targetId || userId;
      const victimAvatarEl = document.getElementById(`rival-avatar-${victimId}`);
      const victimX = victimAvatarEl ? victimAvatarEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
      const victimY = victimAvatarEl ? victimAvatarEl.getBoundingClientRect().top + 30 : window.innerHeight / 2;

      const textClone = document.createElement('div');
      textClone.textContent = '¡Te Pillé!';
      textClone.className = 'fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-8xl text-red-500 font-black drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] uppercase italic text-center whitespace-nowrap';
      document.body.appendChild(textClone);

      anime({
        targets: textClone,
        scale: [0, 1.2, 1],
        translateX: ['-50%', 'calc(-50% - 10px)', 'calc(-50% + 10px)', 'calc(-50% - 10px)', '-50%'],
        translateY: '-50%',
        opacity: [0, 1, 0],
        duration: 1500,
        complete: () => textClone.remove()
      });

      const deckEl = document.querySelector('.deck-placeholder');
      const startX = deckEl ? deckEl.getBoundingClientRect().left : window.innerWidth / 2;
      const startY = deckEl ? deckEl.getBoundingClientRect().top : window.innerHeight / 2;

      for (let i = 0; i < 2; i++) {
        setTimeout(() => {
          const cardClone = document.createElement('div');
          cardClone.className = 'w-16 h-24 bg-red-800 rounded border-2 border-white fixed z-[9999] shadow-xl';
          cardClone.style.top = `${startY}px`;
          cardClone.style.left = `${startX}px`;
          document.body.appendChild(cardClone);

          anime({
            targets: cardClone,
            top: victimY,
            left: victimX,
            scale: 0.2,
            opacity: [1, 0],
            rotate: anime.random(-45, 45),
            duration: 400,
            easing: 'easeOutCubic',
            complete: () => cardClone.remove()
          });
        }, i * 150);
      }
      return;
    }

    if (action === 'action_reverse') {
      const clone = document.createElement('div');
      clone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 sm:w-20 sm:h-20 ${getColorClass()}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 17H3"/><path d="m6 14-3 3 3 3"/><path d="M3 7h18"/><path d="m18 10 3-3-3-3"/></svg>`;
      clone.className = 'fixed z-[9999] top-1/2 left-1/2 flex items-center justify-center';
      clone.style.opacity = '0';
      document.body.appendChild(clone);
      
      const tl = anime.timeline({
        targets: clone,
        complete: () => clone.remove()
      });

      tl.add({
        scale: [0, 3],
        opacity: [0, 1],
        rotate: '1turn',
        translateX: '-50%',
        translateY: '-50%',
        duration: 800,
        easing: 'easeOutElastic(1, .5)'
      }).add({
        scale: 0,
        opacity: 0,
        duration: 400,
        delay: 800,
        easing: 'easeInCubic'
      });
      return;
    }

    if (action === 'action_skip') {
      const victimId = targetId || userId;
      const victimAvatarEl = document.getElementById(`rival-avatar-${victimId}`);
      const victimX = victimAvatarEl ? victimAvatarEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
      const victimY = victimAvatarEl ? victimAvatarEl.getBoundingClientRect().top + 30 : window.innerHeight / 2;

      const clone = document.createElement('div');
      clone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 sm:w-20 sm:h-20 ${getColorClass()}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`;
      clone.className = 'fixed z-[9999] flex items-center justify-center';
      clone.style.top = `${victimY}px`;
      clone.style.left = `${victimX}px`;
      clone.style.opacity = '0';
      document.body.appendChild(clone);

      const tl = anime.timeline({
        targets: clone,
        complete: () => clone.remove()
      });

      tl.add({
        scale: [0, 2],
        opacity: [0, 1],
        translateX: '-50%',
        translateY: '-50%',
        duration: 400,
        easing: 'easeOutBack'
      }).add({
        translateX: ['-50%', 'calc(-50% - 20px)', 'calc(-50% + 20px)', 'calc(-50% - 20px)', 'calc(-50% + 20px)', 'calc(-50% - 20px)', 'calc(-50% + 20px)', 'calc(-50% - 20px)', 'calc(-50% + 20px)', '-50%'],
        duration: 1200,
        easing: 'easeInOutSine'
      }).add({
        scale: 1,
        opacity: 0,
        duration: 400,
        easing: 'easeInCubic'
      });
      return;
    }

    if (action === 'action_zero') {
      const clone = document.createElement('div');
      clone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 sm:w-20 sm:h-20 ${getColorClass()}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
      clone.className = 'fixed z-[9999] top-1/2 left-1/2 flex items-center justify-center';
      clone.style.opacity = '0';
      document.body.appendChild(clone);

      const tl = anime.timeline({
        targets: clone,
        complete: () => clone.remove()
      });

      tl.add({
        scale: [0, 2],
        opacity: [0, 1],
        rotate: '1080deg',
        translateX: '-50%',
        translateY: '-50%',
        duration: 1000,
        easing: 'easeOutCubic'
      }).add({
        scale: 0,
        opacity: 0,
        duration: 500,
        delay: 1000,
        easing: 'easeInCubic'
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
  };

  return {
    executeActionFx
  };
}
