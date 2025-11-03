<script setup lang="ts">
import { useHead } from '#app';
import { useI18n } from '#imports';
import { useTheme } from '~/composables/useTheme';

const { locale, localeProperties } = useI18n();
useTheme();

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    dir: localeProperties.value.dir,
    // class: 'dark',
  },
}));
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <UiToaster position="bottom-right" />
  </NuxtLayout>
</template>
