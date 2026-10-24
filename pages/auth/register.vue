<template>
  <NuxtLayout name="default">
    <div class="auth-layout">
      <section class="auth-form">
        <p class="eyebrow">Adventure Oracle / Account</p><h1 class="display">Create an account</h1>
        <p class="muted text-sm">Save your characters and join campaigns.</p>
        <form class="form-stack" @submit.prevent="handleSubmit">
          <div><label for="name">Your name</label><input id="name" v-model="name" name="name" autocomplete="name" required placeholder="What should we call you?"></div>
          <div><label for="email">Email address</label><input id="email" v-model="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div>
          <div><label for="password">Password</label><input id="password" v-model="password" name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="At least 8 characters" aria-describedby="password-hint"><p id="password-hint" class="form-hint">Make it at least 8 characters long.</p></div>
          <p v-if="error" role="alert" class="error-note">{{ error }}</p>
          <button type="submit" :disabled="loading" class="button button-primary">{{ loading ? 'Creating your account…' : 'Create account' }} <span v-if="!loading" aria-hidden="true">↗</span></button>
        </form>
        <p class="auth-switch">Already have an account? <NuxtLink to="/auth/login" class="text-link">Sign in</NuxtLink></p>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';

const router = useRouter();
const auth = useAuthStore();
const { error, loading } = storeToRefs(auth);

const name = ref('');
const email = ref('');
const password = ref('');

async function handleSubmit() {
  try {
    await auth.register(name.value, email.value, password.value);
    router.push('/');
  } catch {
    // Error is handled by the store
  }
}

// Redirect if already logged in
if (auth.isAuthenticated) {
  router.push('/');
}
</script> 