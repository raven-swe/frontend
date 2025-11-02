import { defineStore } from 'pinia';

export interface User {
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
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      username: 'hussein',
      displayName: 'John Doe',
      bio: `Fourth year Computer Engineering student @ Cairo university\nI'm only here when the reels get boring on ig`,
      bioEntities: {
        mentions: [],
        hashtags: [],
      },
      avatarUrl: 'https://i.ibb.co/qMcSYBfk/image.jpg',
      bannerUrl: 'https://i.ibb.co/Z1Yx04kS/dfghj.webp',
      location: 'San Francisco, CA',
      websiteUrl: 'https://johndoe.dev',
      birthDate: '2004-05-07',
      joinedAt: '2020-03-15T10:30:00Z',
      email: 'https://github.com/',
      phone: '+1234567890',
      followingCount: 0,
      followersCount: 0,
      mutualsCount: 0,
      mutualNames: [],
    } as UserProfile,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    memberSince: (state) => (state.user ? new Date(state.user.joinedAt).getFullYear() : null),
    isProfileSetup: () => true,
    isCurrentUser: (state) => {
      return (username: string): boolean => {
        return state.user?.username === username;
      };
    },
  },

  actions: {
    async fetchUserProfile(username: string) {
      this.loading = true;
      this.error = null;

      const { data, error } = await useFetch<UserProfile>(`/api/users/${username}/profile`, {
        key: `user-profile-${username}`,
      });

      if (error.value) {
        this.error = error.value.message;
      } else if (data.value) {
        this.user = data.value;
      }

      this.loading = false;
    },

    updateUser(userData: Partial<UserProfile>) {
      if (this.user) this.user = { ...this.user, ...userData };
    },

    setUser(userData: UserProfile) {
      this.user = userData;
    },

    logout() {
      // this.user = null;
    },
  },
});
