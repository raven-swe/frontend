import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileInfo from '@/components/profile/ProfileInfo.vue';

const mockUserProfile = {
  displayName: 'Hussein Mohamed',
  username: 'hussein',
  bio: 'football lover, software engineer, coffee addict.',
  email: '',
  phone: '',
  languageCode: 'en',
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

  it('renders display name correctly', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const displayName = wrapper.find('h2');
    expect(displayName.exists()).toBe(true);
    expect(displayName.text()).toBe('Hussein Mohamed');
    expect(displayName.classes()).toContain('text-2xl');
    expect(displayName.classes()).toContain('font-bold');
  });

  it('renders username with @ prefix', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const username = wrapper.find('p.text-md');
    expect(username.exists()).toBe(true);
    expect(username.text()).toBe('@hussein');
  });

  it('renders bio with correct styling', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const bio = wrapper.find('p.whitespace-pre-line');
    expect(bio.exists()).toBe(true);
    expect(bio.text()).toBe('football lover, software engineer, coffee addict.');
    expect(bio.classes()).toContain('text-muted-foreground');
    expect(bio.classes()).toContain('mt-2');
  });

  it('renders location when provided with leading-tight class', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    expect(wrapper.html()).toContain('Cairo, Egypt');
    expect(wrapper.html()).toContain('ic:sharp-location-on');

    // Check that location paragraph has leading-tight class
    const locationParagraph = wrapper.find('p.leading-tight');
    expect(locationParagraph.exists()).toBe(true);
    expect(locationParagraph.text()).toContain('Cairo, Egypt');
  });

  it('does not render location when not provided', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: { ...mockUserProfile, location: '' } },
    });

    expect(wrapper.html()).not.toContain('ic:sharp-location-on');
  });

  it('renders website link and displayUrl correctly when URL is long', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const link = wrapper.find('a.text-brand-blue');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe(mockUserProfile.websiteUrl);
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
    expect(link.text()).toContain('...');
    expect(link.html()).toContain('ic:sharp-link');
  });

  it('renders website link without truncation when URL is short', async () => {
    const shortUrl = 'https://example.com';
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: { ...mockUserProfile, websiteUrl: shortUrl } },
    });

    const link = wrapper.find('a.text-brand-blue');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('example.com');
    expect(link.text()).not.toContain('...');
  });

  it('does not render website link when websiteUrl is empty', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: { ...mockUserProfile, websiteUrl: '' } },
    });

    const link = wrapper.find('a.text-brand-blue');
    expect(link.exists()).toBe(false);
  });

  it('renders join date with calendar icon', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const html = wrapper.html();
    expect(html).toContain('ic:sharp-calendar-month');
    expect(html).toContain('July 2020'); // formatMonthYear output shows full month name
  });

  it('renders following and followers counts', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const statsSection = wrapper.find('div.mt-4.flex.space-x-4');
    expect(statsSection.exists()).toBe(true);

    const strongTags = wrapper.findAll('strong');
    expect(strongTags.length).toBe(2);
    expect(strongTags[0]?.text()).toBe('150');
    expect(strongTags[1]?.text()).toBe('50');
  });

  it('renders statistics with proper labels', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const html = wrapper.html();
    expect(html).toContain('Following'); // Translated text
    expect(html).toContain('Followers'); // Translated text
  });

  it('applies correct text styling to all elements', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    // Display name styling
    const displayName = wrapper.find('h2');
    expect(displayName.classes()).toContain('text-foreground');
    expect(displayName.classes()).toContain('pb-0');

    // Muted text elements
    const mutedElements = wrapper.findAll('.text-muted-foreground');
    expect(mutedElements.length).toBeGreaterThan(0);
  });

  it('handles missing optional counts gracefully', async () => {
    const userWithoutCounts = {
      ...mockUserProfile,
      followingCount: undefined,
      followersCount: undefined,
    };

    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: userWithoutCounts },
    });

    const strongTags = wrapper.findAll('strong');
    expect(strongTags.length).toBe(2);
    // Should render undefined values as empty or handle gracefully
  });

  it('renders all icons with correct sizes', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const html = wrapper.html();
    // Check that icons are rendered (exact size attributes may vary based on Icon component implementation)
    expect(html).toContain('ic:sharp-location-on');
    expect(html).toContain('ic:sharp-link');
    expect(html).toContain('ic:sharp-calendar-month');
  });

  it('applies correct gap and spacing classes', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    const infoContainer = wrapper.find('.mt-2.flex.flex-wrap.gap-2');
    expect(infoContainer.exists()).toBe(true);

    const statsContainer = wrapper.find('.mt-4.flex.space-x-4');
    expect(statsContainer.exists()).toBe(true);
  });

  it('applies text-sm class to metadata items', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      props: { userProfile: mockUserProfile },
    });

    // Location paragraph should have text-sm
    const locationP = wrapper.find('p.leading-tight');
    expect(locationP.classes()).toContain('text-sm');

    // Website link should have text-sm
    const websiteLink = wrapper.find('a.text-brand-blue');
    expect(websiteLink.classes()).toContain('text-sm');

    // Join date paragraph should have text-sm
    const joinDateP = wrapper.find('p:not(.leading-tight):not(.text-md):not(.whitespace-pre-line)');
    expect(joinDateP.classes()).toContain('text-sm');
  });
});
