<script lang="ts" setup>
import { watch, onMounted, computed } from 'vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import { useSearchQuery } from '~/composables/useSearchQuery';

const { searchQuery, initializeFromRoute } = useSearchQuery();
const route = useRoute();

// Initialize and watch for route changes
onMounted(() => {
  initializeFromRoute();
});

// Sync search query when route changes
watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string') {
      searchQuery.value = newQuery;
    }
  },
);

const tabs = computed(() => {
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (route.query.q) {
      params.append('q', route.query.q as string);
    }
    if (route.query.pf) {
      params.append('pf', route.query.pf as string);
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const queryString = buildQueryString();

  return [
    {
      label: $t('search.top.tab'),
      route: `/search/top${queryString}`,
      path: '/search/top',
    },
    {
      label: $t('search.latest.tab'),
      route: `/search/latest${queryString}`,
      path: '/search/latest',
    },
    {
      label: $t('search.people.tab'),
      route: `/search/people${queryString}`,
      path: '/search/people',
    },
    {
      label: $t('search.media.tab'),
      route: `/search/media${queryString}`,
      path: '/search/media',
    },
  ];
});
</script>

<template>
  <NuxtLayout name="searchable">
    <template #tabs>
      <Tabs>
        <Tab
          v-for="tab in tabs"
          :key="tab.path"
          :label="tab.label"
          :route="tab.route"
          :is-active="$route.path === tab.path"
          :data-cy="`search-${tab.path.split('/')[2]}-tab`"
        />
      </Tabs>
    </template>
    <slot />
  </NuxtLayout>
</template>
