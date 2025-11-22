import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { computed, nextTick, ref } from 'vue';
import type { User } from '~~/shared/types/user';
import { flushPromises } from '@vue/test-utils';

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

describe('ProfileAvatarSection Component', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the container with correct layout classes', async () => {
    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const container = wrapper.find('.mx-4.flex.flex-wrap');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('justify-between');
    expect(container.classes()).toContain('gap-4');
  });

  it('has correct profile image source', async () => {
    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const profileImage = wrapper.find('img');
    expect(profileImage.exists()).toBe(true);
    expect(profileImage.attributes('src')).toContain('avatar.jpg');
    expect(profileImage.attributes('alt')).toBe('Profile picture');
    expect(profileImage.attributes('loading')).toBe('eager');

    const classes = profileImage.classes();
    expect(classes).toContain('rounded-full');
    expect(classes).toContain('border-4');
    expect(classes).toContain('object-cover');
    expect(classes).toContain('z-20');
    expect(classes).toContain('-mt-16');
    expect(classes).toContain('size-34');
  });

  it('does not show setup or edit buttons when not current user', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const setupProfileButton = wrapper.find('button[data-test="setup-profile-button"]');
    expect(setupProfileButton.exists()).toBe(false);

    const editProfileButton = wrapper.find('button[data-test="edit-profile-button"]');
    expect(editProfileButton.exists()).toBe(false);
  });

  it('shows setup profile button when current user and profile not setup', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => true) })),
    }));

    vi.doMock('@/stores/user', () => ({
      useUserStore: vi.fn(() => ({
        isProfileSetup: false,
      })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const setupButton = wrapper.find('button[data-test="setup-profile-button"]');
    expect(setupButton.exists()).toBe(true);

    const link = wrapper.find('a[href="/setup/profile"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('Set up profile');
  });

  it('shows edit profile button when current user and profile is setup', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => true) })),
    }));

    vi.doMock('@/stores/user', () => ({
      useUserStore: vi.fn(() => ({
        isProfileSetup: true,
      })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);

    const link = wrapper.find('a[href="/settings/profile"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('Edit Profile');
  });

  it("block and mute buttons aren't shown for current user", async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => true) })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const blockButton = wrapper.find('[data-test="block-button"]');
    expect(blockButton.exists()).toBe(false);

    const muteButton = wrapper.find('[data-test="mute-button"]');
    expect(muteButton.exists()).toBe(false);
  });

  it("follow/unfollow buttons aren't shown for current user", async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => true) })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const followButton = wrapper.find('[data-test="follow-button"]');
    expect(followButton.exists()).toBe(false);

    const unfollowButton = wrapper.find('[data-test="unfollow-button"]');
    expect(unfollowButton.exists()).toBe(false);
  });

  it('shows follow buttons for unfollowing user', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const followButton = wrapper.find('[data-test="follow-button"]');
    expect(followButton.exists()).toBe(true);
  });

  it('shows unfollow buttons for following user', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const followedUser: User = {
      ...mockUser,
      relationship: {
        ...mockUser.relationship,
        following: true,
      },
    };

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => followedUser),
        },
      },
    });

    const unfollowButton = wrapper.find('[data-test="unfollow-button"]');
    expect(unfollowButton.exists()).toBe(true);
  });

  it('mute and block buttons are shown for other users', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await flushPromises();

    const blockButton = document.querySelector('[data-test="block-button"]');
    expect(blockButton).not.toBeNull();

    const muteButton = document.querySelector('[data-test="mute-button"]');
    expect(muteButton).not.toBeNull();
    wrapper.unmount();
  });

  it('mute a user if unmuted and clicked mute buton', async () => {
    const user = ref<User>({
      ...mockUser,
      relationship: {
        ...mockUser.relationship,
        muted: false,
      },
    });

    const muteUserMock = vi.fn();
    const unmuteUserMock = vi.fn();

    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: ({
        mutationFn,
        optimisticUpdateFn,
      }: {
        mutationFn: (action: 'mute' | 'unmute') => void;
        optimisticUpdateFn: (data: User, action: 'mute' | 'unmute') => void;
      }) => ({
        mutate: (action: 'mute' | 'unmute') => {
          optimisticUpdateFn(user.value, action);
          return mutationFn(action);
        },
      }),
    }));

    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    vi.doMock('~/services/profile/profileInteractionService', () => ({
      profileInteractionService: {
        muteUser: muteUserMock,
        unmuteUser: unmuteUserMock,
        blockUser: vi.fn(),
        unblockUser: vi.fn(),
      },
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': user,
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await nextTick();

    const muteButton = document.querySelector('[data-test="mute-button"]') as HTMLElement;
    expect(muteButton).not.toBeNull();

    await muteButton.click();
    await nextTick();
    expect(muteUserMock).toHaveBeenCalledWith('testuser');
    expect(unmuteUserMock).not.toHaveBeenCalled();
    expect(user.value.relationship.muted).toBe(true);
  });

  it('unmute a user if muted and clicked unmute buton', async () => {
    const user = ref<User>({
      ...mockUser,
      relationship: {
        ...mockUser.relationship,
        muted: true,
      },
    });

    const muteUserMock = vi.fn();
    const unmuteUserMock = vi.fn();

    vi.doMock('~/services/profile/profileInteractionService', () => ({
      profileInteractionService: {
        muteUser: muteUserMock,
        unmuteUser: unmuteUserMock,
        blockUser: vi.fn(),
        unblockUser: vi.fn(),
      },
    }));

    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: ({
        mutationFn,
        optimisticUpdateFn,
      }: {
        mutationFn: (action: 'mute' | 'unmute') => void;
        optimisticUpdateFn: (data: User, action: 'mute' | 'unmute') => void;
      }) => ({
        mutate: (action: 'mute' | 'unmute') => {
          optimisticUpdateFn(user.value, action);
          return mutationFn(action);
        },
      }),
    }));

    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': user,
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await nextTick();

    const muteButton = document.querySelector('[data-test="mute-button"]') as HTMLElement;
    expect(muteButton).not.toBeNull();

    await muteButton.click();
    await nextTick();
    expect(unmuteUserMock).toHaveBeenCalledWith('testuser');
    expect(muteUserMock).not.toHaveBeenCalled();
    expect(user.value.relationship.muted).toBe(false);
  });

  it('block a user if unblocked and clicked block buton', async () => {
    const user = ref<User>({
      ...mockUser,
      relationship: {
        ...mockUser.relationship,
        blocking: false,
      },
    });

    const blockUserMock = vi.fn();
    const unblockUserMock = vi.fn();

    vi.doMock('~/services/profile/profileInteractionService', () => ({
      profileInteractionService: {
        muteUser: vi.fn(),
        unmuteUser: vi.fn(),
        blockUser: blockUserMock,
        unblockUser: unblockUserMock,
      },
    }));

    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: ({
        mutationFn,
        optimisticUpdateFn,
      }: {
        mutationFn: (action: 'block' | 'unblock') => void;
        optimisticUpdateFn: (data: User, action: 'block' | 'unblock') => void;
      }) => ({
        mutate: (action: 'block' | 'unblock') => {
          optimisticUpdateFn(user.value, action);
          return mutationFn(action);
        },
      }),
    }));

    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': user,
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await nextTick();

    const blockButton = document.querySelector('[data-test="block-button"]') as HTMLElement;
    expect(blockButton).not.toBeNull();

    await blockButton.click();
    await nextTick();
    expect(blockUserMock).toHaveBeenCalledWith('testuser');
    expect(unblockUserMock).not.toHaveBeenCalled();
    expect(user.value.relationship.blocking).toBe(true);
  });

  it('unblock a user if blocked and clicked unblock buton', async () => {
    const user = ref<User>({
      ...mockUser,
      relationship: {
        ...mockUser.relationship,
        blocking: true,
      },
    });

    const blockUserMock = vi.fn();
    const unblockUserMock = vi.fn();

    vi.doMock('~/services/profile/profileInteractionService', () => ({
      profileInteractionService: {
        muteUser: vi.fn(),
        unmuteUser: vi.fn(),
        blockUser: blockUserMock,
        unblockUser: unblockUserMock,
      },
    }));

    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: ({
        mutationFn,
        optimisticUpdateFn,
      }: {
        mutationFn: (action: 'block' | 'unblock') => void;
        optimisticUpdateFn: (data: User, action: 'block' | 'unblock') => void;
      }) => ({
        mutate: (action: 'block' | 'unblock') => {
          optimisticUpdateFn(user.value, action);
          return mutationFn(action);
        },
      }),
    }));

    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const { default: ProfileAvatarSection } = await import(
      '@/components/profile/ProfileAvatarSection.vue'
    );

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': user,
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await nextTick();

    const blockButton = document.querySelector('[data-test="block-button"]') as HTMLElement;
    expect(blockButton).not.toBeNull();

    await blockButton.click();
    await nextTick();
    expect(unblockUserMock).toHaveBeenCalledWith('testuser');
    expect(user.value.relationship.blocking).toBe(false);
  });
});
