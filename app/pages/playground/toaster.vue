<script setup lang="ts">
import { showToaster } from '@/utils/showToaster';

function showToasts(error: string) {
  switch (error) {
    case 'error':
      showToaster('error', 'toaster.login.error', true);
      break;
    case 'success':
      showToaster('success', 'toaster.login.success', true);
      break;
    case 'warning':
      showToaster('warning', 'toaster.login.success');
      break;
    case 'info':
      showToaster('info', 'toaster.login.success');
      break;
    default:
      showToaster('info', 'toaster.login.error');
      break;
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20">
    <UiButton class="my-3 w-75" variant="default" type="button" @click="showToasts('error')">{{
      $t('error')
    }}</UiButton>
    <UiButton class="my-3 w-75" variant="default" type="button" @click="showToasts('success')">{{
      $t('success')
    }}</UiButton>
    <UiButton class="my-3 w-75" variant="default" type="button" @click="showToasts('warning')">{{
      $t('warning')
    }}</UiButton>
    <UiButton class="my-3 w-75" variant="default" type="button" @click="showToasts('info')">{{
      $t('info')
    }}</UiButton>
  </div>
</template>
