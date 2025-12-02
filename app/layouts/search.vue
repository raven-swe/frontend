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

const tabs = computed(() => [
  {
    label: $t('search.top.tab'),
    route: `/search/top${route.query.q ? `?q=${route.query.q}` : ''}`,
    path: '/search/top',
  },
  {
    label: $t('search.latest.tab'),
    route: `/search/latest${route.query.q ? `?q=${route.query.q}` : ''}`,
    path: '/search/latest',
  },
  {
    label: $t('search.people.tab'),
    route: `/search/people${route.query.q ? `?q=${route.query.q}` : ''}`,
    path: '/search/people',
  },
  {
    label: $t('search.media.tab'),
    route: `/search/media${route.query.q ? `?q=${route.query.q}` : ''}`,
    path: '/search/media',
  },
]);
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
        />
      </Tabs>
    </template>
    <slot />
  </NuxtLayout>
</template>
