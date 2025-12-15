import { useQueryClient } from '@tanstack/vue-query';
import { tweetKeys } from '~/constants/query-keys';
import { prependTweetToInfiniteLists } from './updateTweetList';

export function usePostTweet() {
  const queryClient = useQueryClient();
  function updateTweetCache(
    tweet: Tweet,
    replyToTweetId: string | null,
    quoteToTweetId: string | null,
  ) {
    queryClient.setQueryData<Tweet>(tweetKeys.entity(tweet.id), tweet);

    prependTweetToInfiniteLists(
      queryClient,
      [
        tweetKeys.timeline('for-you'),
        tweetKeys.timeline('following'),
        tweetKeys.profileTab(tweet.author.username, 'replies'),
        tweetKeys.profileTab(tweet.author.username, 'media'),
      ],
      tweet,
    );

    if (replyToTweetId) {
      queryClient.setQueryData<Tweet>(tweetKeys.entity(replyToTweetId), (old) => {
        if (!old) return old;
        const clone = JSON.parse(JSON.stringify(old)) as Tweet;
        clone.replyCount = clone.replyCount + 1;
        return clone;
      });

      prependTweetToInfiniteLists(queryClient, [tweetKeys.replyList(replyToTweetId)], tweet);
    } else {
      prependTweetToInfiniteLists(
        queryClient,
        [tweetKeys.profileTab(tweet.author.username, 'tweets')],
        tweet,
      );
    }

    if (quoteToTweetId) {
      // quote tweet is considered repost so its count increase
      queryClient.setQueryData<Tweet>(tweetKeys.entity(quoteToTweetId), (old) => {
        if (!old) return old;
        const clone = JSON.parse(JSON.stringify(old)) as Tweet;
        clone.retweetCount = clone.retweetCount + 1;
        return clone;
      });

      prependTweetToInfiniteLists(queryClient, [tweetKeys.quoteList(quoteToTweetId)], tweet);
    }
  }

  return { postTweet: updateTweetCache };
}
