<template>
  <NuxtLayout name="default">
    <div class="auth-layout">
      <section class="auth-form">
        <p class="eyebrow">Adventure Oracle / Account</p>
        <h1 class="display">Sign in</h1>
        <p class="muted text-sm">Sign in to your Adventure Oracle account.</p>
        <form class="form-stack" @submit.prevent="handleSubmit">
          <div><label for="email">Email address</label><input id="email" v-model="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div>
          <div><label for="password">Password</label><input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required placeholder="Your password"></div>
          <p v-if="error" role="alert" class="error-note">{{ error }}</p>
          <button type="submit" :disabled="loading" class="button button-primary">{{ loading ? 'Signing in…' : 'Sign in' }} <span v-if="!loading" aria-hidden="true">↗</span></button>
        </form>
        <p class="auth-switch">No account yet? <NuxtLink to="/auth/register" class="text-link">Create an account</NuxtLink></p>
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

const email = ref('');
const password = ref('');

async function handleSubmit() {
  try {
    await auth.login(email.value, password.value);
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