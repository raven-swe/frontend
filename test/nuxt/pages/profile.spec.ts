import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfilePage from '@/pages/profile/index.vue';

describe('Profile Page', () => {
  it('renders page with correct structure', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    // Check main container exists
    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
  });

  it('renders ProfileCover component', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    // Check if cover image exists
    const coverImage = wrapper.find('img[alt="Profile Cover"]');
    expect(coverImage.exists()).toBe(true);
  });

  it('renders ProfileAvatarSection component', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    // Check if profile picture exists
    const profileImage = wrapper.find('img[alt="Profile picture"]');
    expect(profileImage.exists()).toBe(true);
  });

  it('renders ProfileDetails component', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    const html = wrapper.html();
    // Check if user details are rendered
    expect(html).toContain('Hussein Mohamed');
    expect(html).toContain('@hussein');
  });

  it('renders Edit Profile button', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    const html = wrapper.html();
    expect(html).toContain('Edit Profile');
  });

  it('renders user statistics', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    const html = wrapper.html();
    expect(html).toContain('Following');
    expect(html).toContain('Followers');
  });
});
