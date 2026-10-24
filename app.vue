<template>
  <NuxtPage />
  <BackgroundMusic />
</template>

<script setup lang="ts">
import BackgroundMusic from '~/components/ui/BackgroundMusic.vue';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
onMounted(() => {
  auth.initAuth();
});
</script>
