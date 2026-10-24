<template>
  <Modal :is-open="isOpen" title="Adventurer’s Codex" eyebrow="Rules reference · SRD 5.1" variant="codex" @close="emit('close')">
    <div class="codex-book" :class="{ 'codex-reading': reading }">
      <nav class="codex-categories" aria-label="Codex categories">
        <button v-for="category in categories" :key="category.id" :aria-pressed="activeCategory === category.id" :class="{ active: activeCategory === category.id }" @click="changeCategory(category.id)"><GameIcon :name="category.icon" /><span>{{ category.name }}</span><small>{{ sources[category.id].data.value?.length ?? '—' }}</small></button>
      </nav>
      <div class="codex-columns">
        <section class="codex-index" aria-label="Codex entries" :aria-busy="loading">
          <div class="codex-search"><label for="codex-search" class="sr-only">Search {{ categoryName.toLowerCase() }}</label><input id="codex-search" v-model="search" type="search" :placeholder="`Search ${categoryName.toLowerCase()}…`" autocomplete="off"><p>{{ loading ? 'Loading entries…' : `${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}` }}</p></div>
          <div v-if="loading" class="codex-loading-list" role="status"><span class="sr-only">Loading {{ categoryName.toLowerCase() }}</span><div v-for="row in 7" :key="row" class="codex-skeleton-row"><span class="skeleton-block" /><div><div class="skeleton-block h-3 w-4/5" /><div class="skeleton-block h-2 w-1/2 mt-3" /></div></div></div>
          <div v-else-if="error" class="codex-message" role="alert"><p>Could not load {{ categoryName.toLowerCase() }}.</p><button class="button button-secondary mt-4" @click="sources[activeCategory].refresh()">Try again</button></div>
          <div v-else-if="!filtered.length" class="codex-message"><p>{{ search ? `No matches for “${search}”.` : 'No entries in this category.' }}</p><button v-if="search" class="text-link mt-3" @click="search = ''">Clear search</button></div>
          <ul v-else class="codex-entry-list"><li v-for="entry in filtered" :key="entry.slug"><button :aria-pressed="selected?.slug === entry.slug" :class="{ selected: selected?.slug === entry.slug }" @click="selectEntry(entry.slug)"><span class="codex-entry-icon" :class="`codex-icon-${activeCategory}`"><GameIcon :name="categoryIcon" /></span><span class="codex-entry-label"><strong>{{ entry.name }}</strong><small>{{ entry.subtitle }}</small></span><span class="codex-entry-arrow" aria-hidden="true">›</span></button></li></ul>
        </section>
        <section class="codex-detail" aria-label="Entry details" tabindex="0">
          <button class="codex-back" @click="reading = false">‹ Back to entries</button>
          <div v-if="loading" class="codex-detail-skeleton" aria-hidden="true"><div class="skeleton-block h-9 w-3/4 mb-4" /><div class="skeleton-block h-3 w-1/2 mb-8" /><div v-for="line in 7" :key="line" class="skeleton-block h-3 mb-4" :style="{ width: `${line % 3 === 0 ? 65 : 95}%` }" /></div>
          <template v-else-if="selected">
            <header class="codex-entry-heading"><span class="codex-detail-icon" :class="`codex-icon-${activeCategory}`"><GameIcon :name="categoryIcon" /></span><div><p class="codex-entry-kind">{{ selected.subtitle }}</p><h3>{{ selected.name }}</h3></div></header>
            <dl class="codex-facts"><div v-for="fact in selected.facts" :key="fact[0]"><dt>{{ fact[0] }}</dt><dd>{{ fact[1] }}</dd></div></dl>
            <div class="codex-rules"><p v-for="(paragraph, index) in paragraphs(selected.description)" :key="index">{{ paragraph }}</p></div>
            <section v-if="selected.extra" class="codex-extra"><h4>{{ selected.extra.title }}</h4><p>{{ selected.extra.text }}</p></section>
            <p class="codex-source">System Reference Document 5.1 · Open5e <NuxtLink to="/credits" @click="emit('close')">Source credits ↗</NuxtLink></p>
          </template>
          <div v-else class="codex-message"><GameIcon name="book" class="w-12 h-12 mx-auto mb-5" /><p>Select an entry to read its rules.</p></div>
        </section>
      </div>
      <footer class="codex-footer"><span>{{ categoryName }} <span aria-hidden="true">/</span> {{ loading ? 'Loading' : `${filtered.length} of ${entries.length}` }}</span><span>Esc to close</span></footer>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { Spell, MagicItem, Weapon } from '~/server/services/open5e.service';
