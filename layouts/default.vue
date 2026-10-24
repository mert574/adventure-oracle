<template>
  <div class="page-screen">
    <NuxtLink to="/" class="page-back"><span aria-hidden="true">‹</span> Back to camp</NuxtLink>
    <main id="main-content" class="shell page-content"><slot /></main>
    <NuxtLink to="/credits" class="page-credits">Rules &amp; credits</NuxtLink>
  </div>
</template>
