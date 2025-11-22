import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import type { User } from '~~/shared/types/user';
import { ref } from 'vue';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

describe('FollowToggleButton', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });
  it('renders follow button when not following', async () => {
    const { default: FollowToggleButton } = await import(
      '@/components/profile-actions/FollowToggleButton.vue'
    );
    const wrapper = await mountSuspended(FollowToggleButton, {
      props: {
        following: false,
        follower: false,
        username: 'testuser',
      },
      global: { plugins: [i18n] },
    });

    const button = wrapper.find('[data-test="follow-button"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Follow');
  });
  it('renders follow back button when not following but is a follower', async () => {
    const { default: FollowToggleButton } = await import(
      '@/components/profile-actions/FollowToggleButton.vue'
    );
    const wrapper = await mountSuspended(FollowToggleButton, {
      props: {
        following: false,
        follower: true,
        username: 'testuser',
      },
      global: { plugins: [i18n] },
    });

    const button = wrapper.find('[data-test="follow-button"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Follow back');
  });

  it('renders unfollow button when following and show hover state', async () => {
    const { default: FollowToggleButton } = await import(
      '@/components/profile-actions/FollowToggleButton.vue'
    );
    const wrapper = await mountSuspended(FollowToggleButton, {
      props: {
        following: true,
        follower: false,
        username: 'testuser',
      },
      global: { plugins: [i18n] },
    });

    const button = wrapper.find('[data-test="unfollow-button"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Following');
    await button.trigger('mouseenter');
    expect(button.text()).toBe('Unfollow');
    await button.trigger('mouseleave');
    expect(button.text()).toBe('Following');
  });

  it('calls followUser with correct action on button click', async () => {
    const followUserMock = vi.fn();
    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: () => ({
        mutate: followUserMock,
      }),
    }));

    const { default: FollowToggleButton } = await import(
      '@/components/profile-actions/FollowToggleButton.vue'
    );
    const wrapper = await mountSuspended(FollowToggleButton, {
      props: {
        following: false,
        follower: false,
        username: 'testuser',
      },
      global: { plugins: [i18n] },
    });
    const button = wrapper.find('[data-test="follow-button"]');
    await button.trigger('click');
    expect(followUserMock).toHaveBeenCalledWith('follow');
  });

  it('calls followUser with correct action on unfollow button click', async () => {
    const followUserMock = vi.fn();
    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: () => ({
        mutate: followUserMock,
      }),
    }));

    const { default: FollowToggleButton } = await import(
      '@/components/profile-actions/FollowToggleButton.vue'
    );
    const wrapper = await mountSuspended(FollowToggleButton, {
      props: {
        following: true,
        follower: false,
        username: 'testuser',
      },
      global: { plugins: [i18n] },
    });
    const button = wrapper.find('[data-test="unfollow-button"]');
    await button.trigger('click');
    expect(followUserMock).toHaveBeenCalledWith('unfollow');
  });

  it('optimistically updates user data on follow/unfollow', async () => {
    const userData = ref<User>({
      username: 'testuser',
      displayName: 'Test User',
      bio: 'This is a test user.',
      avatarUrl: '',
      bannerUrl: '',
      location: '',
      bioEntities: {
        mentions: [],
        hashtags: [],
      },
      birthDate: '1990-01-01',
      joinedAt: '2020-01-01T00:00:00Z',
      email: '',
      phone: '',
      languageCode: 'en',
      websiteUrl: '',
      followersCount: 100,
      followingCount: 50,
      relationship: {
        blocking: false,
        blockedBy: false,
        muted: false,
        following: false,
        follower: false,
      },
    });
    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: ({
        optimisticUpdateFn,
      }: {
        optimisticUpdateFn: (data: User, action: 'follow' | 'unfollow') => void;
      }) => ({
        mutate: (action: 'follow' | 'unfollow') => {
          optimisticUpdateFn(userData.value, action);
        },
      }),
    }));

    const { default: FollowToggleButton } = await import(
      '@/components/profile-actions/FollowToggleButton.vue'
    );
    const wrapper = await mountSuspended(FollowToggleButton, {
      props: {
        following: false,
        follower: false,
        username: 'testuser',
      },
      global: { plugins: [i18n] },
    });
    const button = wrapper.find('[data-test="follow-button"]');
    // Simulate follow action
    await button.trigger('click');

    expect(userData.value.relationship.following).toBe(true);
    expect(userData.value.followersCount).toBe(101);
    // Simulate unfollow action
    await wrapper.setProps({ following: true });
    const unfollowButton = wrapper.find('[data-test="unfollow-button"]');
    await unfollowButton.trigger('click');

    expect(userData.value.relationship.following).toBe(false);
    expect(userData.value.followersCount).toBe(100);
  });

  it('correctly call follow/unfollow endpoints', async () => {
    const followUserServiceMock = vi.fn();
    const unfollowUserServiceMock = vi.fn();
    vi.doMock('~/services/profile/profileInteractionService', () => ({
      profileInteractionService: {
        followUser: followUserServiceMock,
        unfollowUser: unfollowUserServiceMock,
      },
    }));

    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: ({
        mutationFn,
      }: {
        mutationFn: (action: 'follow' | 'unfollow') => void;
      }) => ({
        mutate: (action: 'follow' | 'unfollow') => {
          return mutationFn(action);
        },
      }),
    }));

    const { default: FollowToggleButton } = await import(
      '@/components/profile-actions/FollowToggleButton.vue'
    );
    const wrapper = await mountSuspended(FollowToggleButton, {
      props: {
        following: false,
        follower: false,
        username: 'testuser',
      },
      global: { plugins: [i18n] },
    });
    const button = wrapper.find('[data-test="follow-button"]');
    await button.trigger('click');
    expect(followUserServiceMock).toHaveBeenCalledWith('testuser');

    await wrapper.setProps({ following: true });
    const unfollowButton = wrapper.find('[data-test="unfollow-button"]');
    await unfollowButton.trigger('click');
    expect(unfollowUserServiceMock).toHaveBeenCalledWith('testuser');
  });
});
