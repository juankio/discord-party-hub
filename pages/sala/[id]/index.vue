<template>
  <div class="h-[100dvh] w-full overflow-hidden flex flex-col items-center p-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] md:pt-[max(4rem,env(safe-area-inset-top))]">
    <div class="w-full max-w-6xl flex-1 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <LobbyHeader 
        :room-id="roomId" 
        :players-count="players.length" 
        :max-players="playerStore.roomRules?.extendedLobby ? 8 : 6" 
        @open-edit="openEditProfile" 
        @leave-room="handleLeaveRoom" 
      />

      <div class="flex flex-col lg:flex-row gap-8 w-full items-start">
        <!-- Columna Izquierda (Mesa y Controles) -->
        <div class="flex-1 w-full flex flex-col gap-4 lg:gap-0">
          <PlayerTable 
            :room-id="roomId" 
            :players="players" 
            :host-user-id="playerStore.hostUserId" 
            :selected-game="selectedGame" 
            @add-bot="addBot" 
            @avatar-click="handleAvatarClick" 
            @change-seat="changeSeat"
          />

          <div class="block lg:hidden w-full max-w-md mx-auto">
            <TableHistoryBar :players="players" />
          </div>

          <!-- Zona de Control -->
          <div class="w-full flex justify-center pb-24 mt-8 lg:mt-4 relative z-10">
            <Transition name="fade" mode="out-in">
              <LobbyControls 
                :is-host="isHost"
                :is-starting="isStarting"
                :players-count="players.length"
                :selected-game="selectedGame"
                :room-rules="playerStore.roomRules"
                :games="gamesList"
                :is-general-rules-open="isGeneralRulesOpen"
                :is-table-rules-open="isTableRulesOpen"
                @update:selected-game="selectedGame = $event"
                @toggle-general="toggleGeneralRules"
                @toggle-table="toggleTableRules"
                @start-game="startGame"
              >
                <template #rules>
                  <GeneralRulesPanel v-model:rules="playerStore.roomRules" @change="handleRuleChange" :is-host="isHost" :is-open="isGeneralRulesOpen" />
                  <UnoRulesPanel v-if="selectedGame === 'uno'" v-model:rules="playerStore.roomRules" @change="handleRuleChange" :is-open="isTableRulesOpen" />
                  <StopRulesPanel v-if="selectedGame === 'stop'" v-model:rules="playerStore.roomRules" @change="handleRuleChange" :is-open="isTableRulesOpen" />
                  <ParchisRulesPanel v-if="selectedGame === 'parchis'" v-model:rules="playerStore.roomRules" @change="handleRuleChange" :is-host="isHost" :is-open="isTableRulesOpen" />
                </template>
              </LobbyControls>
            </Transition>
          </div>
        </div>

        <!-- Columna Derecha -->
        <div class="hidden lg:block w-[320px] xl:w-[350px] shrink-0">
          <TableHistoryBar :players="players" />
        </div>
      </div>
    </div>

    <EditProfileModal v-model:is-open="isEditProfileOpen" />
    <BotConfigModal 
      v-model:is-open="showBotConfigModal" 
      :bot="selectedBotForConfig" 
      @update-config="updateBotConfig" 
      @kick-bot="kickBot"
    />
  </div>
</template>

<script setup lang="ts">
import anime from "animejs";
import { usePlayerStore } from "~/stores/playerStore";
import { useAppAudio } from "~/composables/useAppAudio";
import { useRoomLobby } from "~/composables/useRoomLobby";
import { gamesList } from "~/constants/gamesList";
import LobbyHeader from "~/components/LobbyHeader.vue";
import LobbyControls from "~/components/LobbyControls.vue";

const route = useRoute();
const roomId = computed(() => route.params.id as string);
const playerStore = usePlayerStore();
const { playSettings, playEditProfile, playTableExpand, playTableShrink, playUiClick } = useAppAudio();

const { 
  players, isHost, isStarting, selectedGame, 
  emitRules, startGame, leaveRoom, addBot, updateBotConfig, kickBot, changeSeat
} = useRoomLobby(roomId.value);

useSeoMeta({
  title: `Lobby: ${roomId.value} - Discord Party Hub`,
  ogTitle: `Lobby: ${roomId.value} - Discord Party Hub`,
  description: "La sala está abierta. ¡Entra a jugar wachoo o te cagas!",
  ogImage: "https://discord-party-hub.vercel.app/banner.jpg?v=4"
});

const isEditProfileOpen = ref(false);
const showBotConfigModal = ref(false);
const isGeneralRulesOpen = ref(false);
const isTableRulesOpen = ref(false);
const selectedBotForConfig = ref<any>(null);

const toggleGeneralRules = () => {
  isGeneralRulesOpen.value = !isGeneralRulesOpen.value;
  isTableRulesOpen.value = false;
  if (isGeneralRulesOpen.value) {
    playTableExpand();
  } else {
    playTableShrink();
  }
};

const toggleTableRules = () => {
  isTableRulesOpen.value = !isTableRulesOpen.value;
  isGeneralRulesOpen.value = false;
  if (isTableRulesOpen.value) {
    playTableExpand();
  } else {
    playTableShrink();
  }
};

const openEditProfile = () => {
  isEditProfileOpen.value = true;
  playEditProfile();
};

const handleLeaveRoom = () => {
  playUiClick();
  leaveRoom();
};

const handleRuleChange = () => {
  if (isHost.value) {
    playUiClick();
    emitRules();
  }
};

const handleAvatarClick = (player: any) => {
  if (player.isBot && isHost.value) {
    selectedBotForConfig.value = player;
    showBotConfigModal.value = true;
    playEditProfile();
  }
};

onMounted(() => {
  setTimeout(() => anime({
    targets: ".header-anim",
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 800,
    easing: "easeOutExpo",
  }), 100);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
