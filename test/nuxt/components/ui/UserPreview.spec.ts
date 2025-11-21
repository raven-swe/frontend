import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UserPreview from '~/components/ui/UserPreview.vue';
import type { User } from '#shared/types/user';

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

describe('UserPreview.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render user preview card', async () => {
    const user = createTestUser();

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.find('div').exists()).toBe(true);
  });

  it('should render user avatar', async () => {
    const user = createTestUser();

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          UiUserMetadata: true,
          Avatar: { template: '<div class="avatar-stub">Avatar</div>' },
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.find('.avatar-stub').exists()).toBe(true);
  });

  it('should render user display name', async () => {
    const user = createTestUser({
      displayName: 'John Doe',
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.text()).toContain('John Doe');
  });

  it('should render user username with @ symbol', async () => {
    const user = createTestUser({
      username: 'johndoe',
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.text()).toContain('@johndoe');
  });

  it('should render user bio', async () => {
    const user = createTestUser({
      bio: 'This is my bio',
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.text()).toContain('This is my bio');
  });

  it('should truncate bio if longer than 100 characters', async () => {
    const user = createTestUser({
      bio: 'a'.repeat(150),
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.text()).toContain('...');
  });

  it('should not truncate bio if 100 characters or less', async () => {
    const user = createTestUser({
      bio: 'a'.repeat(100),
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.text()).toContain(user.bio);
    expect(!component.text().includes('...')).toBeTruthy();
  });

  it('should not render bio section if bio is empty', async () => {
    const user = createTestUser({
      bio: '',
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    const bioElements = component.findAll('p');
    expect(bioElements.length).toBe(0);
  });

  it('should render follow button when not following', async () => {
    const user = createTestUser({
      relationship: {
        following: false,
        blockedBy: false,
        blocking: false,
        muted: false,
        follower: false,
      },
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.text()).toContain('Follow');
  });

  it('should render unfollow button when following', async () => {
    const user = createTestUser({
      relationship: {
        following: true,
        blockedBy: false,
        blocking: false,
        muted: false,
        follower: false,
      },
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.text()).toContain('Following');
  });

  it('should emit follow event when follow button is clicked', async () => {
    const user = createTestUser({
      relationship: {
        following: false,
        blockedBy: false,
        blocking: false,
        muted: false,
        follower: false,
      },
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
        },
      },
    });

    const button = component.find('button[data-test="follow-button"]');
    await button.trigger('click');
    expect(component.emitted('follow')).toBeTruthy();
    expect(component.emitted('follow')?.[0]).toEqual(['testuser']);
  });

  it('should emit unfollow event when unfollow button is clicked', async () => {
    const user = createTestUser({
      relationship: {
        following: true,
        blockedBy: false,
        blocking: false,
        muted: false,
        follower: false,
      },
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
        },
      },
    });

    const button = component.find('button[data-test="unfollow-button"]');
    await button.trigger('click');
    expect(component.emitted('unfollow')).toBeTruthy();
    expect(component.emitted('unfollow')?.[0]).toEqual(['testuser']);
  });

  it('should not show hover card in onboarding mode', async () => {
    const user = createTestUser();

    const component = await mountSuspended(UserPreview, {
      props: {
        user,
        isOnboarding: true,
      },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: {
            template: '<div class="hover-card"><slot /></div>',
          },
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    const hoverCards = component.findAll('.hover-card');
    expect(hoverCards.length).toBe(0);
  });

  it('should show hover card in normal mode', async () => {
    const user = createTestUser();

    const component = await mountSuspended(UserPreview, {
      props: {
        user,
        isOnboarding: false,
      },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: {
            template: '<div class="hover-card"><slot /></div>',
          },
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    const hoverCards = component.findAll('.hover-card');
    expect(hoverCards.length).toBeGreaterThan(0);
  });

  it('should handle card click in onboarding mode', async () => {
    const user = createTestUser();
    user.relationship.following = false;

    const component = await mountSuspended(UserPreview, {
      props: {
        user,
        isOnboarding: true,
      },
      global: {
        stubs: {
          NuxtLink: true,
          UiHoverCard: true,
          UiHoverCardTrigger: true,
          UiHoverCardContent: true,
          UiUserMetadata: true,
          Avatar: true,
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        },
      },
    });

    const mainDiv = component.find('div');
    await mainDiv.trigger('click');
    expect(component.emitted('follow')).toBeTruthy();
  });

  it('should show profile links to user profile', async () => {
    const user = createTestUser({
      username: 'testuser123',
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    const links = component.findAll('a![data-slot="hover-card-trigger"]');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      if (link.attributes('href')) {
        expect(link.attributes('href')).toBe('/users/testuser123');
      }
    });
  });

  it('should pass user metadata to UserMetadata component', async () => {
    const user = createTestUser({
      displayName: 'Jane Smith',
    });

    const component = await mountSuspended(UserPreview, {
      props: { user },
      global: {
        stubs: {
          UiUserMetadata: {
            template: '<div class="user-metadata">{{ user.displayName }}</div>',
            props: ['user'],
          },
          Avatar: true,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(component.text()).toContain('Jane Smith');
  });
});
