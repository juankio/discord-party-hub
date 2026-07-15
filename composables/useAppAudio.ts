import { useGameSound } from './useGameSound'

export const useAppAudio = () => {
  const { play: playJoin } = useGameSound('/sounds/lobby/lobby_join.ogg?v=5')
  const { play: playStart } = useGameSound('/sounds/lobby/game_started.ogg')
  const { play: playUiClick } = useGameSound('/sounds/lobby/ui_click.ogg')
  
  const { play: playCreateRoom } = useGameSound('/sounds/lobby/create_room.ogg')
  const { play: playJoinRoom } = useGameSound('/sounds/lobby/join_room.ogg')
  const { play: playTabSwitch } = useGameSound('/sounds/lobby/tab_switch.ogg')
  const { play: playEnterLobby } = useGameSound('/sounds/lobby/enter_lobby.ogg')

  // Nuevos sonidos del Lobby
  const { play: playBot } = useGameSound('/sounds/lobby/bot_add.ogg?v=5')
  const { play: playBotConfig } = useGameSound('/sounds/lobby/bot_config.ogg')
  const { play: playBotDifficulty } = useGameSound('/sounds/lobby/bot_difficulty.ogg')
  const { play: playBotKick } = useGameSound('/sounds/lobby/bot_kick.ogg')
  const { play: playCopyLink } = useGameSound('/sounds/lobby/copy_link.ogg')
  const { play: playSettings } = useGameSound('/sounds/lobby/settings_open.ogg')
  const { play: playEditProfile } = useGameSound('/sounds/lobby/edit_profile.ogg')
  const { play: playCountdown } = useGameSound('/sounds/lobby/start_countdown.ogg')

  const { play: playSelectUno, stop: stopSelectUno } = useGameSound('/sounds/lobby/select_uno.ogg?v=4')
  const { play: playSelectParchis, stop: stopSelectParchis } = useGameSound('/sounds/lobby/select_parchis.ogg?v=4')
  const { play: playSelectStop, stop: stopSelectStop } = useGameSound('/sounds/lobby/select_stop.ogg?v=4')

  return { 
    playJoin, playStart, playUiClick, 
    playCreateRoom, playJoinRoom, playTabSwitch, playEnterLobby,
    playBot, playBotConfig, playBotDifficulty, playBotKick, playCopyLink, playSettings, playEditProfile, playCountdown, 
    playSelectUno, playSelectParchis, playSelectStop, 
    stopSelectUno, stopSelectParchis, stopSelectStop 
  }
}
