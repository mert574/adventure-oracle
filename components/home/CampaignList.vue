<template>
  <section class="game-panel" aria-labelledby="campaigns-title">
    <div class="section-heading"><h2 id="campaigns-title"><span class="section-index">01</span>Your campaigns</h2><span class="eyebrow">{{ campaigns?.length || 0 }} {{ campaigns?.length === 1 ? 'campaign' : 'campaigns' }}</span></div>
    <div v-if="loading" class="campaign-skeleton" role="status"><span class="sr-only">Loading campaigns</span><div v-for="row in 2" :key="row" class="py-5 border-b border-[var(--line)]"><div class="skeleton-block h-5 w-3/4" /><div class="skeleton-block h-3 w-1/2 mt-4" /><div class="skeleton-block h-3 w-full mt-6" /></div></div>
    <div v-else-if="!campaigns?.length" class="empty-state"><GameIcon name="shield" class="empty-emblem w-12 h-12" /><h3 class="display">No campaigns yet</h3><p>Create a campaign, or join one using an invitation code.</p></div>
    <article v-for="campaign in loading ? [] : campaigns" :key="campaign.id" class="roster-entry">
      <div class="row-between"><h4>{{ campaign.name }}</h4><span class="status" :class="{ 'status-inactive': campaign.status !== 'active' }">{{ campaign.status }}</span></div>
      <p class="text-xs muted">Invitation code <span class="font-mono tracking-wider ml-2 text-[var(--forest)]">{{ campaign.id }}</span></p>
      <div v-if="campaign.characters?.length" class="flex flex-wrap gap-3 mt-5">
        <button v-for="character in campaign.characters" :key="character.id" class="text-link" @click="handleCharacterClick(character.id)">{{ character.name }} <span class="muted font-normal">· {{ character.class }} {{ character.level }}</span></button>
      </div>
      <p v-if="campaign.status === 'active'" class="form-hint mt-5">Campaign play is not available yet.</p>
    </article>
    <CharacterModal :is-open="isModalOpen" :character-id="selectedCharacterId" @close="closeModal" />
  </section>
</template>

<script setup lang="ts">
import GameIcon from '~/components/ui/GameIcon.vue';
import type { Campaign } from '~/server/db/types';
import CharacterModal from '~/components/CharacterModal.vue';

interface Props {
  campaigns?: Campaign[];
  loading: boolean;
}

defineProps<Props>();

const isModalOpen = ref(false);
const selectedCharacterId = ref<number | null>(null);

function handleCharacterClick(characterId: number) {
  selectedCharacterId.value = characterId;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedCharacterId.value = null;
}
</script>