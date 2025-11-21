type TweetAuthor = {
  username: string;
  displayName: string;
  avatarUrl: string;
  isFollowing: boolean;
  isFollower: boolean;
};

type TweetMention = {
  username: string;
  startPosition: number;
};
type TweetHashtag = {
  hashtag: string;
  startPosition: number;
};

export type TweetMedia = {
  id?: string;
  type: 'IMAGE' | 'VIDEO' | 'GIF';
  url: string;
  altText: string;
  width: number;
  height: number;
};

type TweetEntity = {
  mentions: TweetMention[];
  hashtags: TweetHashtag[];
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
  entities: TweetEntity;
  media: TweetMedia[];
  isReplyToTweetId?: string | null;
  quotedTweetId?: string;
  quotedTweet?: Tweet;
};

export type CreateTweetRequest = {
  content: string;
  media?: string[];
  isReplyToTweetId?: string | null;
  quotedTweetId?: string | null;
};
