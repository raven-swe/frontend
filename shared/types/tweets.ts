import type { ContentEntities } from './entity';

export type TweetAuthor = {
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

export type DeletedTweet = {
  isDeleted: true;
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
  entities?: ContentEntities | null;
  media: TweetMedia[];
  replyToTweetId?: string | null;
  repostedBy?: {
    displayName: string;
    username: string;
    id?: string;
  };
  quoteToTweetId?: string | null;
  quotedTweet?: Tweet | DeletedTweet | null;
  replyToTweet?: Tweet | null; // search only
};

export type TweetWithParents = Tweet & {
  rootTweet?: Tweet | DeletedTweet | null;
  parentTweets?: (Tweet | DeletedTweet)[] | null;
  hasMoreParents?: boolean;
};

export type CreateTweetRequest = {
  content: string;
  media?: string[];
  replyToTweetId?: string | null;
  quoteToTweetId?: string | null;
};
