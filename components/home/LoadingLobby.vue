<template>
  <section class="lobby-board" aria-label="Loading your account" aria-busy="true">
    <aside class="roster-rail"><CharacterList :loading="true" /></aside>
    <div class="world-stage"><DungeonScene hide-location-hud /></div>
    <CampaignSelector :loading="true" />
    <div class="campaign-actions" aria-hidden="true"><span class="skeleton-block campaign-action-skeleton" /><span class="skeleton-block campaign-action-skeleton" /></div>
    <div class="lobby-actionbar loading-actionbar" role="status"><span class="sr-only">Checking your session</span><span v-for="slot in 2" :key="slot" class="skeleton-block h-12 w-12" /></div>
  </section>
</template>

<script setup lang="ts">
import CharacterList from '~/components/home/CharacterList.vue';
import CampaignSelector from '~/components/home/CampaignSelector.vue';
import DungeonScene from '~/components/home/DungeonScene.vue';
</script>
