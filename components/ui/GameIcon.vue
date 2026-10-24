<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'sword'"><path d="m14 3 7-1-1 7-11 11-5-5L14 3ZM3 12l9 9M3 21l4-4M2 22l2-2M8 16 19 5" /></template>
    <template v-else-if="name === 'shield'"><path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4ZM12 6v12M7 10h10" /></template>
    <template v-else-if="name === 'flame'"><path d="M13 2s2 5-2 9c-2-1-2-4-2-4S3 12 5 17c2 6 12 6 14 0 2-5-2-8-2-8s1 5-2 5c2-7-2-12-2-12Z" /><path d="M12 15c-6 7 6 8 0 0Z" /></template>
    <template v-else-if="name === 'book'"><path d="M12 5C9 3 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1ZM12 5v15M5 8h4M5 12h4M15 8h4M15 12h4" /></template>
    <template v-else><path d="M5 4h14v17H5V4ZM8 4V2h8v2M8 8h8M8 12h8M8 16h5" /></template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: 'sword' | 'shield' | 'flame' | 'book' | 'scroll' }>();
</script>
