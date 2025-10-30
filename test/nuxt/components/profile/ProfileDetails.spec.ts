import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileDetails from '@/components/profile/ProfileDetails.vue';

const mockUserProfile = {
  username: 'hussein',
  displayName: 'Hussein Mohamed',
  bio: 'football lover, software engineer, coffee addict.',
  bioEntities: {
    mentions: [],
    hashtags: [],
  },
  avatarUrl: 'https://i.ibb.co/vv6B8ML0/profile.jpg',
  bannerUrl: 'https://i.ibb.co/bj3fhPfq/cover.jpg',
  location: 'Cairo, Egypt',
  websiteUrl: 'https://github.com/hussein',
  birthDate: '1999-01-01',
  joinedAt: '2020-07-01T00:00:00.000Z',
  followingCount: 150,
  followersCount: 200,
  mutualsCount: 5,
  mutualNames: [],
};

describe('ProfileDetails Component', () => {
  it('renders ProfileCover component', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      props: { userProfile: mockUserProfile },
    });

    const coverImage = wrapper.find('img[alt="Profile Cover"]');
    expect(coverImage.exists()).toBe(true);
  });

  it('renders ProfileAvatarSection component', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      props: { userProfile: mockUserProfile },
    });

    const profileImage = wrapper.find('img[alt="Profile picture"]');
    expect(profileImage.exists()).toBe(true);
  });

  it('renders ProfileInfo component', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      props: { userProfile: mockUserProfile },
    });

    const container = wrapper.find('div.mt-2.flex.flex-col');
    expect(container.exists()).toBe(true);
  });

  it('passes correct coverImg prop to ProfileCover', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      props: { userProfile: mockUserProfile },
    });

    const coverImage = wrapper.find('img[alt="Profile Cover"]');
    expect(coverImage.attributes('src')).toContain('cover.jpg');
  });

  it('passes correct profileImg prop to ProfileAvatarSection', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      props: { userProfile: mockUserProfile },
    });

    const profileImage = wrapper.find('img[alt="Profile picture"]');
    expect(profileImage.attributes('src')).toContain('profile.jpg');
  });

  it('passes correct userProfile prop to ProfileInfo', async () => {
    const wrapper = await mountSuspended(ProfileDetails, {
      props: { userProfile: mockUserProfile },
    });

    const html = wrapper.html();
    expect(html).toContain(mockUserProfile.displayName);
    expect(html).toContain(mockUserProfile.username);
  });
});
