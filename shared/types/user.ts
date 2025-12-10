import type { ContentEntities } from './entity';

export type UserRelationship = {
  blocking?: boolean;
  blockedBy?: boolean;
  muted?: boolean;
  following?: boolean;
  follower?: boolean;
};

export type MutualUser = {
  displayName: string;
  avatarUrl: string;
};

export type CompactUser = MutualUser & {
  username: string;
  bio: string | null;
  bioEntities: ContentEntities | null;
  relationship: UserRelationship;
};

export type User = CompactUser & {
  bannerUrl: string;
  location: string;
  websiteUrl: string;
  birthDate: string;
  joinedAt: string; // ISO date string
  followingCount: number;
  followersCount: number;
  mutualsCount?: number;
  mutualUsers?: MutualUser[];
  email?: string;
  phone?: string;
  languageCode?: string;
};

export type SearchedUser = {
  username: string;
  displayName: string;
  avatarUrl: string;
  isFollowing: boolean;
  isFollower: boolean;
};
