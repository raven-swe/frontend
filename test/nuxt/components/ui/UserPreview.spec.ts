import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UserPreview from '~/components/ui/UserPreview.vue';
import type { User } from '#shared/types/user';

// Helper to create a test user with required fields
function createTestUser(overrides: Partial<User> = {}): User {
  return {
    username: 'testuser',
    displayName: 'Test User',
    bio: 'bio123',
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

describe('UserPreview.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render user preview card', async () => {
    const user = createTestUser();

    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: false },
    });
    expect(component.find('div[data-test="user-preview"]').exists()).toBe(true);
    expect(component.find('[data-slot="hover-card-trigger"]').exists()).toBe(true);
    expect(component.text()).toContain('Test User');
    expect(component.text()).toContain('@testuser');
    expect(component.text()).toContain('bio123');
  });

  it('should handle onboarding state', async () => {
    const user = createTestUser();
    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: true },
    });

    expect(component.find('div[data-test="user-preview"]').exists()).toBe(true);
    expect(component.find('div[data-slot="hover-card-trigger"]').exists()).toBe(false);
    const previewDiv = component.find('div[data-test="user-preview"]');
    expect(previewDiv.classes()).toContain('cursor-pointer');
    expect(component.text()).toContain('Test User');
    expect(component.text()).toContain('@testuser');
    expect(component.text()).toContain('bio123');
  });

  it('isOnboarding on click wrapper emits follow event', async () => {
    const user = createTestUser();
    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: true },
    });

    const previewDiv = component.find('div[data-test="user-preview"]');
    expect(previewDiv.classes()).toContain('cursor-pointer');

    await previewDiv.trigger('click');
    expect(component.emitted()).toHaveProperty('follow');
    expect(component.emitted('follow')?.[0]).toEqual(['testuser']);
  });
  it('isOnboarding on click wrapper emits unfollow event', async () => {
    const user = createTestUser({
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: true,
        follower: false,
      },
    });
    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: true },
    });

    const previewDiv = component.find('div[data-test="user-preview"]');
    expect(previewDiv.classes()).toContain('cursor-pointer');

    await previewDiv.trigger('click');
    expect(component.emitted()).toHaveProperty('unfollow');
    expect(component.emitted('unfollow')?.[0]).toEqual(['testuser']);
  });

  it('not isOnboarding does not emit follow on click', async () => {
    const user = createTestUser();
    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: false },
    });
    const previewDiv = component.find('div[data-test="user-preview"]');
    await previewDiv.trigger('click');
    expect(component.emitted('follow')).toBeUndefined();
  });

  it('renders correctly with missing bio', async () => {
    const user = createTestUser({ bio: '' });
    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: false },
    });
    expect(component.find('div[data-test="user-preview"]').exists()).toBe(true);
    expect(component.find('[data-slot="hover-card-trigger"]').exists()).toBe(true);
    expect(component.text()).toContain('Test User');
    expect(component.text()).toContain('@testuser');
  });

  it('clicking on follow button emits follow event when unfollowed', async () => {
    const user = createTestUser({
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: false,
        follower: false,
      },
    });
    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: false },
    });
    const followButton = component.find('[data-test="follow-button"]');
    await followButton.trigger('click');
    expect(component.emitted()).toHaveProperty('follow');
    expect(component.emitted('follow')?.[0]).toEqual(['testuser']);

    expect(component.find('[data-test="unfollow-button"]').exists()).toBe(false);
    expect(component.emitted()).not.toHaveProperty('unfollow');
  });

  it('clicking on unfollow button emits unfollow event when followed', async () => {
    const user = createTestUser({
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: true,
        follower: false,
      },
    });
    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: false },
    });
    const unfollowButton = component.find('[data-test="unfollow-button"]');
    await unfollowButton.trigger('click');
    expect(component.emitted()).toHaveProperty('unfollow');
    expect(component.emitted('unfollow')?.[0]).toEqual(['testuser']);

    expect(component.find('[data-test="follow-button"]').exists()).toBe(false);
    expect(component.emitted()).not.toHaveProperty('follow');
  });

  it('handle hover on unfollow button', async () => {
    const user = createTestUser({
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: true,
        follower: false,
      },
    });
    const component = await mountSuspended(UserPreview, {
      props: { user, isOnboarding: false },
    });
    const unfollowButton = component.find('[data-test="unfollow-button"]');
    expect(unfollowButton.exists()).toBe(true);

    await unfollowButton.trigger('mouseenter');
    expect(unfollowButton.text()).toBe('Unfollow');
    await unfollowButton.trigger('mouseleave');
    expect(unfollowButton.text()).toBe('Following');
  });
});
