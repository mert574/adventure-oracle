<template>
  <NuxtLayout name="default">
    <article class="credits-sheet">
      <h1>Credits &amp; licenses</h1>
      <p>Adventure Oracle application code is MIT licensed. Bundled rules and music retain their own licenses.</p>
      <section id="music"><h2>Music</h2><p>“Mystery Forest” by <a href="https://soundcloud.com/alexandr-zhelanov" target="_blank" rel="noopener noreferrer">Alexandr Zhelanov</a>.</p><p>Licensed under <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 3.0 Unported</a>. The recording is unchanged and repeats during playback. No endorsement is implied.</p><p><a href="https://opengameart.org/content/mystery-forest" target="_blank" rel="noopener noreferrer">Original source and attribution</a> · <a href="/licenses/cc-by-30.txt" target="_blank" rel="noopener noreferrer">Full license text</a>, including disclaimer of warranties and limitation of liability.</p></section>
      <section><h2>Game rules</h2><p>The bundled snapshot contains SRD 5.1 text/data. The optional importer also supports A5E. Both are used under CC BY 4.0. SRD 5.1 is dual-licensed; this project uses the Creative Commons option.</p><div v-for="document in sources.documents" :key="document.slug" class="mt-5"><h3>{{ document.title }}</h3><p>{{ document.copyright }}</p><p><a :href="document.url" target="_blank" rel="noopener noreferrer">Source</a></p></div><p class="mt-5">Open5e contributors provided compilation and transcription. Fields are selected and reorganized for storage and display. JSON fields are decoded, subraces and archetypes are joined, and spell fields are derived. Upstream transcription and rule edits are retained; this is not an authoritative verbatim SRD edition.</p><p><a :href="sources.source" target="_blank" rel="noopener noreferrer">Pinned Open5e source</a> · <a href="/licenses/cc-by-40.md" target="_blank" rel="noopener noreferrer">Full CC BY 4.0 license</a>, including disclaimer of warranties and limitation of liability.</p></section>
      <section><h2>Artwork</h2><p>Environment illustrations were generated for Adventure Oracle. Game icons and cursors are original. No Blizzard artwork or external RPG artwork is bundled.</p></section>
    </article>
  </NuxtLayout>
</template>

<script setup lang="ts">
import sources from '~/public/licenses/open5e-sources.json';
</script>
