<script lang="ts" setup>
import { apiFetch } from '~/api';

async function handleLogin() {
  const response = await apiFetch('/api/auth/dummy-protected-resource', {
    method: 'GET',
  });
  console.log('Protected route response:', response);
}
</script>

<template>
  <div>
    <UiButton @click="handleLogin"> {{ 'Click to access protected route' }} </UiButton>
  </div>
</template>
