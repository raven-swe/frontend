export type User = {
  username: string;
  displayName: string;
  bio: string | null;
  bioEntities: {
    mentions: {
      username: string;
      startPosition: number;
    }[];
    hashtags: {
      hashtag: string;
      startPosition: number;
    }[];
  };
  avatarUrl: string;
  bannerUrl: string;
  location: string;
  websiteUrl: string;
  birthDate: string;
  joinedAt: string; // ISO date string
  email: string;
  phone: string;
  languageCode: string;
};
export interface UserProfile {
  username: string;
  displayName: string;
  bio: string | null;
  bioEntities: {
    mentions: {
      username: string;
      startPosition: number;
    }[];
    hashtags: {
      hashtag: string;
      startPosition: number;
    }[];
  };
  avatarUrl: string;
  bannerUrl: string;
  location: string;
  websiteUrl: string;
  birthDate: string;
  joinedAt: string;
  followingCount: number;
  followersCount: number;
  mutualsCount: number;
  mutualNames: string[];
}
