export const tweetKeys = {
  all: ['tweets'] as const,

  entity: (id: string) => ['tweet', id] as const, // canonical Tweet

  detail: (id: string) => ['tweet', 'detail', id] as const, // ['tweets','detail',id]

  reposter: (tweetId: string) => ['tweet', 'reposter', tweetId] as const, // tweet reposter

  timeline: (tab: string) => [...tweetKeys.all, 'timeline', tab] as const, // ['tweets','timeline',tab]

  search: (query: string, tab: string, filter: string) =>
    [...tweetKeys.all, 'search', query, tab, filter] as const, // ['tweets','search',query,tab,filter]

  replyList: (tweetId: string) => [...tweetKeys.all, 'replies', tweetId] as const, // ['tweets','replies',tweetId]

  profileTab: (username: string, tab: 'tweets' | 'replies' | 'likes' | 'media') =>
    [...tweetKeys.all, 'profile', username, tab] as const, // ['tweets','profile',username,tab]
};

export const getItemKey = (item: TweetListItem | undefined, index: number) => {
  if (!item) return `loading-${index}`;
  let keyStr = `${item.id}`;
  if (item.reposterId) keyStr += `-repost-${item.reposterId}`;
  keyStr += `-index-${index}`;
  return keyStr;
};
