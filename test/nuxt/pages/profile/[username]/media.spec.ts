import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import type { User } from '#shared/types/user';
import { computed } from 'vue';
import type { Tweet } from '#shared/types/tweets';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

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

const userStoreMock = vi.hoisted(() => {
  return {
    user: {
      username: 'notcurrentuser',
    },
  };
});

mockNuxtImport('useUserStore', () => {
  return () => userStoreMock;
});

describe('media page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.resetAllMocks();
    queryClient = new QueryClient();
    queryClient.clear();
  });

  it('renders empty state when no tweets are available', async () => {
    registerEndpoint(`/api/users/${mockUser.username}/media`, () => ({
      data: [],
    }));
    const { default: ProfilePage } = await import('~/pages/profile/[username]/media.vue');
    const wrapper = await mountSuspended(ProfilePage, {
      route: {
        params: { username: mockUser.username },
      },
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        stubs: {
          Thumbnail: true,
        },
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    const heading = wrapper.find('h2');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe("@testuser hasn't posted media");
    const description = wrapper.find('[data-test="empty-description"]');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe('Once they do, those posts will show up here.');
  });

  it('renders differnt text when same user no tweets are available', async () => {
    userStoreMock.user.username = mockUser.username;
    registerEndpoint(`/api/users/${mockUser.username}/media`, () => ({
      data: [],
    }));
    const { default: ProfilePage } = await import('~/pages/profile/[username]/media.vue');
    const wrapper = await mountSuspended(ProfilePage, {
      route: {
        params: { username: mockUser.username },
      },
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        stubs: {
          Thumbnail: true,
        },
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    const heading = wrapper.find('h2');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('Lights, camera … attachments!');
    const description = wrapper.find('[data-test="empty-description"]');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe('When you post photos or videos, they will show up here.');
  });

  it('renders Thumbnail components when tweets exist', async () => {
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
        media: [
          {
            type: 'IMAGE' as const,
            url: '/media1.jpg',
            altText: 'Media 1',
            width: 800,
            height: 600,
          },
        ],
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
        media: [
          {
            type: 'IMAGE' as const,
            url: '/media2.jpg',
            altText: 'Media 2',
            width: 800,
            height: 600,
          },
        ],
      },
    ];

    registerEndpoint(`/api/users/${mockUser.username}/media`, () => ({
      data: mockTweets,
    }));

    const { default: ProfilePage } = await import('~/pages/profile/[username]/media.vue');

    const wrapper = await mountSuspended(ProfilePage, {
      route: {
        params: { username: mockUser.username },
      },
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
        stubs: { Thumbnail: true },
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    const thumbnails = wrapper.findAllComponents({ name: 'Thumbnail' });
    expect(thumbnails.length).toBe(2);

    const heading = wrapper.find('h2');
    expect(heading.exists()).toBe(false);

    const description = wrapper.find('[data-test="empty-description"]');
    expect(description.exists()).toBe(false);
  });
});
