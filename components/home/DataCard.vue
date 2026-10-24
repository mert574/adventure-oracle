<template>
  <div class="inventory-grid" :aria-label="title">
    <template v-if="loading"><span class="sr-only" role="status">Loading rules</span><div v-for="slot in 5" :key="slot" class="inventory-item inventory-skeleton" aria-hidden="true"><div class="skeleton-block h-11 w-11" /><div class="skeleton-block h-3 w-full mt-3" /><div class="skeleton-block h-3 w-2/3 mt-2" /></div></template>
    <p v-else-if="error" class="error-note" role="alert">{{ error }}</p>
    <template v-else-if="items?.length"><details v-for="item in items" :key="item.slug" class="inventory-item">
      <summary><span class="inventory-icon" :class="`inventory-icon-${itemType}`"><GameIcon :name="itemType === 'spell' ? 'flame' : itemType === 'item' ? 'shield' : 'sword'" /></span><span class="inventory-name">{{ item.name }}</span><span class="inventory-meta">{{ itemType === 'spell' ? `Level ${(item as Spell).level} · ${(item as Spell).school}` : itemType === 'item' ? (item as MagicItem).rarity : `${(item as Weapon).damageDice} ${(item as Weapon).damageType}` }}</span><span class="inventory-expand">Details +</span></summary>
      <p class="inventory-description">{{ item.description ? excerpt(item.description) : (item as Weapon).category }}</p>
    </details></template>
    <p v-else class="muted text-sm p-6">No entries in this category yet.</p>
  </div>
</template>

<script setup lang="ts">
import GameIcon from '~/components/ui/GameIcon.vue';
import type { Spell, MagicItem, Weapon } from '~/server/services/open5e.service';

interface Props {
  title: string;
  loading: boolean;
  error: string | null;
  items: Spell[] | MagicItem[] | Weapon[] | null | undefined;
  itemType: 'spell' | 'item' | 'weapon';
}

defineProps<Props>();

function excerpt(text: string) {
  const plain = text.replace(/[#*_`]/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > 125 ? `${plain.slice(0, 122)}…` : plain;
}
</script> 