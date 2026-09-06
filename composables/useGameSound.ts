import { useSound } from '@vueuse/sound';
import { computed, watch, ref } from 'vue';
import { Howler } from 'howler';
import { useAudioStore } from '~/stores/audioStore';

export function useGameSound(url: string, options: any = {}) {
  const audioStore = useAudioStore();
  const volume = computed(() => audioStore.activeVolume);

  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    return {
      play: () => {},
      stop: () => {},
      pause: () => {},
      sound: ref(null),
      duration: ref(null)
    };
  }

  const { play: originalPlay, stop, pause, sound, duration } = useSound(url, { 
    ...options, 
    volume: volume.value 
  });

  watch(sound, (newSound) => {
    if (newSound && typeof newSound.volume === 'function') {
      newSound.volume(volume.value);
    }
  });

  watch(volume, (newVol) => {
    if (sound.value && typeof sound.value.volume === 'function') {
      sound.value.volume(newVol);
    }
  });

  const play = (opts?: any) => {
    if (!audioStore.isMuted) {
      if (typeof window !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
          if (sound.value && typeof sound.value.volume === 'function') {
            sound.value.volume(volume.value);
          }
          originalPlay(opts);
        }).catch(() => {});
        return;
      }
      if (sound.value && typeof sound.value.volume === 'function') {
        sound.value.volume(volume.value);
      }
      originalPlay(opts);
    }
  };

  return {
    play,
    stop,
    pause,
    sound,
    duration
  };
}
