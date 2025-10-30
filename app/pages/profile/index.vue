<script setup lang="ts">
const { t } = useI18n();

definePageMeta({
  layout: 'default',
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <div class="text-center">
      <div class="mb-6">
        <LogoRaven class="text-primary mx-auto h-16 w-16" />
      </div>
      <h1 class="mb-4 text-3xl font-bold">{{ t('profile.not-logged-in.title') }}</h1>
      <p class="text-muted-foreground mb-8 text-lg">
        {{ t('profile.not-logged-in.description') }}
      </p>
      <div class="space-y-3">
        <NuxtLink
          to="/"
          class="bg-primary hover:bg-primary/90 inline-block rounded-full px-8 py-3 font-semibold text-white transition-colors"
        >
          {{ t('profile.not-logged-in.take-me-home') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
