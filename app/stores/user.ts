import { defineStore } from 'pinia';

interface User {
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
      username: 'johndoe',
      displayName: 'John Doe',
      bio: `Fourth year Computer Engineering student @ Cairo university\nI'm only here when the reels get boring on ig`,
      avatarUrl: 'https://i.ibb.co/qMcSYBfk/image.jpg',
      bannerUrl: 'https://i.ibb.co/Z1Yx04kS/dfghj.webp',
      location: 'San Francisco, CA',
      websiteUrl: 'https://johndoe.dev',
      birthDate: '2004-05-07',
      joinedAt: '2020-03-15T10:30:00Z',
      email: 'https://github.com/',
      phone: '+1234567890',
    } as User,
  }),

  getters: {
    memberSince: (state) => new Date(state.user.joinedAt).getFullYear(),
  },

  actions: {
    updateUser(userData: Partial<User>) {
      this.user = { ...this.user, ...userData };
    },

    setUser(userData: User) {
      this.user = userData;
    },

    logout() {
      // Reset to default/empty state if needed
    },
  },
});
