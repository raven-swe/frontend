<script setup lang="ts">
import { showToaster } from '@/utils/showToaster';

function showToasts(type: 'error' | 'success' | 'warning' | 'info') {
  showToaster(type, `toaster.login.${type}`, true);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-20">
    <UiButton class="w-75" @click="showToasts('error')">
      {{ $t('error') }}
    </UiButton>

    <UiButton class="w-75" @click="showToasts('success')">
      {{ $t('success') }}
    </UiButton>

    <UiButton class="w-75" @click="showToasts('warning')">
      {{ $t('warning') }}
    </UiButton>

    <UiButton class="w-75" @click="showToasts('info')">
      {{ $t('info') }}
    </UiButton>
  </div>
</template>
