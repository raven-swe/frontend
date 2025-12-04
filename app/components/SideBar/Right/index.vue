<script lang="ts" setup>
import { exploreService } from '~/services/explore/exploreService';
import type { TrendingHashtag } from '~~/shared/types/hashtag';
import Hashtag from '~/components/explore/Hashtag.vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const trendingHashtags = ref<TrendingHashtag[]>([]);
const isLoading = ref(false);
const router = useRouter();
const showWhatIsHappening = ref(true);

const loadHashtags = async () => {
  isLoading.value = true;
  try {
    const response = await exploreService.getExploreTab('for-you');
    trendingHashtags.value = response.data.trendingHashtags;
  } catch (error) {
    console.error('Failed to load trending hashtags:', error);
  } finally {
    isLoading.value = false;
  }
};

const goToExplore = () => {
  router.push({ name: 'explore', params: { tab: 'for-you' } });
};

watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    showWhatIsHappening.value = !newPath.includes('explore');
  },
  { immediate: true },
);

onMounted(() => {
  loadHashtags();
});

const whoToFollowItems = [
  {
    name: 'Hussein',
    username: '@hussein',
    image: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Ahmed Amr',
    username: '@btngana',
    image: 'https://i.pravatar.cc/150?img=3',
  },
  {
    name: 'Abdullah Farag',
    username: '@farag',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  {
    name: 'mostafa Hassan',
    username: '@mostafa',
    image: 'https://i.pravatar.cc/150?img=13',
  },
  {
    name: 'Habiba Ayman',
    username: '@habiba',
    image: 'https://i.pravatar.cc/150?img=10',
  },
];
</script>

<template>
  <div class="ms-4">
    <div v-if="showWhatIsHappening">
      <div class="bg-background/60 sticky top-0 z-50 backdrop-blur-sm">
        <UiSearchField />
      </div>
      <!-- What is happening -->
      <SideBarRightPreviewCard :title="$t('rightsidebar.whats-happening.title')">
        <div v-if="isLoading" class="text-primary mt-10 flex shrink-0 items-center justify-center">
          <UiSpinner />
        </div>
        <Hashtag
          v-for="hashtag in trendingHashtags"
          v-else
          :key="hashtag.hashtag"
          :hashtag="hashtag"
        />
        <UiButton variant="ghost-primary" size="sm" @click="goToExplore">
          {{ $t('rightsidebar.show-more') }}
        </UiButton>
      </SideBarRightPreviewCard>
    </div>
    <!-- Who to follow -->
    <SideBarRightPreviewCard :title="$t('rightsidebar.who-to-follow.title')">
      <SideBarRightPreviewCardItem
        v-for="whoFollowItem in whoToFollowItems"
        :key="whoFollowItem.username"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-row">
            <img
              :src="whoFollowItem.image"
              :alt="whoFollowItem.name"
              class="h-10 w-10 rounded-full"
            />
            <div class="ms-3 flex flex-col">
              <h1 class="text-md text-foreground font-bold">
                {{ whoFollowItem.name }}
              </h1>
              <p class="text-muted-foreground text-xs">{{ whoFollowItem.username }}</p>
            </div>
          </div>
          <div class="flex h-full">
            <button class="bg-foreground text-background cursor-pointer rounded-full px-4 py-2">
              {{ $t('rightsidebar.who-to-follow.follow') }}
            </button>
          </div>
        </div>
      </SideBarRightPreviewCardItem>
    </SideBarRightPreviewCard>
  </div>
</template>
