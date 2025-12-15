import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileInfo from '@/components/profile/ProfileInfo.vue';
import type { User } from '~~/shared/types/user';
import { computed } from 'vue';

const mockUser: User = {
  joinedAt: '2020-07-15T12:34:56Z',
  bioEntities: {
    mentions: [],
    hashtags: [],
  },
  username: 'testuser',
  email: 'testemail@gmail.com',
  avatarUrl: '/avatar.jpg',
  bannerUrl: '/banner.jpg',
  bio: 'This is a test bio',
  location: 'Test Location',
  birthDate: '1990-01-01',
  websiteUrl: 'https://testwebsite.com',
  followersCount: 0,
  followingCount: 0,
  languageCode: 'en',
  displayName: 'Test User',
  phone: '',
  mutualsCount: 0,
  relationship: {
    blocking: false,
    blockedBy: false,
    following: false,
    follower: false,
    muted: false,
  },
  mutualUsers: [
    {
      avatarUrl: '/mutual1.jpg',
      displayName: 'mutualuser1',
    },
    {
      avatarUrl: '/mutual2.jpg',
      displayName: 'mutualuser2',
    },
    {
      avatarUrl: '/mutual3.jpg',
      displayName: 'mutualuser3',
    },
    {
      avatarUrl: '/mutual4.jpg',
      displayName: 'mutualuser4',
    },
  ],
};

const mockUsIsCurrentUser = vi.hoisted(() => {
  return {
    value: false,
  };
});

vi.mock('~/composables/useIsCurrentUser', () => {
  return {
    useIsCurrentUser: () => ({
      isCurrentUser: computed(() => mockUsIsCurrentUser.value),
    }),
  };
});

