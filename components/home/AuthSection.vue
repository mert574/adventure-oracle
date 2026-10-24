<template>
  <section class="lobby-board" aria-label="Begin your adventure">
    <aside class="guest-rail game-panel">
      <div class="section-heading"><h2>Your character</h2></div>
      <div class="hero-silhouette" aria-hidden="true"><GameIcon name="shield" /></div>
      <h3 class="text-center">No character selected</h3>
      <p class="muted text-xs leading-relaxed text-center mt-3">Create a character to join a campaign.</p>
      <NuxtLink to="/auth/register" class="button button-primary rail-action mt-6">Create account</NuxtLink>
      <NuxtLink to="/auth/login" class="text-link block text-center mt-4">Already have an account? Sign in</NuxtLink>
    </aside>
    <div class="world-stage"><DungeonScene /><div class="world-caption"><span class="live-ember" /> The Forgotten Depths <span class="muted">/ World preview</span></div></div>
    <aside class="guest-rail game-panel">
      <div class="section-heading"><h2>Getting started</h2></div>
      <ol class="quest-list"><li><span class="quest-marker">!</span><div><h3>Create a character</h3><p>Pick a class and roll your abilities.</p></div></li><li><span class="quest-marker">!</span><div><h3>Join a campaign</h3><p>Create a campaign or join your allies.</p></div></li><li><span class="quest-marker">!</span><div><h3>Look up rules</h3><p>Browse spells, magic items, and weapons below.</p></div></li></ol>
      <p class="form-hint">Character and party management are ready. Campaign play is in development.</p>
    </aside>
    <div class="lobby-actionbar"><span class="eyebrow">Account</span><NuxtLink to="/auth/register" class="button button-primary">Create account</NuxtLink><NuxtLink to="/auth/login" class="button button-secondary">Sign in</NuxtLink><button class="button button-secondary" @click="emit('toggleCodex')">Codex [I]</button></div>
  </section>
</template>

<script setup lang="ts">
import DungeonScene from '~/components/home/DungeonScene.vue';
import GameIcon from '~/components/ui/GameIcon.vue';

const emit = defineEmits<{ toggleCodex: [] }>();
</script>
