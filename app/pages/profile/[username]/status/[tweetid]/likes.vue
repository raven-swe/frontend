<script lang="ts" setup>
import { tweetsService } from '~/services/tweet/tweetsService';

definePageMeta({
  layout: 'tweet-engagement',
});

const router = useRouter();
const username = computed(() => router.currentRoute.value.params.username as string);
const tweetid = computed(() => router.currentRoute.value.params.tweetid as string);
</script>
<template>
  <UserList
    :fetcher-fn="
      (cursor, signal) =>
        tweetsService.likes({
          tweetid,
          limit: 20,
          cursor,
          signal,
        })
    "
    :current-username="username"
    query-key-suffix="likes"
    :query-key-suffix-array="['tweet', tweetid]"
    :empty-title="$t('tweet.engagement.likes.empty.title')"
    :empty-description="$t('tweet.engagement.likes.empty.description')"
  />
</template>
