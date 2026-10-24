<template>
  <NuxtLayout name="game">
    <div class="game-lobby">
      <LoadingLobby v-if="!auth.sessionChecked" />
      <AuthSection v-else-if="!auth.isAuthenticated" @toggle-codex="codexOpen = !codexOpen" />
      <GameActions v-else @toggle-codex="codexOpen = !codexOpen" />
      <GameDataPreview :is-open="codexOpen" @close="codexOpen = false" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import LoadingLobby from '~/components/home/LoadingLobby.vue';
import AuthSection from '~/components/home/AuthSection.vue';
import GameActions from '~/components/home/GameActions.vue';
import GameDataPreview from '~/components/home/GameDataPreview.vue';

const auth = useAuthStore();
const codexOpen = ref(false);

function handleKey(event: KeyboardEvent) {
  if (document.querySelector('dialog[open]')) return;
  if (event.key === 'Escape') { codexOpen.value = false; return; }
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'SUMMARY'].includes(target.tagName))) return;
  if (event.key.toLowerCase() === 'i') codexOpen.value = !codexOpen.value;
}

onMounted(() => window.addEventListener('keydown', handleKey));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey));
</script>
