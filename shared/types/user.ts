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
  coverImg: string;
  profileImg: string;
  name: string;
  username: string;
  bio: string;
  joinAt: string;
  following: number;
  followers: number;
}
