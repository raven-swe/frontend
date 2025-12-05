<script setup lang="ts">
import { exploreService } from '~/services/explore/exploreService';
import type { ExploreTab } from '~~/shared/types/timeline';
import { validExploreTabs } from '~~/shared/types/timeline';
import type { TrendingHashtag } from '~~/shared/types/hashtag';
import { ref, computed, watch } from 'vue';
import Hashtag from '~/components/explore/Hashtag.vue';
import { useRoute } from 'vue-router';

function isTab(value: unknown): value is ExploreTab {
  return typeof value === 'string' && validExploreTabs.includes(value as ExploreTab);
}

definePageMeta({
  layout: 'explore',
  validate: (context) => isTab(context.params.tab),
});

const route = useRoute();
const tab = computed(() => route.params.tab as ExploreTab);

const trendingHashtags = ref<TrendingHashtag[]>([]);
const isLoading = ref(false);

const loadHashtags = async () => {
  isLoading.value = true;
  try {
    const response = await exploreService.getExploreTab(tab.value);
    trendingHashtags.value = response.data;
  } catch (error) {
    console.error('Failed to load trending hashtags:', error);
  } finally {
    isLoading.value = false;
  }
};

// Watch for tab changes and reload hashtags
watch(
  tab,
  async () => {
    await loadHashtags();
  },
  { immediate: true },
);
</script>

<template>
  <div class="border-border mx-auto max-w-[700px]">
    <div v-if="isLoading" class="text-primary mt-50 flex shrink-0 items-center justify-center">
      <UiSpinner />
    </div>
    <template v-else-if="trendingHashtags && trendingHashtags.length > 0">
      <Hashtag v-for="hashtag in trendingHashtags" :key="hashtag.hashtag" :hashtag="hashtag" />
    </template>
    <div v-else class="text-muted-foreground mt-20 text-center">
      <h1 class="text-xl font-semibold">{{ $t('explore.no-trending-hashtags') }}</h1>
    </div>
  </div>
</template>
