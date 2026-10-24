<template>
  <Teleport to="body">
  <dialog ref="dialog" class="dialog" :class="{ 'dialog-wide': wide, 'dialog-codex': variant === 'codex' }" :aria-labelledby="titleId" @cancel.prevent="requestClose" @click="handleBackdrop" @close="handleClose">
    <header class="dialog-header">
      <div><p class="eyebrow mb-2">{{ eyebrow || 'Adventure Oracle / Character & campaign' }}</p><h2 :id="titleId">{{ title }}</h2></div>
      <button type="button" class="dialog-close" :disabled="busy" aria-label="Close dialog" @click="requestClose">×</button>
    </header>
    <div class="dialog-body"><slot /></div>
  </dialog>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ isOpen: boolean; title: string; wide?: boolean; busy?: boolean; variant?: 'codex'; eyebrow?: string }>();
const emit = defineEmits<{ close: [] }>();
const titleId = useId();
const dialog = ref<HTMLDialogElement | null>(null);

function requestClose() {
  if (!props.busy) emit('close');
}

function handleClose() {
  if (props.isOpen) requestClose();
}

function handleBackdrop(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return;
  const bounds = dialog.value.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
}

watch([() => props.isOpen, dialog], ([open, element]) => {
  if (!element) return;
  if (open && !element.open) element.showModal();
  else if (!open && element.open) element.close();
}, { flush: 'post' });
</script>
