<template>
  <section class="campaign-switcher" aria-label="Campaign selection" :aria-busy="loading">
    <template v-if="loading">
      <span class="sr-only" role="status">Loading campaigns</span>
      <div class="skeleton-block campaign-title-skeleton" />
      <div class="campaign-tabs" aria-hidden="true"><span v-for="slot in 3" :key="slot" class="skeleton-block campaign-tab-skeleton" /></div>
    </template>
    <template v-else>
      <h2 class="campaign-title">{{ selected?.name || 'Your campaigns' }}</h2>
      <div v-if="campaigns.length" class="campaign-tabs" role="group" aria-label="Your campaigns">
        <button v-for="(campaign, index) in campaigns" :key="campaign.id" :aria-pressed="selected?.id === campaign.id" :class="{ selected: selected?.id === campaign.id }" @click="selectedId = campaign.id"><span class="campaign-tab-number">{{ index + 1 }}</span><span>{{ campaign.name }}</span></button>
      </div>
      <p v-else class="campaign-no-selection">Create a campaign or join one with an invitation code.</p>
      <div class="campaign-switcher-tools">
        <span v-if="selected" class="campaign-invitation">Code <span>{{ selected.id }}</span></span>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Campaign } from '~/server/db/types';

const props = withDefaults(defineProps<{ campaigns?: Campaign[]; loading: boolean }>(), { campaigns: () => [] });
const emit = defineEmits<{ select: [campaign: Campaign | null] }>();
const selectedId = ref<string | null>(null);
const selected = computed(() => props.campaigns.find(campaign => campaign.id === selectedId.value) ?? props.campaigns[0] ?? null);
watch(selected, campaign => emit('select', campaign), { immediate: true });
</script>
