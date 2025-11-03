import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { setActivePinia, createPinia } from 'pinia';
import { computed } from 'vue';
import ProfileAvatarSection from '@/components/profile/ProfileAvatarSection.vue';

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

describe('ProfileAvatarSection Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders the container with correct layout classes', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const container = wrapper.find('.mx-4.flex.flex-wrap');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('justify-between');
    expect(container.classes()).toContain('gap-4');
  });

  it('renders profile image', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const profileImage = wrapper.find('img');
    expect(profileImage.exists()).toBe(true);
  });

  it('has correct profile image source', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const profileImage = wrapper.find('img');
    expect(profileImage.attributes('src')).toContain('profile.jpg');
  });

  it('has correct profile image alt text', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
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

    const button = wrapper.find('button');
    expect(button.exists()).toBe(false);
  });

  it('shows setup profile button when current user and profile not setup', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    const { useUserStore } = await import('@/stores/user');

    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });
    vi.mocked(useUserStore).mockReturnValue({
      isProfileSetup: false,
    } as ReturnType<typeof useUserStore>);

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);

    const link = wrapper.find('a[href="/profile/setup"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('Set up profile');
  });

  it('shows edit profile button when current user and profile is setup', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    const { useUserStore } = await import('@/stores/user');

    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });
    vi.mocked(useUserStore).mockReturnValue({
      isProfileSetup: true,
    } as ReturnType<typeof useUserStore>);

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
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

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
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

    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
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
