<script lang="ts" setup>
import { provide } from 'vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import type { Tweet } from '~~/shared/types/tweets';

type NewTweetHandler = (tweet: Tweet) => void;

const handlers: NewTweetHandler[] = [];

const registerNewTweetHandler = (cb: NewTweetHandler) => {
  handlers.push(cb);
  return () => {
    const idx = handlers.indexOf(cb);
    if (idx !== -1) handlers.splice(idx, 1);
  };
};

const emitNewTweet = (tweet: Tweet) => {
  handlers.forEach((h) => {
    try {
      h(tweet);
    } catch {
      // ignore handler errors
    }
  });
};

provide('registerNewTweetHandler', registerNewTweetHandler);
</script>

<template>
  <NuxtLayout name="default">
    <Tabs
      class="bg-background/60 fixed top-0 z-50 inline-flex h-12 w-full max-w-[598px] cursor-pointer items-center gap-2 rounded-b-md px-3 py-1 text-sm font-medium backdrop-blur-sm"
    >
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
    <TweetComposer class="mt-10" @posted="emitNewTweet" />

    <slot />
  </NuxtLayout>
</template>
