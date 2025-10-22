import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileInfo from '@/components/profile/ProfileInfo.vue';

const mockUserProfile = {
  coverImg: '/cover.jpg',
  profileImg: '/profile.jpg',
  name: 'Hussein Mohamed',
  username: 'hussein',
  bio: 'football lover, software engineer, coffee addict.',
  joinAt: 'july 2020',
  following: 150,
  followers: 50,
};

describe('ProfileInfo', () => {
  it('renders component with correct structure', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const container = wrapper.find('div.mt-2.flex.flex-col');
    expect(container.exists()).toBe(true);
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
    // Check if icon is rendered in the HTML
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
});
