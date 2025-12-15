export type NotificationType = 'RETWEET' | 'LIKE' | 'FOLLOW' | 'REPLY' | 'QUOTE' | 'MENTION';

export type ActorSummary = {
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type ActorSummaryContainer = {
  previewActors?: ActorSummary[];
  totalCount?: number;
};

export type Notification = {
  id: string;
  type: NotificationType | string;
  latestEventAt?: string;
  actorSummary?: ActorSummaryContainer | null;
  isSeen?: boolean;
  tweetSummary?: {
    primaryTweet?: Record<string, unknown> | null;
  } | null;
};
