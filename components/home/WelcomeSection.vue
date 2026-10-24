<template>
  <header class="lobby-titlebar">
    <div><p class="eyebrow">Fifth edition / {{ auth.isAuthenticated ? auth.user?.name : 'Character and campaign management' }}</p><h1>Adventurer’s Hall</h1></div>
    <a href="#reference" class="lobby-tab">Open the codex <span aria-hidden="true">▤</span></a>
  </header>
</template>

<script setup lang="ts">
const auth = useAuthStore();
</script>
