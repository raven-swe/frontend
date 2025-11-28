<script lang="ts" setup>
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';

const tabs = [
  {
    label: $t('search.top.tab'),
    route: '/search/top',
  },
  {
    label: $t('search.latest.tab'),
    route: '/search/latest',
  },
  {
    label: $t('search.people.tab'),
    route: '/search/people',
  },
  {
    label: $t('search.media.tab'),
    route: '/search/media',
  },
];
</script>

<template>
  <NuxtLayout name="default">
    <div
      class="bg-background/60 fixed top-0 z-50 flex inline-flex h-30 w-full max-w-[598px] cursor-pointer flex-col items-center gap-2 rounded-b-md py-1 text-sm font-medium backdrop-blur-sm"
    >
      <UiSearchField />
      <Tabs>
        <Tab
          v-for="tab in tabs"
          :key="tab.route"
          :label="tab.label"
          :route="tab.route"
          :is-active="$route.path === tab.route"
        />
      </Tabs>
    </div>
    <slot />
  </NuxtLayout>
</template>
