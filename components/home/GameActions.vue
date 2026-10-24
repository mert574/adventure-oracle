<template>
  <section id="party" class="lobby-board" aria-label="Your party and characters">
    <aside class="roster-rail">
      <CharacterList :characters="characters" :loading="charactersLoading || initialLoading" @select="selectedCharacter = $event" @delete-character="handleDeleteCharacter" />
      <NuxtLink to="/characters/builder" class="button button-primary rail-action">Create character <span aria-hidden="true">+</span></NuxtLink>
    </aside>
    <div class="world-stage"><DungeonScene hide-location-hud :character-name="selectedCharacter?.name" :investigation-bonus="investigationBonus" /><div class="world-caption"><span class="live-ember" /> The Forgotten Depths <span class="muted">/ Solo exploration preview</span></div></div>
    <CampaignSelector :campaigns="campaigns" :loading="loading || initialLoading" @select="campaignStore.setCurrentCampaign($event)" />
    <div class="campaign-actions" role="group" aria-label="Campaign actions">
      <button class="button button-primary" :disabled="loading || initialLoading" @click="createModal.open()">Create campaign</button>
      <button class="button button-secondary" :disabled="loading || initialLoading" @click="joinModal.open()">Join campaign</button>
    </div>
    <div class="lobby-actionbar"><span class="eyebrow">Actions</span><NuxtLink to="/characters/builder" class="hotkey-action"><span class="hotkey-symbol">⚔</span><span>Create character</span></NuxtLink><button class="hotkey-action" @click="emit('toggleCodex')"><span class="hotkey-symbol">▤</span><span>Codex [I]</span></button></div>
    <p v-if="error || charactersError" class="error-note lobby-error" role="alert">{{ error || charactersError }}</p>
    <CreateCampaignModal :is-open="createModal.isOpen.value" :loading="loading" @create="handleCreateCampaign" @cancel="createModal.close()" />
    <JoinCampaignModal :is-open="joinModal.isOpen.value" :loading="loading" :characters="characters" @join="handleJoinCampaign" @cancel="joinModal.close()" />
  </section>
</template>

<script setup lang="ts">
import type { DeepReadonly } from 'vue';
import type { Character } from '~/server/db/types';
import DungeonScene from '~/components/home/DungeonScene.vue';
import CampaignSelector from '~/components/home/CampaignSelector.vue';
import CharacterList from '~/components/home/CharacterList.vue';
import CreateCampaignModal from '~/components/home/CreateCampaignModal.vue';
import JoinCampaignModal from '~/components/home/JoinCampaignModal.vue';

const emit = defineEmits<{ toggleCodex: [] }>();
const initialLoading = ref(true);
const campaignStore = useCampaignStore();
const selectedCharacter = ref<DeepReadonly<Character> | null>(null);
const investigationBonus = computed(() => {
  const character = selectedCharacter.value;
  if (!character) return 0;
  const intelligence = Math.floor((character.intelligence - 10) / 2);
  const skill = character.skillProficiencies?.find(entry => entry.name.toLowerCase() === 'investigation');
  return intelligence + (skill?.proficient ? (character.proficiencyBonus || 0) * (skill.expertise ? 2 : 1) : 0);
});

const { createCampaign, joinCampaign, fetchUserCampaigns, campaigns, loading, error } = useCampaign();
const { 
  fetchUserCharacters, 
  deleteCharacter, 
  characters, 
  loading: charactersLoading, 
  error: charactersError 
} = useCharacters();

const createModal = useModal();
const joinModal = useModal();

async function handleCreateCampaign(data: { name: string }) {
  const campaign = await createCampaign(data);
  if (campaign) {
    createModal.close();
  }
}

async function handleJoinCampaign(data: { campaignCode: string; characterId: number }) {
  const result = await joinCampaign(data);
  if (result) {
    joinModal.close();
  }
}

async function handleDeleteCharacter(id: number) {
  if (confirm('Are you sure you want to delete this character?')) {
    await deleteCharacter(id);
  }
}

onMounted(async () => {
  await Promise.all([fetchUserCampaigns(), fetchUserCharacters()]);
  initialLoading.value = false;
});
</script>
