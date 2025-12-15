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
        <h1 class="text-2xl font-bold">{{ t('legal.terms.title') }}</h1>
      </header>

      <main class="prose prose-neutral dark:prose-invert max-w-none">
        <p class="text-muted-foreground mb-8">
          {{
            t('legal.common.last-updated-text', {
              label: t('legal.terms.last-updated'),
              date: t('legal.terms.last-updated-date'),
            })
          }}
        </p>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 1,
                title: t('legal.terms.acceptance.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.acceptance.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 2,
                title: t('legal.terms.eligibility.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.eligibility.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 3,
                title: t('legal.terms.account.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.account.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 4,
                title: t('legal.terms.content.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.content.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 5,
                title: t('legal.terms.prohibited.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.prohibited.content') }}
          </p>
          <ul class="mt-4 list-disc space-y-2 ps-6">
            <li>{{ t('legal.terms.prohibited.items.spam') }}</li>
            <li>{{ t('legal.terms.prohibited.items.harassment') }}</li>
            <li>{{ t('legal.terms.prohibited.items.impersonation') }}</li>
            <li>{{ t('legal.terms.prohibited.items.illegal') }}</li>
            <li>{{ t('legal.terms.prohibited.items.malware') }}</li>
            <li>{{ t('legal.terms.prohibited.items.scraping') }}</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 6,
                title: t('legal.terms.termination.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.termination.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 7,
                title: t('legal.terms.disclaimer.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.disclaimer.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 8,
                title: t('legal.terms.changes.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.changes.content') }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold">
            {{
              t('legal.common.numbered-title', {
                number: 9,
                title: t('legal.terms.contact.title'),
              })
            }}
          </h2>
          <p>
            {{ t('legal.terms.contact.content') }}
          </p>
        </section>
      </main>

      <footer class="text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
        <NuxtLink to="/privacy-policy" class="text-primary hover:underline">
          {{ t('legal.privacy.title') }}
        </NuxtLink>
        <span class="mx-2">|</span>
        <NuxtLink to="/" class="text-primary hover:underline">
          {{ t('legal.back-to-home') }}
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>
