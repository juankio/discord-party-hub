import { useSound } from '@vueuse/sound'
import { useAudioStore } from '~/stores/audioStore'
import { watch } from 'vue'

export const useAppAudio = () => {
  const audioStore = useAudioStore()

  const { play: playJoinSound, sound: joinSound } = useSound('/sounds/lobby_join.mp3', {
    volume: audioStore.masterVolume
  })

  const { play: playStartSound, sound: startSound } = useSound('/sounds/game_started.mp3', {
    volume: audioStore.masterVolume
  })

  watch(() => audioStore.masterVolume, (newVal) => {
    if (joinSound.value) joinSound.value.volume(newVal)
    if (startSound.value) startSound.value.volume(newVal)
  })

  const playJoin = () => {
    if (!audioStore.isMuted) {
      playJoinSound()
    }
  }

  const playStart = () => {
    if (!audioStore.isMuted) {
      playStartSound()
    }
  }

  return { playJoin, playStart }
}