describe('ProfileInfo', () => {
  it('renders component with correct structure', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const infoContainer = wrapper.find('.mt-2.flex.flex-wrap.gap-2');
    expect(infoContainer.exists()).toBe(true);

    const statsContainer = wrapper.find('.mt-3.flex.space-x-4');
    expect(statsContainer.exists()).toBe(true);
    const html = wrapper.html();
    expect(html).toContain('ic:sharp-location-on');
    expect(html).toContain('ic:sharp-link');
    expect(html).toContain('ic:sharp-calendar-month');

    const displayName = wrapper.find('h2');
    expect(displayName.exists()).toBe(true);
    expect(displayName.text()).toBe('Test User');
    expect(displayName.classes()).toContain('text-xl');
    expect(displayName.classes()).toContain('font-bold');

    const username = wrapper.find('p.text-md');
    expect(username.exists()).toBe(true);
    expect(username.text()).toBe('@testuser');

    const bio = wrapper.find('p.whitespace-pre-line');
    expect(bio.exists()).toBe(true);
    expect(bio.text()).toBe('This is a test bio');
    expect(bio.classes()).toContain('mt-2');

    expect(wrapper.html()).toContain('Test Location');
    expect(wrapper.html()).toContain('ic:sharp-location-on');

    // Check that location paragraph has leading-tight class
    const locationParagraph = wrapper.find('p.leading-tight');
    expect(locationParagraph.exists()).toBe(true);
    expect(locationParagraph.text()).toContain('Test Location');
  });

  it('does not render location when not provided', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({ ...mockUser, location: '' })),
        },
      },
    });

    expect(wrapper.html()).not.toContain('ic:sharp-location-on');
  });

  it('renders website link and displayUrl correctly when URL is long', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            websiteUrl: 'https://averylongwebsiteurl.com/some/really/long/path',
          })),
        },
      },
    });

    const link = wrapper.find('a.text-brand-blue');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('https://averylongwebsiteurl.com/some/really/long/path');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
    expect(link.text()).toContain('...');
    expect(link.html()).toContain('ic:sharp-link');
  });

  it('renders website link without truncation when URL is short', async () => {
    const shortUrl = 'https://example.com';
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            websiteUrl: shortUrl,
          })),
        },
      },
    });

    const link = wrapper.find('a.text-brand-blue');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('example.com');
    expect(link.text()).not.toContain('...');
  });

  it('does not render website link when websiteUrl is empty', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({ ...mockUser, websiteUrl: '' })),
        },
      },
    });

    const link = wrapper.find('a.text-brand-blue');
    expect(link.exists()).toBe(false);
  });

  it('renders join date with calendar icon', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const html = wrapper.html();
    expect(html).toContain('ic:sharp-calendar-month');
    expect(html).toContain('July 2020'); // formatMonthYear output shows full month name
  });

  it('renders following and followers counts', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({ ...mockUser, followingCount: 150, followersCount: 50 })),
        },
      },
    });
    const statsSection = wrapper.find('div.mt-3.flex.space-x-4');
    expect(statsSection.exists()).toBe(true);

    const strongTags = wrapper.findAll('strong');
    expect(strongTags.length).toBe(2);
    expect(strongTags[0]?.text()).toBe('150');
    expect(strongTags[1]?.text()).toBe('50');
  });

  it('renders statistics with proper labels', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => mockUser),
        },
      },
    });

    const html = wrapper.html();
    expect(html).toContain('Following'); // Translated text
    expect(html).toContain('Followers'); // Translated text
  });

  it('render section for user muted by current user', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            relationship: { ...mockUser.relationship, muted: true },
          })),
        },
      },
    });

    expect(wrapper.html()).toContain('You have muted posts from this account.');
  });

  it('renders follower and following count correctly', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            followersCount: 1234,
            followingCount: 100000,
          })),
        },
      },
    });

    const followersCount = wrapper.find('[data-test="followers-count"]');
    const followingCount = wrapper.find('[data-test="following-count"]');

    expect(followersCount.exists()).toBe(true);
    expect(followersCount.text()).toContain('1.2K');

    expect(followingCount.exists()).toBe(true);
    expect(followingCount.text()).toContain('100K');
  });

  it('handle missing followers and following count gracefully', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            followersCount: undefined,
            followingCount: undefined,
          })),
        },
      },
    });

    const followersCount = wrapper.find('[data-test="followers-count"]');
    const followingCount = wrapper.find('[data-test="following-count"]');

    expect(followersCount.exists()).toBe(true);
    expect(followersCount.text()).toContain('0');

    expect(followingCount.exists()).toBe(true);
    expect(followingCount.text()).toContain('0');
  });

  it("handle join date formatting when it's missing", async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            joinedAt: undefined,
          })),
        },
      },
    });

    const html = wrapper.html();
    expect(html).not.toContain('ic:sharp-calendar-month');
    expect(html).not.toContain('Joined');
    wrapper.unmount();
  });

  it('correctly render formatted joined at date', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            joinedAt: '2021-03-10T08:00:00Z',
          })),
        },
      },
    });

    const html = wrapper.html();
    expect(html).toContain('ic:sharp-calendar-month');
    expect(html).toContain('March 2021'); // formatMonthYear output shows full month name
    wrapper.unmount();
  });

  it('renders one mutual follower when mutualsCount is 1', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            mutualsCount: 1,
          })),
        },
        stubs: {
          UiAvatar: {
            props: ['img'],
            template: '<div data-test="avatar">{{ img }}</div>',
          },
        },
      },
    });

    expect(wrapper.html()).toContain('Followed by mutualuser1');
    const avatar = wrapper.findAll('div[data-test="avatar"]');
    expect(avatar.length).toBe(1);
    expect(avatar[0]?.text()).toBe('/mutual1.jpg');
    wrapper.unmount();
  });

  it('renders two mutual followers when mutualsCount is 2', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            mutualsCount: 2,
          })),
        },
        stubs: {
          UiAvatar: {
            props: ['img'],
            template: '<div data-test="avatar">{{ img }}</div>',
          },
        },
      },
    });

    expect(wrapper.html()).toContain('Followed by mutualuser1 and mutualuser2');
    const avatar = wrapper.findAll('div[data-test="avatar"]');
    expect(avatar.length).toBe(2);
    expect(avatar[0]?.text()).toBe('/mutual1.jpg');
    expect(avatar[1]?.text()).toBe('/mutual2.jpg');
    wrapper.unmount();
  });

  it('renders three mutual followers when mutualsCount is 3', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            mutualsCount: 3,
          })),
        },
        stubs: {
          UiAvatar: {
            props: ['img'],
            template: '<div data-test="avatar">{{ img }}</div>',
          },
        },
      },
    });

    expect(wrapper.html()).toContain('Followed by mutualuser1, mutualuser2, and mutualuser3');
    const avatar = wrapper.findAll('div[data-test="avatar"]');
    expect(avatar.length).toBe(3);
    expect(avatar[0]?.text()).toBe('/mutual1.jpg');
    expect(avatar[1]?.text()).toBe('/mutual2.jpg');
    expect(avatar[2]?.text()).toBe('/mutual3.jpg');
    wrapper.unmount();
  });

  it('renders four mutual followers when mutualsCount is many', async () => {
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            mutualsCount: 43,
          })),
        },
        stubs: {
          UiAvatar: {
            props: ['img'],
            template: '<div data-test="avatar">{{ img }}</div>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain(
      `Followed by mutualuser1, mutualuser2, and ${43 - 2} others you follow`,
    );
    const avatar = wrapper.findAll('div[data-test="avatar"]');
    expect(avatar.length).toBe(3);
    expect(avatar[0]?.text()).toBe('/mutual1.jpg');
    expect(avatar[1]?.text()).toBe('/mutual2.jpg');
    expect(avatar[2]?.text()).toBe('/mutual3.jpg');
    wrapper.unmount();
  });

  it('does not render mutual followrers if am the current user', async () => {
    mockUsIsCurrentUser.value = true;
    const wrapper = await mountSuspended(ProfileInfo, {
      global: {
        provide: {
          'user-data': computed(() => ({
            ...mockUser,
            mutualsCount: 3,
          })),
        },
        stubs: {
          UiAvatar: {
            props: ['img'],
            template: '<div data-test="avatar">{{ img }}</div>',
          },
        },
      },
    });

    expect(wrapper.html()).not.toContain('Followed by');
    const avatar = wrapper.findAll('div[data-test="avatar"]');
    expect(avatar.length).toBe(0);
    mockUsIsCurrentUser.value = false;
    wrapper.unmount();
  });
});
