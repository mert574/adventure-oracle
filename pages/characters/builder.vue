<template>
  <NuxtLayout name="default">
    <header class="builder-heading mt-8"><p class="eyebrow">Character creation</p><h1 class="display">Create your character.</h1><p class="muted text-sm leading-relaxed">Choose a class and enter your character’s starting statistics.</p></header>
    <div class="builder-layout">
      <aside class="character-creation-rail">
        <div class="character-preview"><GameIcon name="shield" class="w-24 h-24" /><h2>{{ characterData.name || 'New character' }}</h2><p>{{ characterData.race || 'Choose a race' }} · {{ characterData.class || 'Choose a class' }}</p><span class="eyebrow">Level {{ characterData.level }}</span></div>
        <ol class="builder-steps" aria-label="Character creation steps">
          <li v-for="(step, index) in steps" :key="step.id" class="builder-step" :class="{ 'builder-step-current': currentStep === index }" :aria-current="currentStep === index ? 'step' : undefined"><span>{{ currentStep > index ? '✓' : `0${index + 1}` }}</span>{{ step.title }}</li>
        </ol>
        <p class="form-hint mt-5 hidden md:block">Fifth-edition character creation.</p>
      </aside>
      <section class="builder-sheet">
        <form @submit.prevent="handleSubmit">
          <div v-if="currentStep === 0">
            <p class="eyebrow mb-3">Step 01 / Identity</p><h2>Character identity</h2><p class="form-hint">Choose your character’s name, class, and ancestry.</p>
            <div class="form-grid">
              <div class="col-span-2"><label for="character-name">Character name</label><input id="character-name" v-model="characterData.name" required placeholder="Enter character name" autocomplete="off"></div>
              <div><label for="character-class">Class</label><select id="character-class" v-model="characterData.class" required><option value="" disabled>Choose a class</option><option v-for="cls in classes" :key="cls" :value="cls">{{ cls }}</option></select></div>
              <div><label for="character-race">Race</label><select id="character-race" v-model="characterData.race" required><option value="" disabled>Choose a race</option><option v-for="race in races" :key="race" :value="race">{{ race }}</option></select></div>
              <div><label for="character-level">Starting level</label><input id="character-level" v-model.number="characterData.level" type="number" min="1" max="20" required></div>
            </div>
          </div>
          <div v-if="currentStep === 1">
            <p class="eyebrow mb-3">Step 02 / Abilities</p><div class="row-between"><h2>Ability scores</h2><button type="button" class="button button-secondary" @click="rollAbilityScores">Roll scores ↻</button></div><p class="form-hint">Enter your table’s ability scores, or roll a set to get started.</p>
            <div class="form-grid"><div v-for="ability in abilities" :key="ability.key"><label :for="`ability-${ability.key}`">{{ ability.name }}</label><input :id="`ability-${ability.key}`" v-model.number="characterData[ability.key as keyof typeof characterData]" type="number" min="1" max="30" required></div></div>
          </div>
          <div v-if="currentStep === 2">
            <p class="eyebrow mb-3">Step 03 / Combat</p><h2>Combat statistics</h2><p class="form-hint">Set your starting combat statistics using your class and equipment.</p>
            <div class="form-grid"><div><label for="max-hp">Maximum hit points</label><input id="max-hp" v-model.number="characterData.maxHp" type="number" min="1" required></div><div><label for="armor-class">Armor class</label><input id="armor-class" v-model.number="characterData.armorClass" type="number" min="1" required></div><div><label for="hit-dice">Hit dice</label><input id="hit-dice" v-model="characterData.hitDice" required placeholder="1d8"></div></div>
          </div>
          <p v-if="error" class="error-note mt-6" role="alert">{{ error }}</p>
          <div class="dialog-actions justify-between">
            <button v-if="currentStep > 0" type="button" class="button button-secondary" :disabled="loading" @click="previousStep">← Previous</button><span v-else class="eyebrow self-center">Step 1 of 3</span>
            <button v-if="currentStep < steps.length - 1" type="button" class="button button-primary" :disabled="!isCurrentStepValid" @click="nextStep">Continue →</button>
            <button v-else type="submit" class="button button-primary" :disabled="loading || !isFormValid">{{ loading ? 'Creating character…' : 'Create character' }} <span v-if="!loading" aria-hidden="true">↗</span></button>
          </div>
        </form>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import GameIcon from '~/components/ui/GameIcon.vue';
const router = useRouter()

const currentStep = ref(0)
const loading = ref(false)
const error = ref('')

const steps = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'abilities', title: 'Ability Scores' },
  { id: 'combat', title: 'Combat Stats' }
]

const characterData = ref({
  name: '',
  class: '',
  race: '',
  level: 1,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  maxHp: 8,
  armorClass: 10,
  hitDice: '1d8'
})

const classes = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
]

const races = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Tiefling'
]

const abilities = [
  { key: 'strength', name: 'Strength' },
  { key: 'dexterity', name: 'Dexterity' },
  { key: 'constitution', name: 'Constitution' },
  { key: 'intelligence', name: 'Intelligence' },
  { key: 'wisdom', name: 'Wisdom' },
  { key: 'charisma', name: 'Charisma' }
]

function rollAbilityScores() {
  function rollStat() {
    return Math.floor(Math.random() * 15) + 8
  }
  
  characterData.value.strength = rollStat()
  characterData.value.dexterity = rollStat()
  characterData.value.constitution = rollStat()
  characterData.value.intelligence = rollStat()
  characterData.value.wisdom = rollStat()
  characterData.value.charisma = rollStat()
}

const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 0:
      return !!(characterData.value.name && characterData.value.class && characterData.value.race && characterData.value.level)
    case 1:
      return true
    case 2:
      return !!(characterData.value.maxHp && characterData.value.armorClass && characterData.value.hitDice)
    default:
      return false
  }
})

const isFormValid = computed(() => {
  return !!(
    characterData.value.name &&
    characterData.value.class &&
    characterData.value.race &&
    characterData.value.level &&
    characterData.value.maxHp &&
    characterData.value.armorClass &&
    characterData.value.hitDice
  )
})

function nextStep() {
  if (currentStep.value < steps.length - 1 && isCurrentStepValid.value) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    const { data } = await $fetch('/api/characters', {
      method: 'POST',
      body: characterData.value
    })

    if (data) {
      await router.push('/')
    }
  } catch (err: unknown) {
    error.value = (err as { data?: { message?: string } })?.data?.message || 'Failed to create character'
  } finally {
    loading.value = false
  }
}

definePageMeta({
  middleware: 'auth'
})
</script>