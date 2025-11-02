import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { computed } from 'vue';
import ProfileAvatarSkeleton from '@/components/profile/skeletons/ProfileAvatarSkeleton.vue';

// Mock the composable
vi.mock('@/composables/useIsCurrentUser', () => ({
  useIsCurrentUser: vi.fn(() => ({ isCurrentUser: computed(() => false) })),
}));

describe('ProfileAvatarSkeleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main container with correct classes', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSkeleton);

    const container = wrapper.find('div.mx-4');
    expect(container.exists()).toBe(true);

    const classes = container.classes();
    expect(classes).toContain('mx-4');
    expect(classes).toContain('flex');
    expect(classes).toContain('flex-wrap');
    expect(classes).toContain('items-center');
    expect(classes).toContain('justify-between');
    expect(classes).toContain('gap-4');
  });

  it('renders avatar skeleton with correct styling', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSkeleton);

    const avatarSkeleton = wrapper.find('div.size-34');
    expect(avatarSkeleton.exists()).toBe(true);

    const classes = avatarSkeleton.classes();
    expect(classes).toContain('border-background');
    expect(classes).toContain('bg-muted-foreground/50');
    expect(classes).toContain('z-20');
    expect(classes).toContain('-mt-16');
    expect(classes).toContain('size-34');
    expect(classes).toContain('animate-pulse');
    expect(classes).toContain('rounded-full');
    expect(classes).toContain('border-4');
  });

  it('does not show button skeleton when not current user', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => false) });

    const wrapper = await mountSuspended(ProfileAvatarSkeleton);

    const buttonSkeleton = wrapper.find('div.h-9.w-28');
    expect(buttonSkeleton.exists()).toBe(false);
  });

  it('shows button skeleton when current user', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });

    const wrapper = await mountSuspended(ProfileAvatarSkeleton);

    const buttonSkeleton = wrapper.find('div.h-9.w-28');
    expect(buttonSkeleton.exists()).toBe(true);

    const classes = buttonSkeleton.classes();
    expect(classes).toContain('bg-muted-foreground/50');
    expect(classes).toContain('h-9');
    expect(classes).toContain('w-28');
    expect(classes).toContain('animate-pulse');
    expect(classes).toContain('rounded-md');
  });

  it('has proper avatar positioning with negative margin and z-index', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSkeleton);

    const avatarSkeleton = wrapper.find('div.size-34');
    const classes = avatarSkeleton.classes();

    expect(classes).toContain('z-20');
    expect(classes).toContain('-mt-16');
  });

  it('avatar skeleton has rounded-full and border styling', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSkeleton);

    const avatarSkeleton = wrapper.find('div.size-34');
    const classes = avatarSkeleton.classes();

    expect(classes).toContain('rounded-full');
    expect(classes).toContain('border-4');
    expect(classes).toContain('border-background');
  });

  it('button skeleton has proper dimensions when visible', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });

    const wrapper = await mountSuspended(ProfileAvatarSkeleton);

    const buttonSkeleton = wrapper.find('div.h-9');
    expect(buttonSkeleton.classes()).toContain('h-9');
    expect(buttonSkeleton.classes()).toContain('w-28');
    expect(buttonSkeleton.classes()).toContain('rounded-md');
  });

  it('all skeleton elements have animate-pulse class', async () => {
    const { useIsCurrentUser } = await import('@/composables/useIsCurrentUser');
    vi.mocked(useIsCurrentUser).mockReturnValue({ isCurrentUser: computed(() => true) });

    const wrapper = await mountSuspended(ProfileAvatarSkeleton);

    const animatedElements = wrapper.findAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);

    // Avatar skeleton should have animate-pulse
    const avatarSkeleton = wrapper.find('div.size-34');
    expect(avatarSkeleton.classes()).toContain('animate-pulse');

    // Button skeleton should have animate-pulse when visible
    const buttonSkeleton = wrapper.find('div.h-9');
    expect(buttonSkeleton.classes()).toContain('animate-pulse');
  });
});
