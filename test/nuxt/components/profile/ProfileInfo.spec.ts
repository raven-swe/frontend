import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileInfo from '@/components/profile/ProfileInfo.vue';

const mockUserProfile = {
  displayName: 'Hussein Mohamed',
  username: 'hussein',
  bio: 'football lover, software engineer, coffee addict.',
  websiteUrl: 'https://www.example.com/averylongurlthatexceedsthirtycharacters',
  joinedAt: '2020-07-01T00:00:00.000Z',
  followingCount: 150,
  followersCount: 50,
  bioEntities: { mentions: [], hashtags: [] },
  avatarUrl: 'https://i.ibb.co/vv6B8ML0/profile.jpg',
  bannerUrl: 'https://i.ibb.co/bj3fhPfq/cover.jpg',
  location: 'Cairo, Egypt',
  birthDate: '1999-01-01',
  mutualsCount: 0,
  mutualNames: [],
};

describe('ProfileInfo', () => {
  it('renders component with correct structure', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const container = wrapper.find('div.mt-2.flex.flex-col');
    expect(container.exists()).toBe(true);
  });

  it('renders website link and displayUrl correctly', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });
    const link = wrapper.find('a.text-brand-blue');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe(mockUserProfile.websiteUrl);
    expect(link.text()).toContain('...');
    expect(link.html()).toContain('ic:sharp-link');
  });

  it('renders user name in h2 element', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const userName = wrapper.find('h2');
    expect(userName.exists()).toBe(true);
    expect(userName.classes()).toContain('text-2xl');
    expect(userName.classes()).toContain('font-bold');
  });

  it('renders user bio paragraph', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const paragraphs = wrapper.findAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders calendar icon for join date', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const html = wrapper.html();

    expect(html).toContain('ic:sharp-calendar-month');
  });

  it('renders statistics section with proper structure', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const statsSection = wrapper.find('div.mt-4.flex.space-x-4');
    expect(statsSection.exists()).toBe(true);

    const statItems = statsSection.findAll('span');
    expect(statItems.length).toBeGreaterThanOrEqual(2);
  });

  it('renders following and followers counts with strong tags', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const strongTags = wrapper.findAll('strong');
    expect(strongTags.length).toBe(2);
  });

  it('does not render website link if websiteUrl is missing', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: { ...mockUserProfile, websiteUrl: '' } },
    });
    const link = wrapper.find('a.text-brand-blue');
    expect(link.exists()).toBe(true);
    expect(link.text().trim()).toBe('');
  });
});
