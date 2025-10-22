<script lang="ts" setup>
import { apiFetch } from '~/api';

async function handleLogin() {
  const response = await apiFetch('/api/auth/dummy-login', {
    method: 'POST',
  });
  console.log('Dummy login response:', response);
}
</script>

<template>
  <div>
    <UiButton @click="handleLogin"> {{ 'Click to dummy login' }} </UiButton>
  </div>
</template>
