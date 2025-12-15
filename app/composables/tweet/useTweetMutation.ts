import { useMutation, type InfiniteData, type QueryKey } from '@tanstack/vue-query';
import type { FetchError } from 'ofetch';
import { tweetKeys } from '~/constants/query-keys';
import {
  likeTweet,
  unLikeTweet,
  retweetTweet,
  undoRetweetTweet,
  deleteTweet,
} from '~/services/tweet/actionButtonsService';

type Actions = 'like' | 'unlike' | 'retweet' | 'undo-retweet';

function isNoOpError(action: Actions, err: FetchError<FetchError<ApiErrorResponse>>) {
  const code = err?.data?.data?.error?.code;
  switch (action) {
    case 'like':
    case 'unlike':
      return code === 'CONFLICTING_LIKE';
    case 'retweet':
    case 'undo-retweet':
      return code === 'CONFLICTING_RETWEET';
    default:
      return false;
  }
}

export function useTweetMutation<ActionType extends Actions, Q = void>({
  mutationFn,
  optimisticUpdateFn,
}: {
  mutationFn: ({ tweetId, action }: { tweetId: string; action: ActionType }) => Promise<Q>;
  optimisticUpdateFn: (data: Tweet, action: ActionType) => Tweet;
}) {
  const { t } = useI18n();
  return useMutation<
    Q,
    FetchError<FetchError<ApiErrorResponse>>,
    { tweetId: string; action: ActionType },
    {
      previousTweet?: Tweet;
      previousTweetExtended?: TweetWithParents;
    }
  >({
    mutationKey: ['tweet-interaction'],
    mutationFn,
    onMutate: async ({ tweetId, action }, { client }) => {
      const previousTweet = client.getQueryData<Tweet>(tweetKeys.entity(tweetId));
      if (previousTweet) {
        client.setQueryData<Tweet>(tweetKeys.entity(tweetId), (old) => {
          if (!old) return old;
          const tweetCopy = JSON.parse(JSON.stringify(toRaw(old)));
          const newTweet = optimisticUpdateFn(tweetCopy, action);
          return newTweet;
        });
      }

      const previousTweetExtended = client.getQueryData<TweetWithParents>(
        tweetKeys.detail(tweetId),
      );
      if (previousTweetExtended) {
        client.setQueryData<TweetWithParents>(tweetKeys.detail(tweetId), (old) => {
          if (!old) return old;
          const tweetCopy = JSON.parse(JSON.stringify(toRaw(old)));
          const newTweet = optimisticUpdateFn(tweetCopy, action);
          return newTweet;
        });
      }

      return {
        previousTweet,
        previousTweetExtended,
      };
    },

    onError: (err, { tweetId, action }, context, { client }) => {
      console.error('Error during tweet mutation:', err);
      if (isNoOpError(action, err)) {
        return;
      }
      if (context?.previousTweet) {
        client.setQueryData<Tweet>(tweetKeys.entity(tweetId), context.previousTweet);
      }
      if (context?.previousTweetExtended) {
        client.setQueryData<TweetWithParents>(
          tweetKeys.detail(tweetId),
          context.previousTweetExtended,
        );
      }
      const code = err?.data?.data?.error?.code;
      const message = t(`errors.tweet.${code}`) || t('errors.UNKNOWN_ERROR');
      showToaster('error', message);
    },

    onSettled: (_data, _err, { tweetId }, _mutationResult, { client }) => {
      client.invalidateQueries({ queryKey: tweetKeys.entity(tweetId) });
      client.invalidateQueries({ queryKey: tweetKeys.detail(tweetId) });
    },
  });
}

export function useTweetLikeMutation() {
  return useTweetMutation<'like' | 'unlike', { success: boolean; message: string }>({
    mutationFn: async ({ tweetId, action }) => {
      if (action === 'like') {
        return await likeTweet(tweetId);
      } else {
        return await unLikeTweet(tweetId);
      }
    },
    optimisticUpdateFn: (tweet: Tweet | TweetWithParents, action) => {
      if (action === 'like') {
        tweet.likeCount += 1;
        tweet.isLiked = true;
      } else {
        tweet.likeCount = Math.max(0, tweet.likeCount - 1);
        tweet.isLiked = false;
      }
      return tweet;
    },
  });
}

