import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { setActivePinia, createPinia } from 'pinia';
import { computed } from 'vue';
import ProfileAvatarSection from '@/components/profile/ProfileAvatarSection.vue';
import type { User } from '~~/shared/types/user';

// Mock the composable
vi.mock('@/composables/useIsCurrentUser', () => ({
  useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
}));

// Mock the user store
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    isProfileSetup: true,
  })),
}));

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
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders the container with correct layout classes', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {});

    const container = wrapper.find('.mx-4.flex.flex-wrap');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('justify-between');
    expect(container.classes()).toContain('gap-4');
  });

  it('renders profile image', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {});

    const profileImage = wrapper.find('img');
    expect(profileImage.exists()).toBe(true);
  });

  it('has correct profile image source', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const profileImage = wrapper.find('img');
    expect(profileImage.attributes('src')).toContain('avatar.jpg');
  });

  it('has correct profile image alt text', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const profileImage = wrapper.find('img');
    expect(profileImage.attributes('alt')).toBe('Profile picture');
  });

  it('applies correct styling to profile image', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const profileImage = wrapper.find('img');
    const classes = profileImage.classes();
    expect(classes).toContain('rounded-full');
    expect(classes).toContain('border-4');
    expect(classes).toContain('object-cover');
  });

  it('profile image has eager loading', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const profileImage = wrapper.find('img');
    expect(profileImage.attributes('loading')).toBe('eager');
  });

  it('does not show button when not current user', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => false) });

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const setupProfileButton = wrapper.find('button[data-test="setup-profile-button"]');
    expect(setupProfileButton.exists()).toBe(false);

    const editProfileButton = wrapper.find('button[data-test="edit-profile-button"]');
    expect(editProfileButton.exists()).toBe(false);
  });

  it('shows setup profile button when current user and profile not setup', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    const { useUserStore } = await import('@/stores/user');

    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });
    vi.mocked(useUserStore).mockReturnValue({
      isProfileSetup: false,
    } as ReturnType<typeof useUserStore>);

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
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    const { useUserStore } = await import('@/stores/user');

    vi.doMock('~/composables/useProfileMutation', () => ({
      useProfileMutation: vi.fn(() => ({
        mutate: vi.fn(),
      })),
    }));

    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });
    vi.mocked(useUserStore).mockReturnValue({
      isProfileSetup: true,
    } as ReturnType<typeof useUserStore>);

    const mockUserRef = computed(() => mockUser);
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': mockUserRef,
        },
      },
    });

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);

    const link = wrapper.find('a[href="/settings/profile"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('Edit Profile');
  });

  it('setup profile button has outline variant', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    const { useUserStore } = await import('@/stores/user');

    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });
    vi.mocked(useUserStore).mockReturnValue({
      isProfileSetup: false,
    } as ReturnType<typeof useUserStore>);
    const mockUserRef = computed(() => mockUser);

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': mockUserRef,
        },
      },
    });

    const button = wrapper.find('button');
    const classes = button.classes();
    expect(classes).toContain('border-input');
  });

  it('edit profile button has outline variant', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    const { useUserStore } = await import('@/stores/user');

    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });
    vi.mocked(useUserStore).mockReturnValue({
      isProfileSetup: true,
    } as ReturnType<typeof useUserStore>);

    const mockUserRef = computed(() => mockUser);
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      global: {
        provide: {
          'user-data': mockUserRef,
        },
      },
    });

    const button = wrapper.find('button');
    const classes = button.classes();
    expect(classes).toContain('border-input');
  });

  it('profile image has correct z-index and negative margin', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const profileImage = wrapper.find('img');
    const classes = profileImage.classes();
    expect(classes).toContain('z-20');
    expect(classes).toContain('-mt-16');
    expect(classes).toContain('size-34');
  });
});
