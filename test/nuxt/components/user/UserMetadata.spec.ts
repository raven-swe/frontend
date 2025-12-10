import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import messages from '@@/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import type { User } from '#shared/types/user';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const mockUser: User = {
  username: 'testuser',
  displayName: 'Test User',
  bio: null,
  bioEntities: { mentions: [], hashtags: [] },
  avatarUrl: '',
  bannerUrl: '',
  location: '',
  websiteUrl: '',
  birthDate: '1990-01-01',
  joinedAt: '2020-01-01T00:00:00Z',
  relationship: {
    blocking: false,
    blockedBy: false,
    muted: false,
    following: false,
    follower: false,
  },
  email: 'test@example.com',
  phone: '',
  followingCount: 100,
  followersCount: 500,
  languageCode: 'en',
};

const userRef = ref<User>(mockUser);

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

const createWrapper = async () => {
  const { default: UserMetadata } = await import('~/components/user/UserMetadata.vue');
  const wrapper = await mountSuspended(UserMetadata, {
    props: { username: 'testuser' },
    global: { plugins: [i18n] },
  });
  await flushPromises();
  return wrapper;
};

describe('UserMetadata', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    userRef.value = structuredClone(mockUser);
    vi.doMock('@tanstack/vue-query', () => ({
      useQuery: () => ({
        data: userRef,
        isLoading: false,
        isError: false,
      }),
    }));
    userStoreMock.user.username = 'notcurrentuser';
  });

  it('renders user info: name, username, bio, following/followers counts', async () => {
    const wrapper = await createWrapper();

    const text = wrapper.text();
    expect(text).toContain('Test User');
    expect(text).toContain('@testuser');
    expect(text).toContain('100 Following');
    expect(text).toContain('500 Followers');
  });

  it('renders follow button when user is not followed', async () => {
    userRef.value.relationship.following = false;
    const wrapper = await createWrapper();
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Follow');
  });

  it('renders unfollow button when user is followed', async () => {
    userRef.value.relationship.following = true;
    const wrapper = await createWrapper();
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Following');
  });

  it('emits follow event when follow button is clicked', async () => {
    userRef.value.relationship.following = false;
    const wrapper = await createWrapper();

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(wrapper.emitted('follow')).toBeTruthy();
  });

  it('emits unfollow event when unfollow button is clicked', async () => {
    userRef.value.relationship.following = true;
    const wrapper = await createWrapper();

    const button = wrapper.find('button');
    await button.trigger('click');
    expect(wrapper.emitted('unfollow')).toBeTruthy();
  });

  it('emits unblock event when block button is clicked', async () => {
    userRef.value.relationship.blocking = true;
    const wrapper = await createWrapper();

    const button = wrapper.find('button');
    await button.trigger('click');
    expect(wrapper.emitted('unblock')).toBeTruthy();
  });

  it('shows "Unfollow" on hover when user is followed', async () => {
    userRef.value.relationship.following = true;
    const wrapper = await createWrapper();

    const button = wrapper.find('button');
    await button.trigger('mouseenter');
    expect(button.text()).toContain('Unfollow');

    // hover leaves
    await button.trigger('mouseleave');
    expect(button.text()).toContain('Following');
  });

  it('renders NuxtLink to user profile', async () => {
    const wrapper = await createWrapper();

    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toContain('profile/testuser');
  });

  it('renders follow you back badge when user is a follower', async () => {
    userRef.value.relationship.follower = true;
    const wrapper = await createWrapper();

    const text = wrapper.text();
    expect(text).toContain('Follows you');
  });

  it('render bio entities: mentions and hashtags', async () => {
    userRef.value.bio = 'Hello @friend, check out #VueJS and visit http://example.com';

    const mockTokens = [
      { type: 'mention', value: 'friend', display: '@friend', key: '0' },
      { type: 'text', value: ' is attending the ', key: '1' },
      { type: 'hashtag', value: 'VueJS', display: '#VueJS', key: '2' },
      { type: 'text', value: ' conference. More info at ', key: '3' },
      { type: 'link', value: 'http://example.com', display: 'example.com', key: '4' },
    ];

    vi.doMock('~/utils/contentEntityParser', () => ({
      parseContentEntities: () => {
        return mockTokens;
      },
    }));
    const wrapper = await createWrapper();

    const mentionLink = wrapper.find('a[href="/profile/friend"]');
    expect(mentionLink.exists()).toBe(true);
    expect(mentionLink.text()).toBe('@friend');

    // Find hashtag link
    const hashtagLink = wrapper.find('a[href="/search/top?q=%23VueJS"]');
    expect(hashtagLink.exists()).toBe(true);
    expect(hashtagLink.text()).toBe('#VueJS');

    // Find the attached link
    const attachedLink = wrapper.find('a[href="http://example.com"]');
    expect(attachedLink.exists()).toBe(true);
    expect(attachedLink.text()).toBe('example.com');
  });

  it('renders loading state', async () => {
    vi.doMock('@tanstack/vue-query', () => ({
      useQuery: () => ({
        data: null,
        isLoading: true,
        isError: false,
      }),
    }));
    const wrapper = await createWrapper();
    const spinner = wrapper.find('svg[aria-label="Loading"]');
    expect(spinner.exists()).toBe(true);
  });

  it("doesn't render follow/block button when viewing own profile", async () => {
    userStoreMock.user.username = 'testuser';
    const wrapper = await createWrapper();
    const button = wrapper.find('button');
    expect(button.exists()).toBe(false);
  });
});
