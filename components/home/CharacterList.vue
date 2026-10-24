<template>
  <section id="characters" class="game-panel character-selector" aria-labelledby="characters-title" :aria-busy="loading">
    <div class="section-heading"><h2 id="characters-title">Character</h2><span class="eyebrow">{{ loading ? 'Loading roster' : `${characters?.length || 0} available` }}</span></div>
    <div v-if="loading" class="character-sheet-skeleton" role="status"><span class="sr-only">Loading character sheet</span><div class="skeleton-block skeleton-portrait" /><div class="skeleton-block h-5 w-3/4 mx-auto" /><div class="skeleton-block h-3 w-1/2 mx-auto mt-3" /><div class="skeleton-block h-8 mt-6" /><div class="grid grid-cols-3 gap-2 mt-5"><div v-for="stat in 6" :key="stat" class="skeleton-block h-16" /></div><div class="skeleton-block h-10 mt-5" /></div>
    <div v-else-if="!selected" class="empty-state character-empty"><GameIcon name="shield" class="empty-emblem w-16 h-16" /><h3 class="display">No characters yet</h3><p>Create a character to add it to your roster.</p></div>
    <div v-else :key="selected.id" class="selected-character-sheet">
      <div class="character-switcher"><button class="selector-arrow" :disabled="characters.length < 2" aria-label="Previous character" @click="cycle(-1)">‹</button><label for="active-character" class="sr-only">Select character</label><select id="active-character" v-model.number="selectedId"><option v-for="character in characters" :key="character.id" :value="character.id">{{ character.name }}</option></select><button class="selector-arrow" :disabled="characters.length < 2" aria-label="Next character" @click="cycle(1)">›</button></div>
      <div class="selected-portrait"><GameIcon :name="['Wizard', 'Sorcerer', 'Warlock', 'Druid'].includes(selected.class) ? 'flame' : 'sword'" /><span class="character-level">{{ selected.level }}</span></div>
      <h3 class="selected-name">{{ selected.name }}</h3><p class="selected-class">{{ selected.race }} {{ selected.class }}</p>
      <div class="character-health"><div class="health-label"><span>Hit points</span><span>{{ selected.currentHp }} / {{ selected.maxHp }}</span></div><div class="health-track" role="meter" aria-label="Hit points" :aria-valuemin="0" :aria-valuemax="selected.maxHp" :aria-valuenow="selected.currentHp"><span :style="{ width: `${Math.max(0, Math.min(100, selected.currentHp / selected.maxHp * 100))}%` }" /></div></div>
      <dl class="selector-combat"><div><dt>Armor</dt><dd>{{ selected.armorClass }}</dd></div><div><dt>Speed</dt><dd>{{ selected.speed || 0 }}<small> ft</small></dd></div><div><dt>Hit dice</dt><dd>{{ selected.hitDice }}</dd></div></dl>
      <div class="selector-abilities"><div v-for="ability in abilityNames" :key="ability"><span>{{ ability.slice(0, 3) }}</span><strong>{{ selected[ability] }}</strong><small>{{ modifier(selected[ability]) }}</small></div></div>
      <div class="selector-actions"><button class="button button-secondary" @click="isModalOpen = true">Full character sheet</button><button class="text-link danger-link" :aria-label="`Delete ${selected.name}`" @click="emit('deleteCharacter', selected.id)">Delete character</button></div>
    </div>
    <CharacterModal :is-open="isModalOpen" :character-id="selected?.id || null" @close="isModalOpen = false" />
  </section>
</template>

<script setup lang="ts">
import type { DeepReadonly } from 'vue';
import type { Character } from '~/server/db/types';
import CharacterModal from '~/components/CharacterModal.vue';
import GameIcon from '~/components/ui/GameIcon.vue';

type ReadonlyCharacter = DeepReadonly<Character>;
const props = withDefaults(defineProps<{ characters?: readonly ReadonlyCharacter[]; loading: boolean }>(), { characters: () => [] });
const emit = defineEmits<{ deleteCharacter: [id: number]; select: [character: ReadonlyCharacter | null] }>();
const selectedId = ref<number | null>(null);
const selected = computed(() => props.characters.find(character => character.id === selectedId.value) ?? props.characters[0] ?? null);
const isModalOpen = ref(false);
const abilityNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

function modifier(score: number) {
  const value = Math.floor((score - 10) / 2);
  return value >= 0 ? `+${value}` : String(value);
}

function cycle(direction: number) {
  const index = props.characters.findIndex(character => character.id === selected.value?.id);
  selectedId.value = props.characters[(index + direction + props.characters.length) % props.characters.length]?.id ?? null;
}

watch(() => props.characters, characters => {
  if (!characters.some(character => character.id === selectedId.value)) selectedId.value = characters[0]?.id ?? null;
}, { immediate: true });
watch(selected, character => emit('select', character), { immediate: true });
</script>
