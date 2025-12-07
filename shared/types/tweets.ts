import type { ContentEntities } from './entity';

type TweetAuthor = {
  username: string;
  displayName: string;
  avatarUrl: string;
  isFollowing: boolean;
  isFollower?: boolean;
  isBlocked?: boolean;
};

export type TweetMedia = {
  id?: string;
  type: 'IMAGE' | 'VIDEO' | 'GIF';
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Tweet = {
  id: string;
  content: string;
  createdAt: string;
  author: TweetAuthor;
  replyCount: number;
  retweetCount: number;
  likeCount: number;
  isLiked: boolean;
  isRetweeted: boolean;
  entities: ContentEntities;
  media: TweetMedia[];
  replyToTweetId?: string | null;
  quoteToTweetId?: string;
  quotedTweet?: Tweet;
};

export type CreateTweetRequest = {
  content: string;
  media?: string[];
  replyToTweetId?: string | null;
  quoteToTweetId?: string | null;
};
