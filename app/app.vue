<script setup lang="ts">
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
  </NuxtLayout>
</template>
