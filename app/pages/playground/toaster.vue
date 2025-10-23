<script setup lang="ts">
import { showToaster } from '@/utils/showToaster';

function showToasts(error: string) {
  switch (error) {
    case 'error':
      showToaster('error', 'Something went wrong!');
      break;
    case 'success':
      showToaster('success', 'Operation completed successfully!');
      break;
    case 'warning':
      showToaster('warning', 'Please check your input.');
      break;
    case 'info':
      showToaster('info', 'Settings have been saved.');
      break;
    default:
      showToaster('info', 'This is a default info message.');
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
