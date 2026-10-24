<template>
  <Modal :is-open="isOpen" :busy="loading" title="Join a campaign" @close="handleCancel">
    <p class="muted text-sm leading-relaxed mb-6">Enter your invitation code and select a character.</p>
    <form @submit.prevent="handleSubmit">
      <div class="space-y-6">
        <div><label for="campaign-code">Campaign code</label><input id="campaign-code" v-model="form.campaignCode" required placeholder="Enter your invitation code" autofocus :disabled="loading" autocapitalize="characters" spellcheck="false" class="font-mono tracking-widest"></div>
        <div><label for="join-character">Your character</label><select id="join-character" v-model.number="form.characterId" required :disabled="loading || !characters?.length"><option :value="null" disabled>Choose a character</option><option v-for="character in characters" :key="character.id" :value="character.id">{{ character.name }} · Level {{ character.level }} {{ character.class }}</option></select>
          <p v-if="!characters?.length" class="form-hint">You’ll need a character first. <NuxtLink to="/characters/builder" class="text-link">Create one →</NuxtLink></p>
        </div>
      </div>
      <div class="dialog-actions">
        <button type="button" class="button button-secondary" :disabled="loading" @click="handleCancel">Cancel</button>
        <button type="submit" class="button button-primary" :disabled="loading || !form.campaignCode.trim() || !form.characterId || !characters?.length">{{ loading ? 'Joining…' : 'Join campaign' }} <span aria-hidden="true">↗</span></button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import type { DeepReadonly } from 'vue';
import Modal from '~/components/ui/Modal.vue';
import type { Character } from '~/server/db/types';

interface Props {
  isOpen: boolean;
  loading: boolean;
  characters?: DeepReadonly<Character[]>;
}

interface JoinData {
  campaignCode: string;
  characterId: number;
}

interface Emits {
  join: [data: JoinData];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  campaignCode: '',
  characterId: null as number | null
});

function handleSubmit() {
  if (!form.value.characterId) return;
  
  emit('join', {
    campaignCode: form.value.campaignCode,
    characterId: form.value.characterId
  });
  resetForm();
}

function handleCancel() {
  resetForm();
  emit('cancel');
}

function resetForm() {
  form.value.campaignCode = '';
  form.value.characterId = null;
}

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});
</script>
