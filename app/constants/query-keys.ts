export const tweetKeys = {
  all: ['tweets'] as const,

  entity: (id: string) => ['tweet', id] as const, // canonical Tweet

  timeline: (tab: string) => [...tweetKeys.all, 'timeline', tab] as const, // ['tweets','timeline',tab]

  replyList: (tweetId: string) => [...tweetKeys.all, 'replies', tweetId] as const, // ['tweets','replies',tweetId]

  profileTab: (username: string, tab: 'tweets' | 'replies' | 'likes') =>
    [...tweetKeys.all, 'profile', username, tab] as const, // ['tweets','profile',username,tab]

  detail: (id: string) => [...tweetKeys.all, 'detail', id] as const, // ['tweets','detail',id]
};
