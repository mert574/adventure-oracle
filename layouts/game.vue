<template>
  <div class="game-screen">
    <a href="#game-content" class="skip-link button button-primary">Skip to game controls</a>
    <main id="game-content" class="game-viewport"><slot /></main>
    <div class="account-hud">
      <span class="account-crest" aria-hidden="true">◆</span>
      <div><p class="account-name">{{ auth.isAuthenticated ? auth.user?.name : 'Adventure Oracle' }}</p><p class="account-caption">{{ auth.isAuthenticated ? 'Fifth edition' : 'Tabletop campaign companion' }}</p></div>
      <button v-if="auth.isAuthenticated" class="hud-menu-button" :disabled="signingOut" aria-label="Sign out" title="Sign out" @click="signOut">⏻</button>
      <NuxtLink v-else to="/auth/login" class="hud-menu-button text-xs" title="Sign in">Sign in</NuxtLink>
    </div>
    <NuxtLink to="/credits" class="game-credits">Rules &amp; credits</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const signingOut = ref(false);

async function signOut() {
  signingOut.value = true;
  try {
    await auth.logout();
    useCampaignStore().reset();
  } finally {
    signingOut.value = false;
  }
}
</script>
