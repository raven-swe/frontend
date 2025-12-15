import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileCover from '@/components/profile/ProfileCover.vue';

describe('ProfileCover Component', () => {
  it('renders cover image', async () => {
    const wrapper = await mountSuspended(ProfileCover, {
      props: { coverImg: '/cover.jpg' },
    });

    const coverImage = wrapper.find('img');
    expect(coverImage.exists()).toBe(true);
  });

  it('has correct image source', async () => {
    const wrapper = await mountSuspended(ProfileCover, {
      props: { coverImg: '/cover.jpg' },
    });

    const coverImage = wrapper.find('img');
    expect(coverImage.attributes('src')).toContain('cover.jpg');
  });

  it('has correct alt text', async () => {
    const wrapper = await mountSuspended(ProfileCover, {
      props: { coverImg: '/cover.jpg' },
    });

    const coverImage = wrapper.find('img');
    expect(coverImage.attributes('alt')).toBe('Profile Cover');
  });

  it('applies correct styling classes', async () => {
    const wrapper = await mountSuspended(ProfileCover, {
      props: { coverImg: '/cover.jpg' },
    });

    const coverImage = wrapper.find('img');
    const classes = coverImage.classes();
    expect(classes).toContain('aspect-[3/1]');
    expect(classes).toContain('w-full');
    expect(classes).toContain('object-cover');
  });

  it('has eager loading attribute', async () => {
    const wrapper = await mountSuspended(ProfileCover, {
      props: { coverImg: '/cover.jpg' },
    });

    const coverImage = wrapper.find('img');
    expect(coverImage.attributes('loading')).toBe('eager');
  });
});
