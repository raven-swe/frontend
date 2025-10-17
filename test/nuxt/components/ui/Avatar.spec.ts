import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Avatar from '@/components/ui/Avatar.vue';

describe('Avatar Component', () => {
  it('renders AvatarImg with the provided img src', async () => {
    const wrapper = await mountSuspended(Avatar, {
      props: {
        img: 'https://placehold.co/64x64',
      },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toContain('https://placehold.co/64x64');
    expect(img.attributes('alt')).toBe('User Avatar');
  });

  it('renders fallback if image fails or not found', async () => {
    const wrapper = await mountSuspended(Avatar, {
      props: { img: 'https://img.invalid-url.com' }, // missing or broken image
    });
    // Trigger image error (so you don't have to wait for timeout)
    const img = wrapper.find('img');
    await img.trigger('error');

    const fallback = wrapper.findComponent({ name: 'AvatarFallback' });
    expect(fallback.exists()).toBe(true);
    expect(wrapper.text()).toContain('?');
  });

  it('applies correct classes for default props (variant: primary, size: md)', async () => {
    const wrapper = await mountSuspended(Avatar);
    const root = wrapper.findComponent({ name: 'AvatarRoot' });
    const classes = root.classes();

    expect(classes).toContain('cursor-pointer');
    expect(classes).toContain('hover:brightness-96');
    expect(classes).toContain('size-16');
  });

  it('applies correct classes for variant: secondary', async () => {
    const wrapper = await mountSuspended(Avatar, {
      props: { variant: 'secondary' },
    });
    const root = wrapper.findComponent({ name: 'AvatarRoot' });
    const classes = root.classes();

    expect(classes).toContain('cursor-default');
    expect(classes).not.toContain('hover:brightness-96');
  });

  it('applies correct classes for variant: primary', async () => {
    const wrapper = await mountSuspended(Avatar, {
      props: { variant: 'primary' },
    });
    const root = wrapper.findComponent({ name: 'AvatarRoot' });
    const classes = root.classes();

    expect(classes).toContain('cursor-pointer');
    expect(classes).toContain('hover:brightness-96');
  });

  it('applies correct classes for size: sm', async () => {
    const wrapper = await mountSuspended(Avatar, {
      props: { size: 'sm' },
    });
    const root = wrapper.findComponent({ name: 'AvatarRoot' });
    expect(root.classes()).toContain('size-10');
  });

  it('applies correct classes for size: lg', async () => {
    const wrapper = await mountSuspended(Avatar, {
      props: { size: 'lg' },
    });
    const root = wrapper.findComponent({ name: 'AvatarRoot' });
    expect(root.classes()).toContain('size-24');
  });

  it('applies correct classes for size: xl', async () => {
    const wrapper = await mountSuspended(Avatar, {
      props: { size: 'xl' },
    });
    const root = wrapper.findComponent({ name: 'AvatarRoot' });
    expect(root.classes()).toContain('size-92');
  });

  it('renders default image if no img prop is provided', async () => {
    const wrapper = await mountSuspended(Avatar);
    const img = wrapper.find('img');
    expect(img.attributes('src')).toContain('/default_profile.png');
  });
});