export function useTweetRetweetMutation() {
  return useTweetMutation<'retweet' | 'undo-retweet', { success: boolean; message: string }>({
    mutationFn: async ({ tweetId, action }) => {
      if (action === 'retweet') {
        return await retweetTweet(tweetId);
      } else {
        return await undoRetweetTweet(tweetId);
      }
    },
    optimisticUpdateFn: (tweet: Tweet | TweetWithParents, action) => {
      if (action === 'retweet') {
        tweet.retweetCount += 1;
        tweet.isRetweeted = true;
      } else {
        tweet.retweetCount = Math.max(0, tweet.retweetCount - 1);
        tweet.isRetweeted = false;
      }
      return tweet;
    },
  });
}

export function useTweetDeleteMutation() {
  const { t } = useI18n();

  return useMutation<
    undefined,
    FetchError<FetchError<ApiErrorResponse>>,
    { tweetId: string },
    {
      previousLists?: [QueryKey, InfiniteData<ApiSuccessResponse<TweetListItem[]>> | undefined][];
      previousEntity?: Tweet;
      previousDetail?: TweetWithParents;
    }
  >({
    mutationKey: ['tweet-interaction', 'delete'],
    mutationFn: async ({ tweetId }) => {
      await deleteTweet(tweetId);
    },
    onMutate: async ({ tweetId }, { client }) => {
      // cancel any outgoing fetches for tweets lists
      await client.cancelQueries({ queryKey: tweetKeys.all, exact: false });

      const previousLists = client.getQueriesData<
        InfiniteData<ApiSuccessResponse<TweetListItem[]>>
      >({
        queryKey: tweetKeys.all,
        exact: false,
      });

      // optimistically remove the tweet from all lists
      client.setQueriesData<InfiniteData<ApiSuccessResponse<TweetListItem[]>>>(
        {
          queryKey: tweetKeys.all,
          exact: false,
        },
        (oldData) => {
          if (!oldData) return oldData;
          const updatedPages = oldData.pages.map((page) => {
            const filteredData = page.data.filter((tweet) => tweet.id !== tweetId);
            return { ...page, data: filteredData };
          });
          return { ...oldData, pages: updatedPages };
        },
      );

      const previousEntity = client.getQueryData<Tweet>(tweetKeys.entity(tweetId));
      const previousDetail = client.getQueryData<TweetWithParents>(tweetKeys.detail(tweetId));

      // remove canonical entries
      client.removeQueries({ queryKey: tweetKeys.entity(tweetId), exact: true });
      client.removeQueries({ queryKey: tweetKeys.detail(tweetId), exact: true });

      return { previousLists, previousEntity, previousDetail };
    },
    onError: (err, { tweetId }, ctx, { client }) => {
      console.error('Error during tweet delete:', err);

      // restore lists
      ctx?.previousLists?.forEach(([queryKey, data]) => {
        client.setQueryData(queryKey, data);
      });

      if (ctx?.previousEntity) {
        client.setQueryData(tweetKeys.entity(tweetId), ctx.previousEntity);
      }
      if (ctx?.previousDetail) {
        client.setQueryData(tweetKeys.detail(tweetId), ctx.previousDetail);
      }

      const code = err?.data?.data?.error?.code;
      const message = t(`errors.tweet.${code}`) || t('errors.UNKNOWN_ERROR');
      showToaster('error', message);
    },
    onSettled: (_data, _err, { tweetId }, _ctx, { client }) => {
      client.invalidateQueries({ queryKey: tweetKeys.entity(tweetId) });
      client.invalidateQueries({ queryKey: tweetKeys.detail(tweetId) });
    },
  });
}
