import type { ContentEntities } from './entity';

export type UserRelationship = {
  blocking?: boolean;
  blockedBy?: boolean;
  muted?: boolean;
  following?: boolean;
  follower?: boolean;
};

export type CompactUser = {
  username: string;
  displayName: string;
  bio: string | null;
  bioEntities: ContentEntities | null;
  avatarUrl: string;
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
  mutualNames?: string[];
  email?: string;
  phone?: string;
  languageCode?: string;
};
