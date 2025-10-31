import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      username: 'Jackeline.Bailey',
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
      birthDate: '2004-05-07',
      joinedAt: '2020-03-15T10:30:00Z',
      email: 'https://github.com/',
      phone: '+1234567890',
      followingCount: 0,
      followersCount: 0,
      mutualsCount: 0,
      mutualNames: [],
      languageCode: 'en',
    } as User,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    memberSince: (state) => (state.user ? new Date(state.user.joinedAt).getFullYear() : null),
    isProfileSetup: (state) => !!(state.user && state.user.avatarUrl),
  },

  actions: {
    async fetchUserProfile(username?: string) {
      this.loading = true;
      this.error = null;
      const userToFetch = username || this.user.username;

      if (!userToFetch) {
        this.error = 'No username provided';
        this.loading = false;
        return;
      }

      try {
        const data = await $fetch<User>(`/api/users/${userToFetch}/profile`);

        if (data) {
          this.updateUser(data);
          // console.log('Updated user in store:', this.user);
        } else {
          this.error = 'No user data received';
        }
      } catch {
        // console.error('Error fetching user profile:', error);
        this.error = 'Failed to fetch user profile';
      } finally {
        this.loading = false;
      }
    },

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
        birthDate: '2004-05-07',
        joinedAt: '2020-03-15T10:30:00Z',
        email: 'https://github.com/',
        phone: '+1234567890',
        followingCount: 0,
        followersCount: 0,
        mutualsCount: 0,
        mutualNames: [],
        languageCode: 'en',
      } as User;
    },
  },
});
