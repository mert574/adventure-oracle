<template>
  <div class="music-control" data-music-controls>
    <audio ref="player" src="/audio/mystery-forest-alexandr-zhelanov.mp3" loop preload="none" @loadedmetadata="syncRadioPosition" @play="playing = true" @pause="playing = false" @error="failed = true" />
    <button type="button" class="music-toggle" :aria-label="playing ? 'Mute background music' : 'Play background music'" :aria-pressed="playing" :title="`${playing ? 'Mute music' : 'Play music'} · Mystery Forest by Alexandr Zhelanov · CC BY 3.0`" @click="toggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Z" /><path v-if="playing" d="M15 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14" /><path v-else d="m16 9 6 6m0-6-6 6" /></svg>
      <span class="sr-only">{{ failed ? 'Retry music' : playing ? 'Music on' : 'Music off' }}</span>
    </button>
    <span v-if="failed" class="sr-only" role="status">Music could not play. Try again.</span>
  </div>
</template>

<script setup lang="ts">
const player = ref<HTMLAudioElement | null>(null);
const { muted, paused, playing, failed, command } = useBackgroundMusicState();
const music = useBackgroundMusic();
let mounted = false;
let playGeneration = 0;

function removeGestureListeners() {
  window.removeEventListener('pointerdown', startAfterGesture);
  window.removeEventListener('keydown', startAfterGesture);
}

function addGestureListeners() {
  window.addEventListener('pointerdown', startAfterGesture);
  window.addEventListener('keydown', startAfterGesture);
}

function syncRadioPosition() {
  const audio = player.value;
  if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
  audio.currentTime = (Date.now() / 1000) % audio.duration;
}

async function syncPlayback() {
  if (!mounted || !player.value) return;
  const generation = ++playGeneration;
  if (muted.value || paused.value) {
    player.value.pause();
    return;
  }
  failed.value = false;
  if (player.value.paused && player.value.readyState >= 1) syncRadioPosition();
  player.value.volume = 0.1;
  try {
    await player.value.play();
    removeGestureListeners();
  } catch {
    if (generation !== playGeneration) return;
    failed.value = true;
    addGestureListeners();
  }
}

function startAfterGesture(event: Event) {
  if (muted.value || paused.value || playing.value) return;
  if (event.target instanceof Element && event.target.closest('[data-music-controls]')) return;
  if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
  void syncPlayback();
}

function toggle() {
  if (playing.value) music.mute();
  else {
    music.unmute();
    music.resume();
  }
}

watch([muted, paused, command], syncPlayback, { flush: 'sync' });

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('adventure-oracle-music') || 'null') as { enabled?: unknown } | null;
    if (typeof saved?.enabled === 'boolean') muted.value = !saved.enabled;
  } catch { /* Ignore invalid or unavailable stored preferences. */ }
  mounted = true;
  if (player.value) player.value.volume = 0.1;
  addGestureListeners();
  if (command.value > 0) void syncPlayback();
});

onBeforeUnmount(() => {
  mounted = false;
  removeGestureListeners();
  player.value?.pause();
});
</script>
