import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileInfoSkeleton from '@/components/profile/skeletons/ProfileInfoSkeleton.vue';

describe('ProfileInfoSkeleton', () => {
  it('renders the main container with correct structure', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    const container = wrapper.find('div.mt-2.flex.flex-col');
    expect(container.exists()).toBe(true);

    const innerContainer = wrapper.find('div.px-4');
    expect(innerContainer.exists()).toBe(true);
  });

  it('renders display name skeleton with correct styling', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    const displayNameSkeleton = wrapper.find('div.h-8.w-48');
    expect(displayNameSkeleton.exists()).toBe(true);

    const classes = displayNameSkeleton.classes();
    expect(classes).toContain('bg-muted-foreground/50');
    expect(classes).toContain('h-8');
    expect(classes).toContain('w-48');
    expect(classes).toContain('animate-pulse');
    expect(classes).toContain('rounded');
  });

  it('renders username skeleton with correct styling', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    const usernameSkeleton = wrapper.find('div.mt-1.h-5.w-32');
    expect(usernameSkeleton.exists()).toBe(true);

    const classes = usernameSkeleton.classes();
    expect(classes).toContain('bg-muted-foreground/50');
    expect(classes).toContain('mt-1');
    expect(classes).toContain('h-5');
    expect(classes).toContain('w-32');
    expect(classes).toContain('animate-pulse');
    expect(classes).toContain('rounded');
  });

  it('renders bio skeleton lines with correct styling', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    const bioContainer = wrapper.find('div.mt-2.space-y-2');
    expect(bioContainer.exists()).toBe(true);

    const bioLines = bioContainer.findAll('div.h-4');
    expect(bioLines).toHaveLength(2);

    // First bio line (full width)
    const firstLine = bioLines[0];
    expect(firstLine.classes()).toContain('w-full');
    expect(firstLine.classes()).toContain('h-4');
    expect(firstLine.classes()).toContain('bg-muted-foreground/50');
    expect(firstLine.classes()).toContain('animate-pulse');
    expect(firstLine.classes()).toContain('rounded');

    // Second bio line (3/4 width)
    const secondLine = bioLines[1];
    expect(secondLine.classes()).toContain('w-3/4');
    expect(secondLine.classes()).toContain('h-4');
    expect(secondLine.classes()).toContain('bg-muted-foreground/50');
    expect(secondLine.classes()).toContain('animate-pulse');
    expect(secondLine.classes()).toContain('rounded');
  });

  it('renders website and joined date skeleton with correct styling', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    const metadataContainer = wrapper.find('div.mt-2.flex.flex-wrap.gap-4');
    expect(metadataContainer.exists()).toBe(true);

    const metadataItems = metadataContainer.findAll('div.h-4');
    expect(metadataItems).toHaveLength(2);

    // Website skeleton
    const websiteSkeleton = metadataItems[0];
    expect(websiteSkeleton.classes()).toContain('w-24');
    expect(websiteSkeleton.classes()).toContain('h-4');
    expect(websiteSkeleton.classes()).toContain('bg-muted-foreground/50');
    expect(websiteSkeleton.classes()).toContain('animate-pulse');
    expect(websiteSkeleton.classes()).toContain('rounded');

    // Joined date skeleton
    const joinedSkeleton = metadataItems[1];
    expect(joinedSkeleton.classes()).toContain('w-32');
    expect(joinedSkeleton.classes()).toContain('h-4');
    expect(joinedSkeleton.classes()).toContain('bg-muted-foreground/50');
    expect(joinedSkeleton.classes()).toContain('animate-pulse');
    expect(joinedSkeleton.classes()).toContain('rounded');
  });

  it('renders following/followers skeleton with correct styling', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    const statsContainer = wrapper.find('div.mt-4.flex.space-x-4');
    expect(statsContainer.exists()).toBe(true);

    const statsItems = statsContainer.findAll('div.h-5.w-24');
    expect(statsItems).toHaveLength(2);

    statsItems.forEach((statItem) => {
      expect(statItem.classes()).toContain('bg-muted-foreground/50');
      expect(statItem.classes()).toContain('h-5');
      expect(statItem.classes()).toContain('w-24');
      expect(statItem.classes()).toContain('animate-pulse');
      expect(statItem.classes()).toContain('rounded');
    });
  });

  it('has correct spacing and layout classes', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    // Main container
    const mainContainer = wrapper.find('div.mt-2.flex.flex-col');
    expect(mainContainer.classes()).toContain('mt-2');
    expect(mainContainer.classes()).toContain('flex');
    expect(mainContainer.classes()).toContain('flex-col');

    // Inner container with padding
    const innerContainer = wrapper.find('div.px-4');
    expect(innerContainer.classes()).toContain('px-4');

    // Bio container spacing
    const bioContainer = wrapper.find('div.space-y-2');
    expect(bioContainer.classes()).toContain('space-y-2');

    // Metadata container
    const metadataContainer = wrapper.find('div.gap-4');
    expect(metadataContainer.classes()).toContain('gap-4');

    // Stats container
    const statsContainer = wrapper.find('div.space-x-4');
    expect(statsContainer.classes()).toContain('space-x-4');
  });

  it('all skeleton elements have muted background and pulse animation', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    const skeletonElements = wrapper.findAll('.bg-muted-foreground\\/50');
    expect(skeletonElements.length).toBe(8); // 1 name + 1 username + 2 bio + 2 metadata + 2 stats

    const pulseElements = wrapper.findAll('.animate-pulse');
    expect(pulseElements.length).toBe(8); // Same elements should have pulse animation

    skeletonElements.forEach((element) => {
      expect(element.classes()).toContain('bg-muted-foreground/50');
      expect(element.classes()).toContain('animate-pulse');
    });
  });

  it('has progressive width sizing for visual hierarchy', async () => {
    const wrapper = await mountSuspended(ProfileInfoSkeleton);

    // Display name should be widest (w-48)
    const displayName = wrapper.find('.w-48');
    expect(displayName.exists()).toBe(true);

    // Username should be medium (w-32)
    const username = wrapper.find('.w-32');
    expect(username.exists()).toBe(true);

    // Some elements should be smaller (w-24)
    const smallElements = wrapper.findAll('.w-24');
    expect(smallElements.length).toBe(3); // website + 2 stats

    // Bio second line should be 3/4 width
    const bioSecondLine = wrapper.find('.w-3\\/4');
    expect(bioSecondLine.exists()).toBe(true);

    // Bio first line should be full width
    const bioFirstLine = wrapper.find('.w-full');
    expect(bioFirstLine.exists()).toBe(true);
  });
});
