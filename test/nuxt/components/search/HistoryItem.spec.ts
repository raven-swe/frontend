import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import HistoryItem from '@/components/search/HistoryItem.vue';
import type { User } from '~~/shared/types/user';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

const mockUser: User = {
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  bannerUrl: '',
  bio: '',
  location: '',
  birthDate: '',
  websiteUrl: '',
  followersCount: 100,
  followingCount: 50,
  languageCode: 'en',
  phone: '',
  mutualsCount: 0,
  joinedAt: '2023-01-01',
  bioEntities: { mentions: [], hashtags: [] },
  relationship: {
    blocking: false,
    blockedBy: false,
    following: false,
    follower: false,
    muted: false,
  },
};

describe('Search HistoryItem Component', () => {
  const globalConfig = {
    plugins: [i18n],
    stubs: { Avatar: true, Icon: true, UiButton: true },
  };

  describe('User type', () => {
    it('renders user history item with avatar and name', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'user', content: mockUser },
        global: globalConfig,
      });
      expect(wrapper.text()).toContain('Test User');
      expect(wrapper.text()).toContain('@testuser');
    });

    it('links to user profile', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'user', content: mockUser },
        global: {
          ...globalConfig,
          stubs: {
            ...globalConfig.stubs,
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
          },
        },
      });
      expect(wrapper.find('a').attributes('href')).toBe('/profile/testuser');
    });

    it('emits delete event when delete button is clicked', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'user', content: mockUser },
        global: globalConfig,
      });
      await wrapper.findComponent({ name: 'UiButton' }).trigger('click');
      expect(wrapper.emitted('delete')).toBeTruthy();
      expect(wrapper.emitted('delete')).toHaveLength(1);
    });
  });

  describe('Search text type', () => {
    it('renders search text history item', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'search', content: 'vue testing' },
        global: globalConfig,
      });
      expect(wrapper.text()).toContain('vue testing');
    });

    it('links to search results page', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'search', content: 'nuxt framework' },
        global: {
          ...globalConfig,
          stubs: {
            ...globalConfig.stubs,
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
          },
        },
      });
      expect(wrapper.find('a').attributes('href')).toBe(
        `/search/top?q=${encodeURIComponent('nuxt framework')}`,
      );
    });

    it('displays search icon for search type', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'search', content: 'test query' },
        global: globalConfig,
      });
      expect(wrapper.html()).toContain('ic:outline-search');
    });
  });

  describe('Hashtag type', () => {
    it('renders hashtag', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'hashtag', content: 'javascript' },
        global: globalConfig,
      });
      expect(wrapper.text()).toContain('javascript');
    });

    it('links to hashtag search results', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'hashtag', content: 'vue' },
        global: {
          ...globalConfig,
          stubs: {
            ...globalConfig.stubs,
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
          },
        },
      });
      expect(wrapper.find('a').attributes('href')).toBe(
        `/search/top?q=${encodeURIComponent('vue')}`,
      );
    });
  });

  describe('Delete functionality', () => {
    it('emits delete event', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'search', content: 'test search' },
        global: globalConfig,
      });
      await wrapper.findComponent({ name: 'UiButton' }).trigger('click');
      expect(wrapper.emitted('delete')).toBeTruthy();
    });

    it('renders delete button with X icon', async () => {
      const wrapper = await mountSuspended(HistoryItem, {
        props: { type: 'search', content: 'test' },
        global: globalConfig,
      });
      const button = wrapper.findComponent({ name: 'UiButton' });
      expect(button.exists()).toBe(true);
    });
  });

  it('has hover styling classes', async () => {
    const wrapper = await mountSuspended(HistoryItem, {
      props: { type: 'search', content: 'test' },
      global: globalConfig,
    });
    expect(wrapper.find('a').classes()).toContain('hover:bg-accent');
  });
});
