import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileDetails from '@/components/profile/ProfileDetails.vue';
import type { User } from '~~/shared/types/user';
import { computed } from 'vue';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';

const mockUser: User = {
  joinedAt: '2020-07-15T12:34:56Z',
  bioEntities: {
    mentions: [],
    hashtags: [],
  },
  username: 'testuser',
  email: 'testemail@gmail.com',
  avatarUrl: '/avatar.jpg',
  bannerUrl: '/banner.jpg',
  bio: 'This is a test bio',
  location: 'Test Location',
  birthDate: '1990-01-01',
  websiteUrl: 'https://testwebsite.com',
  followersCount: 0,
  followingCount: 0,
  languageCode: 'en',
  displayName: 'Test User',
  phone: '',
  mutualsCount: 0,
  relationship: {
    blocking: false,
    blockedBy: false,
    following: false,
    follower: false,
    muted: false,
  },
};

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: messages,
  },
});

describe('ProfileDetails Component', () => {
  it('renders ProfileCover component', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        plugins: [i18n],
      },
    });

    const coverImage = wrapper.find('img[alt="Profile Cover"]');
    expect(coverImage.exists()).toBe(true);
  });

  it('renders ProfileAvatarSection component', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        plugins: [i18n],
      },
    });

    expect(wrapper.find('[data-testid="profile-avatar"]').exists()).toBe(true);
  });

  it('passes correct coverImg prop to ProfileCover', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        plugins: [i18n],
      },
    });

    const coverImage = wrapper.find('img[alt="Profile Cover"]');
    expect(coverImage.attributes('src')).toContain('banner.jpg');
  });

  it('passes correct profileImg prop to ProfileAvatarSection', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        plugins: [i18n],
      },
    });

    const avatarImg = wrapper.find('[data-testid="profile-avatar"] img');

    expect(avatarImg.exists()).toBe(true);
    expect(avatarImg.attributes('src')).toContain('avatar.jpg');
  });

  it('passes correct userProfile prop to ProfileInfo', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        plugins: [i18n],
      },
    });

    const html = wrapper.html();
    expect(html).toContain(mockUser.displayName);
    expect(html).toContain(mockUser.username);
  });

  it('sends empty string if no cover url', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      global: {
        provide: {
          'user-data': computed(() => ({ ...mockUser, bannerUrl: undefined })),
        },
        plugins: [i18n],
      },
    });

    const coverImage = wrapper.find('img[alt="Profile Cover"]');
    expect(coverImage.exists()).toBe(false);
  });
});
