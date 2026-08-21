import { watch, nextTick } from 'vue';
import anime from 'animejs';

export function useUnoPlayFx(socket: any, unoStore: any) {
  const playCardAnimation = (id: string) => {
    socket.value?.emit('uno:play_cards', [id]);
  };

  const executeRivalPlayed = (userId: string) => {
    const topCardEl = document.querySelector('.top-card-placeholder');
    const rivalAvatarEl = document.getElementById(`rival-avatar-${userId}`);
    
    // Coordenadas por defecto si el avatar no está visible por alguna razón
    const startX = rivalAvatarEl ? rivalAvatarEl.getBoundingClientRect().left + 30 : window.innerWidth / 2;
    const startY = rivalAvatarEl ? rivalAvatarEl.getBoundingClientRect().top + 30 : -50;
    
    if (topCardEl) {
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
  };

  const watchTopCard = () => {
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
  };

  return {
    playCardAnimation,
    executeRivalPlayed,
    watchTopCard
  };
}
