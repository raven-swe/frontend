// composables/tweet/updateTweetLists.ts
import type { InfiniteData, QueryClient } from '@tanstack/vue-query';
import type { Tweet, TweetListItem } from '~~/shared/types/tweets';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { tweetKeys } from '~/constants/query-keys';

type ListKey = readonly unknown[];

function prependToOneList(
  queryClient: QueryClient,
  listKey: ListKey,
  tweet: Tweet,
  reposterId: string | null,
) {
  queryClient.setQueryData<InfiniteData<ApiSuccessResponse<TweetListItem[]>>>(listKey, (old) => {
    if (!old) return old;

    const [firstPage, ...restPages] = old.pages;
    if (!firstPage) return old;

    const newItem: TweetListItem = { id: tweet.id, reposterId };

    const updatedFirstPage: ApiSuccessResponse<TweetListItem[]> = {
      ...firstPage,
      data: [newItem, ...firstPage.data],
    };

    return {
      ...old,
      pages: [updatedFirstPage, ...restPages],
      pageParams: [...old.pageParams],
    };
  });
}

export function prependTweetToInfiniteLists(
  queryClient: QueryClient,
  listKeys: ListKey[] | ListKey,
  tweet: Tweet,
  reposterId: string | null = null,
) {
  // seed canonical once
  queryClient.setQueryData(tweetKeys.entity(tweet.id), tweet);

  const keys = Array.isArray(listKeys) ? listKeys : [listKeys];
  keys.forEach((key) => prependToOneList(queryClient, key, tweet, reposterId));
}
