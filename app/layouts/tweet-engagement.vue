<script lang="ts" setup>
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { tweetsService } from '~/services/tweet/tweetsService';

const router = useRouter();
const queryClient = useQueryClient();
const tweetid = computed(() => router.currentRoute.value.params.tweetid as string);
const username = computed(() => router.currentRoute.value.params.username as string);
const tweetPath = computed(() => `/profile/${username.value}/status/${tweetid.value}`);

const { data: tweetData, suspense } = useQuery<TweetWithParents, ApiErrorResponse>({
  queryKey: ['tweet', tweetid],
  queryFn: async () => (await tweetsService.tweet(tweetid.value)).data,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: false,
  structuralSharing: false,
});

watch(
  () => tweetData.value,
  async (newTweet) => {
    if (!newTweet) return;

    const route = router.currentRoute.value;
    const correctUser = newTweet.author.username;

    if (route.params.username !== correctUser) {
      const newPath = route.fullPath.replace(
        `/profile/${route.params.username}/`,
        `/profile/${correctUser}/`,
      );

      await router.replace(newPath);
    }
  },
  { immediate: true },
);

provide('tweet-data', tweetData);

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    if (!tweetData.value) return;
    queryClient.invalidateQueries({
      queryKey: ['tweet', tweetid.value],
    });
  },
);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <NuxtLayout name="default">
    <div class="bg-background/65 sticky top-0 z-10 backdrop-blur-md">
      <header class="flex items-center gap-6 p-2">
        <UiButton
          variant="ghost-default"
          size="icon-sm"
          class="bg-transparent"
          data-test="back-button"
          @click="$router.back()"
        >
          <Icon name="ic:round-arrow-back" size="20" />
        </UiButton>
        <div class="flex flex-col items-start">
          <h1 class="text-foreground text-md text-center font-semibold">
            {{ $t('tweet.engagement.title') }}
          </h1>
        </div>
      </header>
      <UiTabs>
        <UiTab
          :route="`${tweetPath}/quotes`"
          :is-active="$route.path.toLowerCase() === `${tweetPath}/quotes`"
          :label="$t('tweet.engagement.quotes.title')"
          data-cy="tweet-engagement-quotes-tab"
        />
        <UiTab
          :route="`${tweetPath}/reposts`"
          :is-active="$route.path.toLowerCase() === `${tweetPath}/reposts`"
          :label="$t('tweet.engagement.reposts.title')"
          data-cy="tweet-engagement-reposts-tab"
        />
        <UiTab
          :route="`${tweetPath}/likes`"
          :is-active="$route.path.toLowerCase() === `${tweetPath}/likes`"
          :label="$t('tweet.engagement.likes.title')"
          data-cy="tweet-engagement-likes-tab"
        />
      </UiTabs>
    </div>
    <slot />
  </NuxtLayout>
</template>
