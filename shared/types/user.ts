import type { ContentEntities } from './entity';

export type User = {
  username: string;
  displayName: string;
  bio: string | null;
  bioEntities: ContentEntities;
  avatarUrl: string;
  bannerUrl: string;
  location: string;
  websiteUrl: string;
  birthDate: string;
  joinedAt: string; // ISO date string
  relationship: {
    blocking: boolean;
    blockedBy: boolean;
    muted: boolean;
    following: boolean;
    follower: boolean;
  };
  email: string;
  phone: string;
  followingCount: number;
  followersCount: number;
  mutualsCount?: number;
  mutualNames?: string[];
  languageCode: string;
};
