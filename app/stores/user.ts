import { defineStore } from 'pinia';
import type { User } from '~~/shared/types/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),

  getters: {
    isProfileSetup: (state) =>
      state.user?.avatarUrl.includes('default_avatar') && !state.user?.bio ? false : true,
  },

  actions: {
    updateUser(userData: Partial<User>) {
      if (this.user) this.user = { ...this.user, ...userData };
    },

    setUser(userData: User) {
      this.user = userData;
    },

    logout() {
      this.user = null;
    },
  },
});
