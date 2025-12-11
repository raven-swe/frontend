import { useMutation } from '@tanstack/vue-query';
import type { FetchError } from 'ofetch';
import {
  likeTweet,
  unLikeTweet,
  retweetTweet,
  undoRetweetTweet,
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
      const previousTweet = client.getQueryData<Tweet>(['tweet', tweetId]);
      const previousTweetExtended = client.getQueryData<TweetWithParents>([
        'tweet-extended',
        tweetId,
      ]);
      if (previousTweetExtended) {
        client.setQueryData<TweetWithParents>(['tweet-extended', tweetId], (old) => {
          if (!old) return old;
          const tweetCopy = JSON.parse(JSON.stringify(toRaw(old)));
          const newTweet = optimisticUpdateFn(tweetCopy, action);
          return newTweet;
        });
      }
      if (previousTweet) {
        client.setQueryData<Tweet>(['tweet', tweetId], (old) => {
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
        client.setQueryData<Tweet>(['tweet', tweetId], context.previousTweet);
      }
      if (context?.previousTweetExtended) {
        client.setQueryData<TweetWithParents>(
          ['tweet-extended', tweetId],
          context.previousTweetExtended,
        );
      }
      const code = err?.data?.data?.error?.code;
      const message = t(`errors.tweet.${code}`) || t('errors.UNKNOWN_ERROR');
      showToaster('error', message);
    },

    onSettled: (_data, _err, { tweetId }, _mutationResult, { client }) => {
      client.invalidateQueries({ queryKey: ['tweet', tweetId] });
      client.invalidateQueries({ queryKey: ['tweet-extended', tweetId] });
    },
  });
}

export function useTweetLikeMutation() {
  return useTweetMutation<'like' | 'unlike'>({
    mutationFn: async ({ tweetId, action }) => {
      if (action === 'like') {
        await likeTweet(tweetId);
      } else {
        await unLikeTweet(tweetId);
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
  return useTweetMutation<'retweet' | 'undo-retweet'>({
    mutationFn: async ({ tweetId, action }) => {
      if (action === 'retweet') {
        await retweetTweet(tweetId);
      } else {
        await undoRetweetTweet(tweetId);
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
