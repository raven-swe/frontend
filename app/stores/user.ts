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
      displayName: '',
      bio: null,
      bioEntities: {
        mentions: [],
        hashtags: [],
      },
      avatarUrl: '',
      bannerUrl: '',
      location: '',
      websiteUrl: '',
      birthDate: '',
      joinedAt: '',
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
