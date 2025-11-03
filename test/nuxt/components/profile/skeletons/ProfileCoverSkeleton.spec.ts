import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileCoverSkeleton from '@/components/profile/skeletons/ProfileCoverSkeleton.vue';

describe('ProfileCoverSkeleton', () => {
  it('renders the skeleton div with correct classes', async () => {
    const wrapper = await mountSuspended(ProfileCoverSkeleton);

    const skeleton = wrapper.find('div');
    expect(skeleton.exists()).toBe(true);

    const classes = skeleton.classes();
    expect(classes).toContain('bg-muted-foreground/50');
    expect(classes).toContain('h-48');
    expect(classes).toContain('w-full');
    expect(classes).toContain('animate-pulse');
  });

  it('has correct height and width classes', async () => {
    const wrapper = await mountSuspended(ProfileCoverSkeleton);

    const skeleton = wrapper.find('div');
    expect(skeleton.classes()).toContain('h-48');
    expect(skeleton.classes()).toContain('w-full');
  });

  it('has animate-pulse class for loading animation', async () => {
    const wrapper = await mountSuspended(ProfileCoverSkeleton);

    const skeleton = wrapper.find('div');
    expect(skeleton.classes()).toContain('animate-pulse');
  });

  it('has muted background color', async () => {
    const wrapper = await mountSuspended(ProfileCoverSkeleton);

    const skeleton = wrapper.find('div');
    expect(skeleton.classes()).toContain('bg-muted-foreground/50');
  });

  it('renders as a single div element', async () => {
    const wrapper = await mountSuspended(ProfileCoverSkeleton);

    const divs = wrapper.findAll('div');
    expect(divs).toHaveLength(1);
  });
});
