import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { tweetKeys } from '~/constants/query-keys';
import { profileTabsService } from '~/services/profile/profileTabsService';
import { tweetsService } from '~/services/tweet/tweetsService';

export function useTweet(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => tweetKeys.entity(toValue(id))),
    queryFn: async () => {
      const res = await tweetsService.tweet(toValue(id));
      const tweetData = res.data;
      delete tweetData.parentTweets;
      delete tweetData.hasMoreParents;
      delete tweetData.rootTweet;
      return tweetData;
    },
  });
}

export function useTweetWithParents(id: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient();
  return useQuery<TweetWithParents, ApiErrorResponse>({
    queryKey: computed(() => tweetKeys.detail(toValue(id))),
    queryFn: async () => {
      const res = await tweetsService.tweet(toValue(id));
      const tweetData = res.data;
      if (tweetData.rootTweet && !isTweetDeleted(tweetData.rootTweet)) {
        queryClient.setQueryData(tweetKeys.entity(tweetData.rootTweet.id), tweetData.rootTweet);
      }
      if (tweetData.parentTweets) {
        tweetData.parentTweets.forEach((parentTweet) => {
          if (!isTweetDeleted(parentTweet))
            queryClient.setQueryData(tweetKeys.entity(parentTweet.id), parentTweet);
        });
      }

      // Cache the main tweet without parents
      const tweetCopy = JSON.parse(JSON.stringify(tweetData));
      delete tweetCopy.rootTweet;
      delete tweetCopy.parentTweets;
      delete tweetCopy.hasMoreParents;
      queryClient.setQueryData(tweetKeys.entity(tweetData.id), tweetCopy);

      return tweetData;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    structuralSharing: false,
  });
}

export function useTweetReposter(reposterId: MaybeRefOrGetter<string | null | undefined>) {
  return useQuery({
    queryKey: computed(() => {
      const id = toValue(reposterId);
      return id ? tweetKeys.reposter(id) : ['tweet', 'reposter', 'none'];
    }),
    queryFn: async () => {
      const id = toValue(reposterId);
      if (!id) return null;
      const res = await profileTabsService.getReposterById(id);
      return res;
    },
    enabled: computed(() => !!toValue(reposterId)),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });
}
