import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import type { User } from '#shared/types/user';
import { computed } from 'vue';
import type { Tweet } from '#shared/types/tweets';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';

// Mock the profileTabsService.getProfile used by the profile layout
const profileTabsServiceMock = vi.hoisted(() => ({
  getProfile: vi.fn(),
}));

vi.mock('~/services/profile/profileTabsService', async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    profileTabsService: {
      ...actual.profileTabsService,
      getProfile: profileTabsServiceMock.getProfile,
    },
  };
});

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

describe('likes page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.resetAllMocks();
    queryClient = new QueryClient();
    queryClient.clear();
    profileTabsServiceMock.getProfile.mockResolvedValue(mockUser);
  });

  it('renders empty state when no tweets are available', async () => {
    registerEndpoint(`/api/users/${mockUser.username}/likes`, () => ({
      data: [],
    }));
    const { default: ProfilePage } = await import('~/pages/profile/[username]/likes.vue');
    const i18n = createI18n({ locale: 'en', messages: { en: messages } });
    const wrapper = await mountSuspended(ProfilePage, {
      route: {
        params: { username: mockUser.username },
      },
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        stubs: {
          TweetDefaultCard: true,
          NuxtLayout: { template: '<div><slot /></div>' },
          Tabs: true,
          Tab: true,
          UiSpinner: true,
          ClientOnly: { template: '<slot />' },
        },
        plugins: [[VueQueryPlugin, { queryClient }], i18n],
      },
    });

    await flushPromises();

    const heading = wrapper.find('h1');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('Tweet not found');
  });

  it('renders TweetDefaultCard components when tweets exist', async () => {
    const mockTweets: Tweet[] = [
      {
        id: 'tweet-1',
        content: 'First tweet',
        createdAt: new Date().toISOString(),
        author: {
          username: 'testuser',
          displayName: 'Test User',
          avatarUrl: '/avatar.jpg',
          isFollowing: false,
          isFollower: false,
        },
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [],
      },
      {
        id: 'tweet-2',
        content: 'Second tweet',
        createdAt: new Date().toISOString(),
        author: {
          username: 'testuser',
          displayName: 'Test User',
          avatarUrl: '/avatar.jpg',
          isFollowing: false,
          isFollower: false,
        },
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [],
      },
    ];

    registerEndpoint(`/api/users/${mockUser.username}/likes`, () => ({
      data: mockTweets,
    }));

    const { default: ProfilePage } = await import('~/pages/profile/[username]/likes.vue');
    const i18n = createI18n({ locale: 'en', messages: { en: messages } });
    const wrapper = await mountSuspended(ProfilePage, {
      route: {
        params: { username: mockUser.username },
      },
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        stubs: {
          TweetDefaultCard: true,
          NuxtLayout: { template: '<div><slot /></div>' },
          Tabs: true,
          Tab: true,
          UiSpinner: true,
          ClientOnly: { template: '<slot />' },
        },
        plugins: [[VueQueryPlugin, { queryClient }], i18n],
      },
    });

    await flushPromises();

    const tweetCards = wrapper.findAllComponents({ name: 'TweetDefaultCard' });
    expect(tweetCards.length).toBe(2);

    const heading = wrapper.find('h1');
    expect(heading.exists()).toBe(false);
  });
});
