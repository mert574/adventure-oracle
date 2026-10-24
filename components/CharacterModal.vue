<template>
  <Modal :is-open="isOpen" :title="character?.name || 'Character sheet'" wide @close="closeModal">
    <p v-if="loading" class="muted py-8 text-center" role="status">Loading character…</p>
    <div v-else-if="error" class="error-note" role="alert">{{ error }} <button class="text-link ml-3" @click="fetchCharacter">Try again</button></div>
    <div v-else-if="character" class="space-y-7">
      <div class="row-between"><p class="muted text-sm">Level {{ character.level }} · {{ character.race }} {{ character.class }}<span v-if="character.background"> · {{ character.background }}</span></p><span class="status" :class="{ 'status-inactive': !character.isActive }">{{ character.isActive ? 'Active' : 'Inactive' }}</span></div>
      <section class="sheet-section"><h3>Ability scores</h3><div class="ability-grid"><div v-for="ability in abilityNames" :key="ability" class="ability-box"><span class="eyebrow">{{ ability.slice(0, 3) }}</span><strong>{{ getModifier(character[ability]) }}</strong><span class="muted text-xs">{{ character[ability] }}</span></div></div></section>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-7">
        <section class="sheet-section"><h3>Health &amp; combat</h3><dl class="sheet-facts"><div><dt class="muted">Hit points</dt><dd>{{ character.currentHp }} / {{ character.maxHp }}</dd></div><div v-if="character.temporaryHp"><dt class="muted">Temporary HP</dt><dd>{{ character.temporaryHp }}</dd></div><div><dt class="muted">Armor class</dt><dd>{{ character.armorClass }}</dd></div><div><dt class="muted">Initiative</dt><dd>{{ character.initiative >= 0 ? '+' : '' }}{{ character.initiative }}</dd></div><div><dt class="muted">Speed</dt><dd>{{ character.speed }} ft</dd></div><div><dt class="muted">Hit dice</dt><dd>{{ character.hitDice }}</dd></div></dl></section>
        <section class="sheet-section"><h3>Identity</h3><dl class="sheet-facts"><div><dt class="muted">Class</dt><dd>{{ character.class }}</dd></div><div><dt class="muted">Race</dt><dd>{{ character.race }}</dd></div><div><dt class="muted">Level</dt><dd>{{ character.level }}</dd></div><div v-if="character.background"><dt class="muted">Background</dt><dd>{{ character.background }}</dd></div><div v-if="character.alignment"><dt class="muted">Alignment</dt><dd>{{ character.alignment }}</dd></div></dl></section>
      </div>
      <section v-if="character.features?.length" class="sheet-section"><h3>Features &amp; traits</h3><div v-for="feature in character.features" :key="feature.name" class="mb-4"><h4 class="text-sm font-semibold">{{ feature.name }}</h4><p class="muted text-sm leading-relaxed mt-1">{{ feature.description }}</p><p v-if="feature.source" class="form-hint">Source: {{ feature.source }}</p></div></section>
      <div v-if="character.weapons?.length || character.armor?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-7">
        <section v-if="character.weapons?.length" class="sheet-section"><h3>Weapons</h3><div v-for="weapon in character.weapons" :key="weapon.name" class="mb-4"><h4 class="text-sm font-semibold">{{ weapon.name }}</h4><p class="form-hint">{{ weapon.damage }} {{ weapon.damageType }}<span v-if="weapon.properties?.length"> · {{ weapon.properties.join(', ') }}</span></p></div></section>
        <section v-if="character.armor?.length" class="sheet-section"><h3>Armor</h3><div v-for="armor in character.armor" :key="armor.name" class="mb-4"><h4 class="text-sm font-semibold">{{ armor.name }}</h4><p class="form-hint">AC {{ armor.armorClass }} · {{ armor.type }}</p><p v-if="armor.stealthDisadvantage" class="form-hint">Stealth disadvantage</p></div></section>
      </div>
      <section v-if="hasPersonality" class="sheet-section"><h3>Personality</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-5"><div v-for="(label, key) in { personalityTraits: 'Personality traits', ideals: 'Ideals', bonds: 'Bonds', flaws: 'Flaws' }" :key="key"><template v-if="character[key]"><h4 class="eyebrow mb-2">{{ label }}</h4><p class="muted text-sm leading-relaxed">{{ character[key] }}</p></template></div></div></section>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue';
import type { Character } from '~/server/db/types';

interface Props {
  isOpen: boolean;
  characterId: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const abilityNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

const character = ref<Character | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const hasPersonality = computed(() => {
  return character.value?.personalityTraits || 
         character.value?.ideals || 
         character.value?.bonds || 
         character.value?.flaws;
});

function getModifier(score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function closeModal() {
  emit('close');
}

async function fetchCharacter() {
  if (!props.characterId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await $fetch(`/api/characters/${props.characterId}`);
    if (response?.data) {
      character.value = response.data;
    }
  } catch (err) {
    console.error('Failed to fetch character:', err);
    error.value = 'Failed to load character details';
  } finally {
    loading.value = false;
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.characterId) {
    fetchCharacter();
  } else {
    character.value = null;
    error.value = null;
  }
});

onMounted(() => {
  if (props.isOpen && props.characterId) {
    fetchCharacter();
  }
});
</script>