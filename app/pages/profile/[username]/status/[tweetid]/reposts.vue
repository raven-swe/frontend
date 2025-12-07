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
        tweetsService.retweets({
          tweetid: tweetid,
          limit: 20,
          cursor,
          signal,
        })
    "
    :current-username="username"
    query-key-suffix="reposts"
    :query-key-suffix-array="['tweet', tweetid]"
    :empty-title="$t('tweet.engagement.reposts.empty.title')"
    :empty-description="$t('tweet.engagement.reposts.empty.description')"
  />
</template>
