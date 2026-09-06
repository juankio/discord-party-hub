import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

export const useAudioStore = defineStore('audio', () => {
  const isMuted = ref(false);
  const masterVolume = ref(0.5);

  const activeVolume = computed(() => isMuted.value ? 0 : masterVolume.value);

  function initAudio() {
    if (import.meta.client) {
      const savedMuted = localStorage.getItem('party_hub_audio_muted');
      if (savedMuted !== null) {
        isMuted.value = savedMuted === 'true';
      }

      const savedVolume = localStorage.getItem('party_hub_audio_volume');
      if (savedVolume !== null) {
        masterVolume.value = parseFloat(savedVolume);
      }
    }
  }

  function toggleMute() {
    isMuted.value = !isMuted.value;
  }

  function setVolume(volume: number) {
    // Clamping volume between 0.0 and 1.0
    masterVolume.value = Math.max(0, Math.min(1, volume));
  }

  // Watchers for persistence
  watch(isMuted, (newVal) => {
    if (import.meta.client) {
      localStorage.setItem('party_hub_audio_muted', String(newVal));
    }
  });

  watch(masterVolume, (newVal) => {
    if (import.meta.client) {
      localStorage.setItem('party_hub_audio_volume', String(newVal));
    }
  });

  return {
    isMuted,
    masterVolume,
    activeVolume,
    initAudio,
    toggleMute,
    setVolume
  };
});
