export type MentionEntity = {
  username: string;
  startPosition: number;
};

export type HashtagEntity = {
  hashtag: string;
  startPosition: number;
};

export type ContentEntities = {
  mentions: MentionEntity[] | null;
  hashtags: HashtagEntity[] | null;
};

export type ParsedToken = {
  type: 'mention' | 'hashtag' | 'link' | 'text';
  value: string;
  display?: string;
};
