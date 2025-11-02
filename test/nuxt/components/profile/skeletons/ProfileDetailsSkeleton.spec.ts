import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileDetailsSkeleton from '@/components/profile/skeletons/ProfileDetailsSkeleton.vue';
import ProfileCoverSkeleton from '@/components/profile/skeletons/ProfileCoverSkeleton.vue';
import ProfileAvatarSkeleton from '@/components/profile/skeletons/ProfileAvatarSkeleton.vue';
import ProfileInfoSkeleton from '@/components/profile/skeletons/ProfileInfoSkeleton.vue';

describe('ProfileDetailsSkeleton', () => {
  it('renders the main container', async () => {
    const wrapper = await mountSuspended(ProfileDetailsSkeleton);

    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
  });

  it('renders ProfileCoverSkeleton component', async () => {
    const wrapper = await mountSuspended(ProfileDetailsSkeleton);

    const coverSkeleton = wrapper.findComponent(ProfileCoverSkeleton);
    expect(coverSkeleton.exists()).toBe(true);
  });

  it('renders ProfileAvatarSkeleton component', async () => {
    const wrapper = await mountSuspended(ProfileDetailsSkeleton);

    const avatarSkeleton = wrapper.findComponent(ProfileAvatarSkeleton);
    expect(avatarSkeleton.exists()).toBe(true);
  });

  it('renders ProfileInfoSkeleton component', async () => {
    const wrapper = await mountSuspended(ProfileDetailsSkeleton);

    const infoSkeleton = wrapper.findComponent(ProfileInfoSkeleton);
    expect(infoSkeleton.exists()).toBe(true);
  });

  it('renders all three skeleton components', async () => {
    const wrapper = await mountSuspended(ProfileDetailsSkeleton);

    const coverSkeleton = wrapper.findComponent(ProfileCoverSkeleton);
    const avatarSkeleton = wrapper.findComponent(ProfileAvatarSkeleton);
    const infoSkeleton = wrapper.findComponent(ProfileInfoSkeleton);

    expect(coverSkeleton.exists()).toBe(true);
    expect(avatarSkeleton.exists()).toBe(true);
    expect(infoSkeleton.exists()).toBe(true);
  });

  it('renders components in correct order by checking DOM structure', async () => {
    const wrapper = await mountSuspended(ProfileDetailsSkeleton);

    const html = wrapper.html();

    // Check that cover skeleton appears first (has h-48 class)
    const coverIndex = html.indexOf('h-48');

    // Check that avatar skeleton appears after cover (has size-34 class)
    const avatarIndex = html.indexOf('size-34');

    // Check that info skeleton appears last (has px-4 class for inner container)
    const infoIndex = html.indexOf('px-4');

    expect(coverIndex).toBeGreaterThan(-1);
    expect(avatarIndex).toBeGreaterThan(-1);
    expect(infoIndex).toBeGreaterThan(-1);
    expect(coverIndex).toBeLessThan(avatarIndex);
    expect(avatarIndex).toBeLessThan(infoIndex);
  });

  it('has proper component structure with single root div', async () => {
    const wrapper = await mountSuspended(ProfileDetailsSkeleton);

    // Should have a root div
    const rootDiv = wrapper.find('div');
    expect(rootDiv.exists()).toBe(true);

    // Should contain cover skeleton (h-48 class)
    expect(wrapper.find('.h-48').exists()).toBe(true);

    // Should contain avatar skeleton (size-34 class)
    expect(wrapper.find('.size-34').exists()).toBe(true);

    // Should contain info skeleton (px-4 class from inner container)
    expect(wrapper.find('.px-4').exists()).toBe(true);
  });

  it('renders skeleton elements with proper styling classes', async () => {
    const wrapper = await mountSuspended(ProfileDetailsSkeleton);

    // Cover skeleton should have full width and specific height
    const coverElement = wrapper.find('.h-48.w-full');
    expect(coverElement.exists()).toBe(true);

    // Avatar skeleton should have specific size and positioning
    const avatarElement = wrapper.find('.size-34.-mt-16');
    expect(avatarElement.exists()).toBe(true);

    // Info skeleton should have proper layout classes
    const infoContainer = wrapper.find('.mt-2.flex.flex-col');
    expect(infoContainer.exists()).toBe(true);
  });
});
