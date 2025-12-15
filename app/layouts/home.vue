<script lang="ts" setup>
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import AccountSetup from '@/components/profile/account-setup/index.vue';
import { tweetKeys } from '~/constants/query-keys';
import { useQueryClient } from '@tanstack/vue-query';
import { prependTweetToInfiniteLists } from '~/composables/tweet/updateTweetList';

const { start, isOpen } = useAccountSetup();
onMounted(() => {
  if (sessionStorage.getItem('showAccountSetup') === 'true') {
    start();
    sessionStorage.removeItem('showAccountSetup');
  }
});

const queryClient = useQueryClient();

function handlePosted(tweet: Tweet) {
  const queryKeys = [
    tweetKeys.timeline('for-you'),
    tweetKeys.timeline('following'),
    tweetKeys.profileTab(tweet.author.username, 'tweets'),
    tweetKeys.profileTab(tweet.author.username, 'replies'),
    tweetKeys.profileTab(tweet.author.username, 'media'),
  ];
  prependTweetToInfiniteLists(queryClient, queryKeys, tweet);
}
</script>

<template>
  <NuxtLayout name="default">
    <AccountSetup v-if="isOpen" />
    <Tabs class="bg-background/65 sticky top-0 z-10 backdrop-blur-md">
      <Tab
        :label="$t('home.tabs.for-you')"
        route="/home/for-you"
        :is-active="$route.path === '/home/for-you'"
      />
      <Tab
        :label="$t('home.tabs.following')"
        route="/home/following"
        :is-active="$route.path === '/home/following'"
      />
    </Tabs>
    <TweetComposer class="border-b" @posted="handlePosted" />
    <slot />
  </NuxtLayout>
</template>
