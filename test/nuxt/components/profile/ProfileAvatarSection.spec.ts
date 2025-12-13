import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { computed, nextTick, ref } from 'vue';
import type { User } from '~~/shared/types/user';
import { flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json' assert { type: 'json' };

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
const userRef = ref<User>(mockUser);

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: messages,
  },
});

const createWrapper = async () => {
  const { default: ProfileAvatarSection } =
    await import('@/components/profile/ProfileAvatarSection.vue');
  return await mountSuspended(ProfileAvatarSection, {
    global: {
      provide: {
        'user-data': userRef,
      },
      plugins: [i18n],
    },
  });
};

describe('ProfileAvatarSection Component', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
    userRef.value = structuredClone(mockUser);
  });

  it('renders the container with correct layout classes', async () => {
    const wrapper = await createWrapper();

    const container = wrapper.find('.mx-4.flex.flex-wrap');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('justify-between');
    expect(container.classes()).toContain('gap-4');
  });

  it('has correct profile image source', async () => {
    const wrapper = await createWrapper();

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

  it('gracefully handle missing avatar URL', async () => {
    userRef.value.avatarUrl = '';
    const wrapper = await createWrapper();

    const profileImage = wrapper.find('img');
    expect(profileImage.exists()).toBe(true);
    expect(profileImage.attributes('src')).toEqual('');
  });

  it('does not show setup or edit buttons when not current user', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const wrapper = await createWrapper();

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

    const wrapper = await createWrapper();

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

    const wrapper = await createWrapper();

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

    const wrapper = await createWrapper();

    const blockButton = wrapper.find('[data-test="block-button"]');
    expect(blockButton.exists()).toBe(false);

    const muteButton = wrapper.find('[data-test="mute-button"]');
    expect(muteButton.exists()).toBe(false);
  });

  it("follow/unfollow buttons aren't shown for current user", async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => true) })),
    }));

    const wrapper = await createWrapper();

    const followButton = wrapper.find('[data-test="follow-button"]');
    expect(followButton.exists()).toBe(false);

    const unfollowButton = wrapper.find('[data-test="unfollow-button"]');
    expect(unfollowButton.exists()).toBe(false);
  });

  it('shows follow buttons for unfollowing user', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const wrapper = await createWrapper();

    const followButton = wrapper.find('[data-test="follow-button"]');
    expect(followButton.exists()).toBe(true);
  });

  it('shows unfollow buttons for following user', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    userRef.value.relationship.following = true;

    const wrapper = await createWrapper();

    const unfollowButton = wrapper.find('[data-test="unfollow-button"]');
    expect(unfollowButton.exists()).toBe(true);
  });

  it('mute and block buttons are shown for other users', async () => {
    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));

    const wrapper = await createWrapper();

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
});

