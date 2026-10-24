<template>
  <Modal :is-open="isOpen" :busy="loading" title="Create a campaign" @close="handleCancel">
    <p class="muted text-sm leading-relaxed mb-6">Enter a name. Your campaign will have a code you can share with other players.</p>
    <form @submit.prevent="handleSubmit">
      <label for="campaign-name">Campaign name</label>
      <input id="campaign-name" v-model="form.name" required maxlength="100" placeholder="e.g. The Ashen Frontier" autofocus :disabled="loading">
      <div class="dialog-actions">
        <button type="button" class="button button-secondary" :disabled="loading" @click="handleCancel">Cancel</button>
        <button type="submit" class="button button-primary" :disabled="loading || !form.name.trim()">{{ loading ? 'Creating…' : 'Create campaign' }} <span aria-hidden="true">↗</span></button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue';

interface Props {
  isOpen: boolean;
  loading: boolean;
}

interface Emits {
  create: [data: { name: string }];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  name: ''
});

function handleSubmit() {
  emit('create', { name: form.value.name });
  form.value.name = '';
}

function handleCancel() {
  form.value.name = '';
  emit('cancel');
}

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    form.value.name = '';
  }
});
</script>
