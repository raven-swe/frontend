import { defineStore } from 'pinia';
import type { User } from '~~/shared/types/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      username: '',
      displayName: '',
      bio: ``,
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
      email: '',
      phone: '',
      followingCount: 0,
      followersCount: 0,
      mutualsCount: 0,
      mutualNames: [],
      languageCode: '',
    } as User,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    memberSince: (state) => (state.user ? new Date(state.user.joinedAt).getFullYear() : null),
    isProfileSetup: (state) =>
      state.user.avatarUrl.includes('default_avatar') && !state.user.bio ? false : true,
    isCurrentUser: (state) => {
      return (username: string): boolean => {
        return state.user?.username === username;
      };
    },
  },

  actions: {
    updateUser(userData: Partial<User>) {
      if (this.user) this.user = { ...this.user, ...userData };
    },

    setUser(userData: User) {
      this.user = userData;
    },

    logout() {
      this.user = {
        username: '',
        displayName: '',
        bio: ``,
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
        email: '',
        phone: '',
        followingCount: 0,
        followersCount: 0,
        mutualsCount: 0,
        mutualNames: [],
        languageCode: '',
      } as User;
    },
  },
});
