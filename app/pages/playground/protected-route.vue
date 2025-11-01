<script lang="ts" setup>
import { apiFetch } from '~/api';

const { data } = useAsyncData('protected-route-data', async () => {
  const response = await apiFetch('/api/auth/dummy-protected-resource', {
    method: 'GET',
  });
  return response;
});
</script>

<template>
  <div>
    <div v-if="data">
      <p>{{ data }}</p>
    </div>
    <div v-else>
      <p>{{ $t('ui.loading') }}</p>
    </div>
  </div>
</template>
