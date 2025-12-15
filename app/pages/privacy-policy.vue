<script setup lang="ts">
import { useI18n } from '#imports';

definePageMeta({ layout: false });

const { t } = useI18n();
</script>

<template>
  <div class="bg-background min-h-screen">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <header class="mb-8 flex items-center gap-4">
        <UiButton variant="ghost-default" size="icon-sm" @click="$router.back()">
          <Icon name="lucide:arrow-left" size="1.2rem" />
        </UiButton>
        <NuxtLink to="/">
          <img
            src="https://cdn.raven.cmp27.space/light-raven.jpg"
            :alt="t('legal.common.logo-alt')"
            class="size-10 dark:hidden"
          />
          <img
            src="https://cdn.raven.cmp27.space/dark-raven.png"
            :alt="t('legal.common.logo-alt')"
            class="hidden size-10 dark:block"
          />
        </NuxtLink>
        <h1 class="text-2xl font-bold">{{ t('legal.privacy.title') }}</h1>
      </header>

      <main class="prose prose-neutral dark:prose-invert max-w-none">
        <p class="text-muted-foreground mb-8">
          {{
            t('legal.common.last-updated-text', {
              label: t('legal.privacy.last-updated'),
              date: t('legal.privacy.last-updated-date'),
            })
          }}
        </p>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 1,
                title: t('legal.privacy.collection.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.collection.content') }}
          </p>
          <ul class="mt-4 list-disc space-y-2 ps-6">
            <li>{{ t('legal.privacy.collection.items.account') }}</li>
            <li>{{ t('legal.privacy.collection.items.content') }}</li>
            <li>{{ t('legal.privacy.collection.items.usage') }}</li>
            <li>{{ t('legal.privacy.collection.items.device') }}</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 2,
                title: t('legal.privacy.use.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.use.content') }}
          </p>
          <ul class="mt-4 list-disc space-y-2 ps-6">
            <li>{{ t('legal.privacy.use.items.service') }}</li>
            <li>{{ t('legal.privacy.use.items.personalize') }}</li>
            <li>{{ t('legal.privacy.use.items.communicate') }}</li>
            <li>{{ t('legal.privacy.use.items.security') }}</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 3,
                title: t('legal.privacy.sharing.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.sharing.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 4,
                title: t('legal.privacy.cookies.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.cookies.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 5,
                title: t('legal.privacy.security.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.security.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 6,
                title: t('legal.privacy.rights.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.rights.content') }}
          </p>
          <ul class="mt-4 list-disc space-y-2 ps-6">
            <li>{{ t('legal.privacy.rights.items.access') }}</li>
            <li>{{ t('legal.privacy.rights.items.correct') }}</li>
            <li>{{ t('legal.privacy.rights.items.delete') }}</li>
            <li>{{ t('legal.privacy.rights.items.export') }}</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 7,
                title: t('legal.privacy.retention.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.retention.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 8,
                title: t('legal.privacy.children.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.children.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 9,
                title: t('legal.privacy.changes.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.changes.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 10,
                title: t('legal.privacy.contact.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.privacy.contact.content') }}
          </p>
        </section>
      </main>

      <footer class="text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
        <NuxtLink to="/terms-of-service" class="text-primary hover:underline">
          {{ t('legal.terms.title') }}
        </NuxtLink>
        <span class="mx-2">|</span>
        <NuxtLink to="/" class="text-primary hover:underline">
          {{ t('legal.back-to-home') }}
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>
