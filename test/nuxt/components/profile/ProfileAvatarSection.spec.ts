import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileAvatarSection from '@/components/profile/ProfileAvatarSection.vue';

describe('ProfileAvatarSection Component', () => {
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
    expect(classes).toContain('object-contain');
  });

  it('renders Edit Profile button with correct text', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const html = wrapper.html();
    expect(html).toContain('Edit Profile');
  });

  it('Edit Profile button has outline variant', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    const classes = button.classes();
    expect(classes).toContain('border-input');
  });

  it('profile image has eager loading', async () => {
    const wrapper = await mountSuspended(ProfileAvatarSection, {
      props: { profileImg: '/profile.jpg' },
    });

    const profileImage = wrapper.find('img');
    expect(profileImage.attributes('loading')).toBe('eager');
  });
});
