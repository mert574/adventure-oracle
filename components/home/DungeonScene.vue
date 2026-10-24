<template>
  <section class="dungeon-scene" aria-labelledby="dungeon-title">
    <img class="dungeon-background" :class="{ loaded: sceneReady }" fetchpriority="high" :style="{ objectPosition: location.position }" src="/images/dungeon-gate.webp" alt="Stone dungeon passage with wall braziers and an arcane gate" width="1536" height="1024" @load="sceneReady = true" @error="sceneReady = true">
    <p v-if="!sceneReady" class="world-loading" role="status">Loading area…</p>
    <div class="dungeon-vignette" aria-hidden="true" />
    <div class="torch-glow torch-glow-left" aria-hidden="true" />
    <div class="torch-glow torch-glow-right" aria-hidden="true" />
    <div class="portal-glow" aria-hidden="true" />
    <div class="embers" aria-hidden="true"><span v-for="ember in 14" :key="ember" :style="{ '--i': ember }" /></div>
    <div v-if="!hideLocationHud" class="dungeon-topbar"><span class="location-tag">Forgotten Depths</span><span class="preview-tag">Solo preview</span></div>
    <div v-if="!hideLocationHud" class="location-selector" role="group" aria-label="Explore dungeon locations"><button v-for="(room, index) in locations" :key="room.name" :class="{ selected: selectedLocation === index }" :aria-pressed="selectedLocation === index" :disabled="rolling" @click="selectLocation(index)"><span class="map-node" aria-hidden="true">{{ index + 1 }}</span>{{ room.name }}</button></div>
    <div class="dungeon-bottom">
      <div class="dungeon-content"><p class="eyebrow">Location {{ selectedLocation + 1 }} / {{ locations.length }}</p><h2 id="dungeon-title">{{ location.name }}</h2><p class="location-description">{{ location.description }}</p><p class="check-label">{{ characterName ? `${characterName} · ` : '' }}Investigation {{ investigationBonus >= 0 ? '+' : '' }}{{ investigationBonus }} · DC {{ location.dc }}</p></div>
      <div class="dice-station"><button class="d20-button" :class="{ rolling }" :disabled="rolling" :aria-label="`Roll a twenty-sided die to search ${location.name}`" @click="roll"><svg viewBox="0 0 100 110" aria-hidden="true"><path d="m50 3 44 25v54l-44 25L6 82V28L50 3Z" /><path d="m50 3 25 42 19-17M6 28l19 17L50 3M25 45h50l-25 43-25-43ZM6 82l19-37M94 82 75 45M6 82l44 6 44-6M50 88v19" /></svg><span>{{ rolling ? '·' : result ?? '20' }}</span></button><button class="search-button" :disabled="rolling" @click="roll">{{ rolling ? 'Rolling…' : 'Search area' }}</button></div>
      <div v-if="result !== null || rolling" class="roll-log" :class="{ 'roll-log-success': result !== null && total >= location.dc }" role="status" aria-live="polite"><span v-if="rolling">Rolling investigation…</span><template v-else><span class="roll-number">{{ total }}</span><span>{{ result !== null && total >= location.dc ? location.success : location.failure }}</span></template></div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ characterName?: string; investigationBonus?: number; hideLocationHud?: boolean }>(), { characterName: '', investigationBonus: 0 });
const sceneReady = ref(false);
const locations = [
  { name: 'The entrance', position: '48% 50%', dc: 10, description: 'Someone has been here recently. There are fresh tracks in the dust beside the stairs.', success: 'The tracks lead behind a loose stone. You find a rusted key.', failure: 'The tracks disappear under fallen stone. You find nothing else.' },
  { name: 'The passage', position: '25% 55%', dc: 12, description: 'Chains hang from the walls. A cold draft is coming from somewhere beyond the torchlight.', success: 'A gap behind the chains reveals a narrow side passage.', failure: 'The chains rattle as you move them. The wall behind them is solid.' },
  { name: 'The sealed gate', position: '75% 50%', dc: 15, description: 'The arch is intact, but the stone around it is cracked. Its runes give off a faint blue light.', success: 'You recognize a warding rune. One stone in the arch can be moved safely.', failure: 'The light flickers when you approach. You step back before touching it.' },
] as const;
const selectedLocation = ref(0);
const location = computed(() => locations[selectedLocation.value]!);
const result = ref<number | null>(null);
const rolling = ref(false);
const total = computed(() => (result.value ?? 0) + props.investigationBonus);
let rollTimer: ReturnType<typeof setTimeout> | undefined;

watch(() => props.characterName, () => { clearTimeout(rollTimer); rolling.value = false; result.value = null; });

function selectLocation(index: number) {
  selectedLocation.value = index;
  result.value = null;
}

function roll() {
  if (rolling.value) return;
  rolling.value = true;
  result.value = null;
  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
  rollTimer = setTimeout(() => {
    result.value = Math.floor(Math.random() * 20) + 1;
    rolling.value = false;
  }, delay);
}

onBeforeUnmount(() => clearTimeout(rollTimer));
</script>
