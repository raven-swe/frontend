<script setup lang="ts">
import { useHead } from '#app';
import { useI18n } from '#imports';

const { locale, localeProperties } = useI18n();

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    dir: localeProperties.value.dir,
  },
}));
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <UiToaster position="bottom-right" />
  </NuxtLayout>
</template>
