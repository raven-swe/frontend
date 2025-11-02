export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  birthDate?: string;
}

export interface UserData {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  location: string;
  websiteUrl: string;
  birthDate: string;
  joinedAt: string;
  email: string;
  phone: string;
  languageCode: string;
}

export type MediaType = 'image' | 'video' | 'gif';

export type MediaItem = {
  id: string;
  file: File;
  url: string;
  type: MediaType;
};
