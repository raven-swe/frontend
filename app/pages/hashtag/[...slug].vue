<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const route = useRoute();
// Use default layout so sidebar etc still appear
definePageMeta({ layout: 'default' });
const slugParam = route.params.slug;
// Normalize slug to string (catch-all can be array)
const tagPath = Array.isArray(slugParam) ? slugParam.join('/') : String(slugParam || '');
const tagLabel = computed(() => `#${tagPath}`);
</script>

<template>
  <section class="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center p-6">
    <div
      class="w-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
    >
      <div class="flex flex-col items-center text-center">
        <span
          class="bg-primary/10 text-primary mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full"
          aria-hidden="true"
        >
          <Icon name="ph:hash-bold" size="28" />
        </span>

        <h1 class="text-3xl font-bold tracking-tight text-balance">{{ tagLabel }}</h1>
        <p class="text-muted-foreground mt-3 max-w-prose text-sm">
          {{ t('hashtag.placeholder.not-implemented') }}
        </p>

        <p
          class="mt-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/80 dark:text-white/80"
        >
          <Icon name="ph:link-simple" size="14" aria-hidden="true" />
          {{ t('hashtag.placeholder.path', { path: `/hashtag/${tagPath}` }) }}
        </p>

        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink
            to="/"
            class="bg-primary focus:ring-primary/60 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus:ring-2 focus:outline-none"
            :aria-label="t('leftsidebar.nav.home')"
          >
            <Icon name="ph:house-bold" size="16" />
            {{ t('leftsidebar.nav.home') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
