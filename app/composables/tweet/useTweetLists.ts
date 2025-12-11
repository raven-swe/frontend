import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { tweetKeys } from '~/constants/query-keys';
import { homeService } from '~/services/home/homeService';
import { profileTabsService } from '~/services/profile/profileTabsService';
import { tweetsService } from '~/services/tweet/tweetsService';

function updateCacheWithTweets(tweets: Tweet[], queryClient: ReturnType<typeof useQueryClient>) {
  tweets.forEach((tweet) => {
    queryClient.setQueryData(tweetKeys.entity(tweet.id), tweet);
    if (tweet.repostedBy) {
      queryClient.setQueryData(tweetKeys.reposter(tweet.repostedBy.username), tweet.repostedBy);
    }
  });
}

function mapTweetsToIds(tweets: Tweet[]) {
  return tweets.map((tweet) => ({
    id: tweet.id,
    // this is highliy experimental
    // I will use username instead of id as currenly the backend does not provide reposter id in the tweet object
    reposterId: tweet.repostedBy?.username ?? null,
  }));
}

export function useTimelineTweets(tab: MaybeRefOrGetter<'following' | 'for-you'>) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: computed(() => tweetKeys.timeline(toValue(tab))),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam = null, signal }) => {
      const res = await homeService.getHomeTab(
        { limit: 10, cursor: pageParam },
        toValue(tab),
        signal,
      );

      // Update the tweet cache
      updateCacheWithTweets(res.data, queryClient);
      const ids = mapTweetsToIds(res.data);
      return {
        ...res,
        data: ids,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
    structuralSharing: false,
  });
}

export function useProfileTweets(
  tab: MaybeRefOrGetter<'tweets' | 'replies' | 'likes' | 'media'>,
  username: MaybeRefOrGetter<string>,
) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: computed(() => tweetKeys.profileTab(toValue(username), toValue(tab))),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam = null, signal }) => {
      const res = await profileTabsService.getProfileTweetsPaginated(
        toValue(username),
        toValue(tab),
        pageParam,
        10,
        signal,
      );

      // Update the tweet cache
      updateCacheWithTweets(res.data, queryClient);
      const ids = mapTweetsToIds(res.data);
      return {
        ...res,
        data: ids,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
    structuralSharing: false,
  });
}

export function useTweetReplies(
  tweetId: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: computed(() => tweetKeys.replyList(toValue(tweetId))),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam = null, signal }) => {
      const res = await tweetsService.replies({
        tweetid: toValue(tweetId),
        cursor: pageParam,
        signal,
      });

      // Update the tweet cache
      updateCacheWithTweets(res.data, queryClient);
      const ids = mapTweetsToIds(res.data);
      return {
        ...res,
        data: ids,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
    structuralSharing: false,
    enabled: computed(() => toValue(enabled)),
  });
}