import Modal from '~/components/ui/Modal.vue';
import GameIcon from '~/components/ui/GameIcon.vue';

type Category = 'spells' | 'magicitems' | 'weapons';
interface Entry {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  facts: [string, string][];
  extra?: { title: string; text: string };
}
const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: [] }>();
const categories = [
  { id: 'spells', name: 'Spells', icon: 'flame' },
  { id: 'magicitems', name: 'Magic items', icon: 'shield' },
  { id: 'weapons', name: 'Weapons', icon: 'sword' },
] as const;
const activeCategory = ref<Category>('spells');
const search = ref('');
const reading = ref(false);
const selections = reactive<Record<Category, string | null>>({ spells: null, magicitems: null, weapons: null });
const sources = {
  spells: useFetch<Spell[]>('/api/data/spells', { key: 'codex-spells', immediate: false, watch: false }),
  magicitems: useFetch<MagicItem[]>('/api/data/magicitems', { key: 'codex-magicitems', immediate: false, watch: false }),
  weapons: useFetch<Weapon[]>('/api/data/weapons', { key: 'codex-weapons', immediate: false, watch: false }),
};
const categoryName = computed(() => categories.find(category => category.id === activeCategory.value)!.name);
const categoryIcon = computed(() => categories.find(category => category.id === activeCategory.value)!.icon);
const loading = computed(() => ['idle', 'pending'].includes(sources[activeCategory.value].status.value));
const error = computed(() => sources[activeCategory.value].error.value);
const entries = computed<Entry[]>(() => {
  if (activeCategory.value === 'spells') return (sources.spells.data.value ?? []).map(spell => ({
    slug: spell.slug, name: spell.name, description: spell.description,
    subtitle: `${spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} · ${spell.school}${spell.ritual ? ' · Ritual' : ''}`,
    facts: [['Casting time', spell.castingTime], ['Range', spell.range], ['Components', spell.components], ['Duration', `${spell.concentration ? 'Concentration · ' : ''}${spell.duration}`], ['Classes', spell.classes]],
    extra: spell.higherLevel ? { title: 'At higher levels', text: spell.higherLevel } : undefined,
  }));
  if (activeCategory.value === 'magicitems') return (sources.magicitems.data.value ?? []).map(item => ({
    slug: item.slug, name: item.name, description: item.description, subtitle: `${item.rarity} · ${item.type}`,
    facts: [['Type', item.type], ['Rarity', item.rarity], ['Attunement', item.requiresAttunement || 'Not required']],
  }));
  return (sources.weapons.data.value ?? []).map(weapon => ({
    slug: weapon.slug, name: weapon.name, description: weapon.description, subtitle: weapon.category,
    facts: [['Damage', `${weapon.damageDice} ${weapon.damageType}`], ['Cost', weapon.cost], ['Weight', weapon.weight], ['Properties', weapon.properties?.join(', ') || 'None']],
  }));
});
const filtered = computed(() => {
  const term = search.value.trim().toLocaleLowerCase();
  return entries.value.filter(entry => `${entry.name} ${entry.subtitle}`.toLocaleLowerCase().includes(term));
});
const selected = computed(() => filtered.value.find(entry => entry.slug === selections[activeCategory.value]) ?? filtered.value[0] ?? null);

function paragraphs(text: string) {
  return (text || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/_([^_]+)_/g, '$1').replace(/^#{1,6}\s+/gm, '').split(/\n\s*\n/).filter(Boolean);
}

function changeCategory(category: Category) {
  activeCategory.value = category;
  search.value = '';
  reading.value = false;
}

function selectEntry(slug: string) {
  selections[activeCategory.value] = slug;
  reading.value = true;
}

watch(() => props.isOpen, open => {
  if (!open) return;
  for (const source of Object.values(sources)) {
    if (source.status.value === 'idle') void source.execute();
  }
}, { immediate: true });
</script>
