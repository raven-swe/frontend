import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/vue-query';
import { tweetKeys } from '~/constants/query-keys';
import { exploreService } from '~/services/explore/exploreService';
import { homeService } from '~/services/home/homeService';
import { profileTabsService } from '~/services/profile/profileTabsService';
import { searchService } from '~/services/search/searchService';
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
      const res = await homeService.getHomeTab({
        tab: toValue(tab),
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

export function useTweetSearch(
  tab: 'latest' | 'top' | 'media',
  searchQuery: MaybeRefOrGetter<string>,
  peopleFilter: MaybeRefOrGetter<PeopleFilter>,
  execludeMutedAndBlocked: MaybeRefOrGetter<boolean> = true,
) {
  const queryClient = useQueryClient();
  const searchQueryValue = computed(() => toValue(searchQuery));
  const peopleFilterValue = computed(() => toValue(peopleFilter));
  const excludeMutedAndBlockedValue = computed(() => toValue(execludeMutedAndBlocked));

  return useInfiniteQuery({
    queryKey: computed(() =>
      tweetKeys.search(
        searchQueryValue.value,
        tab,
        peopleFilterValue.value,
        excludeMutedAndBlockedValue.value ? 'exclude' : 'include',
      ),
    ),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam = null, signal }) => {
      const res = await searchService.getTweets(
        {
          pagination: { cursor: pageParam },
          query: searchQueryValue.value,
          tab: tab,
          peopleFilter: peopleFilterValue.value,
          excludeMutedAndBlocked: excludeMutedAndBlockedValue.value,
        },
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

export function useCategorizedTweet() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: tweetKeys.exploreCategorized(),
    queryFn: async () => {
      const res = await exploreService.getCategorizedTweets();

      // Update the tweet cache
      const tweets = res.data.categories.flatMap((category) => category.tweets);

      updateCacheWithTweets(tweets, queryClient);
      const result = res.data.categories.map((category) => ({
        category: category.category,
        tweets: mapTweetsToIds(category.tweets),
      }));
      return {
        ...res,
        data: {
          categories: result,
        },
      };
    },
    structuralSharing: false,
  });
}

export function useTweetQuotes(tweetId: MaybeRefOrGetter<string | undefined>) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    enabled: computed(() => !!toValue(tweetId)),
    queryKey: computed(() => tweetKeys.quoteList(toValue(tweetId) ?? '')),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam = null, signal }) => {
      const tweetIdVal = toValue(tweetId);
      if (!tweetIdVal) throw new Error('Tweet ID is undefined');
      const res = await tweetsService.quotes({
        tweetid: tweetIdVal,
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
  });
}
