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
    <div v-if="isLoading" class="text-primary flex shrink-0 items-center justify-center py-4">
      <UiSpinner />
    </div>
    <div v-else-if="trendingHashtags && trendingHashtags.length > 0" class="py-2">
      <Hashtag
        v-for="(hashtag, index) in trendingHashtags"
        :key="hashtag.hashtag"
        :hashtag="hashtag"
        :rank="index"
      />
    </div>
    <div v-else data-test="no-results" class="mx-auto my-10 max-w-90 px-8 text-start break-words">
      <p class="text-[2rem] leading-tight font-black">{{ $t('explore.no-trending-hashtags') }}</p>
    </div>
  </div>
</template>
