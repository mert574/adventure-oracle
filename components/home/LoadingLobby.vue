<template>
  <section class="lobby-board" aria-label="Loading your account" aria-busy="true">
    <aside class="roster-rail"><CharacterList :loading="true" /></aside>
    <div class="world-stage"><DungeonScene /></div>
    <aside class="campaign-rail"><CampaignList :loading="true" /></aside>
    <div class="lobby-actionbar loading-actionbar" role="status"><span class="sr-only">Checking your session</span><span v-for="slot in 4" :key="slot" class="skeleton-block h-12 w-12" /></div>
  </section>
</template>

<script setup lang="ts">
import CharacterList from '~/components/home/CharacterList.vue';
import CampaignList from '~/components/home/CampaignList.vue';
import DungeonScene from '~/components/home/DungeonScene.vue';
</script>
