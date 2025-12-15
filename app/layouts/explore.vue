<script lang="ts" setup>
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';

const tabs = [
  {
    label: $t('explore.for-you.tab'),
    route: '/explore/for-you',
  },
  {
    label: $t('explore.trending.tab'),
    route: '/explore/trending',
  },
  {
    label: $t('explore.news.tab'),
    route: '/explore/news',
  },
  {
    label: $t('explore.sports.tab'),
    route: '/explore/sports',
  },
  {
    label: $t('explore.entertainment.tab'),
    route: '/explore/entertainment',
  },
];
</script>

<template>
  <NuxtLayout name="searchable">
    <template #tabs>
      <Tabs>
        <Tab
          v-for="tab in tabs"
          :key="tab.route"
          :label="tab.label"
          :route="tab.route"
          :is-active="$route.path === tab.route"
          :data-cy="`explore-${tab.route.split('/')[2]}-tab`"
        />
      </Tabs>
    </template>
    <slot />
  </NuxtLayout>
</template>
