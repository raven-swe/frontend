export interface UpdateProfileRequest {
  displayName?: string | null;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  birthDate?: string | null;
}

export interface UserData {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  birthDate: string | null;
  joinedAt: string | null;
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