describe('ProfileActions', () => {
  const muteUserMock = vi.fn(({ action }: { action: 'mute' | 'unmute' }) => {
    if (action === 'mute') {
      userRef.value.relationship.muted = true;
    } else {
      userRef.value.relationship.muted = false;
    }
  });

  const blockUserMock = vi.fn(({ action }: { action: 'block' | 'unblock' }) => {
    if (action === 'block') {
      userRef.value.relationship.blocking = true;
    } else {
      userRef.value.relationship.blocking = false;
    }
    userRef.value.relationship.following = false;
  });

  const followUserMock = vi.fn(({ action }: { action: 'follow' | 'unfollow' }) => {
    if (action === 'follow') {
      userRef.value.relationship.following = true;
      userRef.value.followersCount += 1;
    } else {
      userRef.value.relationship.following = false;
      userRef.value.followersCount -= 1;
    }
  });

  const useMuteMutationMock = vi.fn((_username: string) => {
    return {
      mutate: muteUserMock,
    };
  });

  const useBlockMutationMock = vi.fn((_username: string) => {
    return {
      mutate: blockUserMock,
    };
  });

  const useFollowMutationMock = vi.fn((_username: string) => {
    return {
      mutate: followUserMock,
    };
  });

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    userRef.value = structuredClone(mockUser);

    vi.doMock('~/composables/useProfileMutation', () => ({
      useMuteMutation: useMuteMutationMock,
      useBlockMutation: useBlockMutationMock,
      useFollowMutation: useFollowMutationMock,
    }));

    vi.doMock('@/composables/useIsCurrentUser', () => ({
      useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
    }));
  });

  it('mute a user if unmuted and clicked mute buton', async () => {
    userRef.value.relationship.muted = false;

    const wrapper = await createWrapper();

    expect(useMuteMutationMock).toHaveBeenCalled();
    expect(useBlockMutationMock).toHaveBeenCalled();
    expect(useFollowMutationMock).toHaveBeenCalled();

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await nextTick();

    const muteButton = document.querySelector('[data-test="mute-button"]') as HTMLElement;
    expect(muteButton).not.toBeNull();

    muteButton.click();
    await nextTick();
    expect(muteUserMock).toHaveBeenCalledWith({
      action: 'mute',
      username: 'testuser',
    });
    expect(userRef.value.relationship.muted).toBe(true);
  });

  it('unmute a user if muted and clicked mute button', async () => {
    userRef.value.relationship.muted = true;

    const wrapper = await createWrapper();

    expect(useMuteMutationMock).toHaveBeenCalled();
    expect(useBlockMutationMock).toHaveBeenCalled();
    expect(useFollowMutationMock).toHaveBeenCalled();

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await nextTick();

    const muteButton = document.querySelector('[data-test="mute-button"]') as HTMLElement;
    expect(muteButton).not.toBeNull();

    await muteButton.click();
    await nextTick();
    expect(muteUserMock).toHaveBeenCalledWith({
      action: 'unmute',
      username: 'testuser',
    });
    expect(userRef.value.relationship.muted).toBe(false);
  });

  it('block a user if unblocked and clicked block button', async () => {
    userRef.value.relationship.blocking = false;
    userRef.value.relationship.following = true;

    const wrapper = await createWrapper();

    expect(useMuteMutationMock).toHaveBeenCalled();
    expect(useBlockMutationMock).toHaveBeenCalled();
    expect(useFollowMutationMock).toHaveBeenCalled();

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await nextTick();

    const blockButton = document.querySelector('[data-test="block-button"]') as HTMLElement;
    expect(blockButton).not.toBeNull();

    await blockButton.click();
    await nextTick();
    expect(blockUserMock).toHaveBeenCalledWith({
      action: 'block',
      username: 'testuser',
    });
    expect(userRef.value.relationship.blocking).toBe(true);
    expect(userRef.value.relationship.following).toBe(false);
  });

  it('unblock a user if blocked and clicked block button', async () => {
    userRef.value.relationship.blocking = true;

    const wrapper = await createWrapper();

    expect(useMuteMutationMock).toHaveBeenCalled();
    expect(useBlockMutationMock).toHaveBeenCalled();
    expect(useFollowMutationMock).toHaveBeenCalled();

    const dropdownTrigger = wrapper.find('[data-test="profile-actions-trigger"]');
    expect(dropdownTrigger.exists()).toBe(true);

    await dropdownTrigger.trigger('click');
    await nextTick();

    const blockButton = document.querySelector('[data-test="block-button"]') as HTMLElement;
    expect(blockButton).not.toBeNull();

    await blockButton.click();
    await nextTick();
    expect(blockUserMock).toHaveBeenCalledWith({
      action: 'unblock',
      username: 'testuser',
    });
    expect(userRef.value.relationship.blocking).toBe(false);
  });

  it('follow a user when clicked follow button', async () => {
    userRef.value.relationship.following = false;

    const wrapper = await createWrapper();

    expect(useMuteMutationMock).toHaveBeenCalled();
    expect(useBlockMutationMock).toHaveBeenCalled();
    expect(useFollowMutationMock).toHaveBeenCalled();

    const followButton = wrapper.find('[data-test="follow-button"]');
    expect(followButton.exists()).toBe(true);

    await followButton.trigger('click');
    await nextTick();
    expect(followUserMock).toHaveBeenCalledWith({
      action: 'follow',
      username: 'testuser',
    });
    expect(userRef.value.relationship.following).toBe(true);
  });

  it('unfollow a user when clicked unfollow button', async () => {
    userRef.value.relationship.following = true;

    const wrapper = await createWrapper();

    expect(useMuteMutationMock).toHaveBeenCalled();
    expect(useBlockMutationMock).toHaveBeenCalled();
    expect(useFollowMutationMock).toHaveBeenCalled();

    const unfollowButton = wrapper.find('[data-test="unfollow-button"]');
    expect(unfollowButton.exists()).toBe(true);

    await unfollowButton.trigger('click');
    await nextTick();
    expect(followUserMock).toHaveBeenCalledWith({
      action: 'unfollow',
      username: 'testuser',
    });
    expect(userRef.value.relationship.following).toBe(false);
  });
});
