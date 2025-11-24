import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import messages from '@@/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import type { User } from '#shared/types/user';
import { flushPromises } from '@vue/test-utils';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

// Helper to create a test user with required fields
function createTestUser(overrides: Partial<User> = {}): User {
  return {
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
    ...overrides,
  };
}

describe('UserMetadata', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  it('renders user info: name, username, bio, following/followers counts', async () => {
    const user = createTestUser({
      username: 'johndoe',
      displayName: 'John Doe',
      bio: 'Software engineer',
      avatarUrl: 'https://example.com/avatar.jpg',
      followingCount: 100,
      followersCount: 500,
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: false,
        follower: false,
      },
    });

    const { default: UserMetadata } = await import('@/components/ui/UserMetadata.vue');
    const wrapper = await mountSuspended(UserMetadata, {
      props: { user },
      global: { plugins: [i18n] },
    });

    await flushPromises();
    const html = wrapper.html();
    expect(html).toContain('John Doe');
    expect(html).toContain('@johndoe');
    expect(html).toContain('Software engineer');
  });

  it('renders follow button when user is not followed', async () => {
    const user = createTestUser({
      username: 'janedoe',
      displayName: 'Jane Doe',
      followingCount: 50,
      followersCount: 200,
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: false,
        follower: false,
      },
    });

    const { default: UserMetadata } = await import('@/components/ui/UserMetadata.vue');
    const wrapper = await mountSuspended(UserMetadata, {
      props: { user },
      global: { plugins: [i18n] },
    });

    await flushPromises();
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Follow');
  });

  it('renders unfollow button when user is followed', async () => {
    const user = createTestUser({
      username: 'alice',
      displayName: 'Alice',
      followingCount: 75,
      followersCount: 300,
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: true,
        follower: false,
      },
    });

    const { default: UserMetadata } = await import('@/components/ui/UserMetadata.vue');
    const wrapper = await mountSuspended(UserMetadata, {
      props: { user },
      global: { plugins: [i18n] },
    });

    await flushPromises();

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Following');
  });

  it('emits follow event when follow button is clicked', async () => {
    const user = createTestUser({
      username: 'bob',
      displayName: 'Bob',
      followingCount: 10,
      followersCount: 150,
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: false,
        follower: false,
      },
    });

    const { default: UserMetadata } = await import('@/components/ui/UserMetadata.vue');
    const wrapper = await mountSuspended(UserMetadata, {
      props: { user },
      global: { plugins: [i18n] },
    });

    await flushPromises();

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(wrapper.emitted('follow')).toBeTruthy();
    expect(wrapper.emitted('follow')?.[0]).toEqual(['bob']);
  });

  it('emits unfollow event when unfollow button is clicked', async () => {
    const user = createTestUser({
      username: 'charlie',
      displayName: 'Charlie',
      bio: 'Designer',
      followingCount: 20,
      followersCount: 400,
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: true,
        follower: false,
      },
    });

    const { default: UserMetadata } = await import('@/components/ui/UserMetadata.vue');
    const wrapper = await mountSuspended(UserMetadata, {
      props: { user },
      global: { plugins: [i18n] },
    });

    await flushPromises();

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(wrapper.emitted('unfollow')).toBeTruthy();
    expect(wrapper.emitted('unfollow')?.[0]).toEqual(['charlie']);
  });

  it('shows "Following" on hover when user is followed', async () => {
    const user = createTestUser({
      username: 'dave',
      displayName: 'Dave',
      followingCount: 30,
      followersCount: 250,
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: true,
        follower: false,
      },
    });

    const { default: UserMetadata } = await import('@/components/ui/UserMetadata.vue');
    const wrapper = await mountSuspended(UserMetadata, {
      props: { user },
      global: { plugins: [i18n] },
    });

    await flushPromises();

    const button = wrapper.find('button');
    expect(button.text()).toContain('Following');

    // hover enters
    await button.trigger('mouseenter');
    expect(button.text()).toContain('Unfollow');

    // hover leaves
    await button.trigger('mouseleave');
    expect(button.text()).toContain('Following');
  });

  it('renders NuxtLink to user profile', async () => {
    const user = createTestUser({
      username: 'eve',
      displayName: 'Eve',
      followingCount: 5,
      followersCount: 100,
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: false,
        follower: false,
      },
    });

    const { default: UserMetadata } = await import('@/components/ui/UserMetadata.vue');
    const wrapper = await mountSuspended(UserMetadata, {
      props: { user },
      global: { plugins: [i18n] },
    });

    await flushPromises();

    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toContain('users/eve');
  });
});
