import { useSound } from '@vueuse/sound';
import { computed, watch, ref } from 'vue';
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
      // Forzar que el volumen sea correcto antes de reproducir, por si acaso
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
