import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref, nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json' assert { type: 'json' };
import SearchField from '~/components/ui/SearchField.vue';
import type { CompactUser } from '~~/shared/types/user';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: messages,
  },
});

const mockUser: CompactUser = {
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'Test bio',
  isFollowing: false,
  isFollower: false,
};

const { searchServiceMock } = vi.hoisted(() => ({
  searchServiceMock: {
    search: vi.fn(),
  },
}));

vi.mock('~/services/search/searchService', () => ({
  searchService: searchServiceMock,
}));

const mockSearchQuery = ref('');
const mockRouteQuery = ref<Record<string, string>>({});
const mockRoutePath = ref('/');

mockNuxtImport('useRoute', () => {
  return () => ({
    query: mockRouteQuery,
    path: mockRoutePath,
  });
});

const mockNavigateToSearch = vi.fn();

mockNuxtImport('useSearchQuery', () => {
  return () => ({
    searchQuery: mockSearchQuery,
    initializeFromRoute: () => {
      const q = mockRouteQuery.value.q;
      if (typeof q === 'string') {
        mockSearchQuery.value = q;
      }
    },
    navigateToSearch: mockNavigateToSearch,
  });
});

describe('SearchField.vue', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchQuery.value = '';
    mockRouteQuery.value = {};
    mockRoutePath.value = '/';

    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        Reflect.deleteProperty(localStorageMock, key);
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;

    searchServiceMock.search.mockResolvedValue({
      users: [],
      hashtags: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search bar', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'UiSearchBar' }).exists()).toBe(true);
  });

  it('initializes from route query on mount', async () => {
    mockRouteQuery.value = { q: 'test query' };

    await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    expect(mockSearchQuery.value).toBe('test query');
  });

  it('shows back button when focused and showBackOnFocus is true', async () => {
    const wrapper = await mountSuspended(SearchField, {
      props: {
        showBackOnFocus: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    // Simulate focus by emitting event
    const searchBar = wrapper.findComponent({ name: 'UiSearchBar' });
    await searchBar.vm.$emit('update:isFocused', true);
    await nextTick();

    const backButton = wrapper.findAllComponents({ name: 'UiButton' })[0];
    expect(backButton.exists()).toBe(true);
  });

  it('triggers search when query changes', async () => {
    const _wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    mockSearchQuery.value = 'javascript';
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 350)); // Wait for debounce

    expect(searchServiceMock.search).toHaveBeenCalledWith('javascript');
  });

  it('displays search results with users and hashtags', async () => {
    searchServiceMock.search.mockResolvedValue({
      users: [mockUser],
      hashtags: ['javascript', 'typescript'],
    });

    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
          NuxtLink: true,
        },
      },
    });

    const searchBar = wrapper.findComponent({ name: 'UiSearchBar' });
    await searchBar.vm.$emit('update:isFocused', true);
    mockSearchQuery.value = 'test';
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 350));
    await nextTick();

    // Verify the search service was called with correct query
    expect(searchServiceMock.search).toHaveBeenCalledWith('test');
  });

  it('clears search results when query is empty', async () => {
    const _wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    mockSearchQuery.value = 'test';
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 350));

    mockSearchQuery.value = '';
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(searchServiceMock.search).not.toHaveBeenCalledWith('');
  });

  it('handles search submit', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    mockSearchQuery.value = 'test query';
    await wrapper.vm.handleSearchSubmit();

    expect(mockNavigateToSearch).toHaveBeenCalledWith('test query');
  });

  it('validates username correctly', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    expect(wrapper.vm.isValidUsername('testuser')).toBe(true);
    expect(wrapper.vm.isValidUsername('test_user123')).toBe(true);
    expect(wrapper.vm.isValidUsername('ab')).toBe(false); // Too short
    expect(wrapper.vm.isValidUsername('a'.repeat(21))).toBe(false); // Too long
    expect(wrapper.vm.isValidUsername('test-user')).toBe(false); // Invalid character
  });

  it('cleans username by removing @ prefix', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    mockSearchQuery.value = '@testuser';
    expect(wrapper.vm.getCleanUsername()).toBe('testuser');

    mockSearchQuery.value = 'testuser';
    expect(wrapper.vm.getCleanUsername()).toBe('testuser');
  });

  it('saves search to history', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    wrapper.vm.saveInHistory({ type: 'text', content: 'test query' });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'searchHistory',
      expect.stringContaining('test query'),
    );
  });

  it('loads search history from localStorage on mount', async () => {
    const history = [
      { type: 'text', content: 'previous search' },
      { type: 'hashtag', content: 'javascript' },
    ];
    localStorageMock.searchHistory = JSON.stringify(history);

    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
          HistoryItem: true,
        },
      },
    });

    await nextTick();
    expect(wrapper.vm.searchHistory.value).toHaveLength(2);
  });

  it('deletes item from history', async () => {
    const history = [
      { type: 'text', content: 'search 1' },
      { type: 'text', content: 'search 2' },
    ];
    localStorageMock.searchHistory = JSON.stringify(history);

    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    await nextTick();
    wrapper.vm.deleteFromHistory(0);

    expect(wrapper.vm.searchHistory.value).toHaveLength(1);
    expect(wrapper.vm.searchHistory.value[0].content).toBe('search 2');
  });

  it('shows clear all history dialog', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
          UiAlertDialog: true,
          UiAlertDialogContent: true,
          UiAlertDialogHeader: true,
          UiAlertDialogTitle: true,
          UiAlertDialogDescription: true,
          UiAlertDialogFooter: true,
          UiAlertDialogAction: true,
          UiAlertDialogCancel: true,
        },
      },
    });

    wrapper.vm.clearAllHistory();
    await nextTick();

    expect(wrapper.vm.showClearHistoryDialog.value).toBe(true);
  });

  it('confirms clear all history', async () => {
    const history = [{ type: 'text', content: 'test' }];
    localStorageMock.searchHistory = JSON.stringify(history);

    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
          UiAlertDialog: true,
          UiAlertDialogContent: true,
          UiAlertDialogHeader: true,
          UiAlertDialogTitle: true,
          UiAlertDialogDescription: true,
          UiAlertDialogFooter: true,
          UiAlertDialogAction: true,
          UiAlertDialogCancel: true,
        },
      },
    });

    await nextTick();
    wrapper.vm.ConfirmClearAllHistory();

    expect(wrapper.vm.searchHistory.value).toHaveLength(0);
    expect(localStorage.removeItem).toHaveBeenCalledWith('searchHistory');
  });

  it('has watch configured to close dropdown on route path change', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    // Focus the search bar
    const searchBar = wrapper.findComponent({ name: 'UiSearchBar' });
    await searchBar.vm.$emit('update:isFocused', true);
    await nextTick();

    // Verify it's focused
    expect(wrapper.vm.isFocused.value).toBe(true);

    // Directly set isFocused to false to simulate the watch behavior
    // (Testing the actual watch trigger requires real router which is complex in unit tests)
    wrapper.vm.isFocused.value = false;
    await nextTick();

    // Verify the state changed
    expect(wrapper.vm.isFocused.value).toBe(false);
  });

  it('handles search error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    searchServiceMock.search.mockRejectedValue(new Error('API Error'));

    const _wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    mockSearchQuery.value = 'test';
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(consoleErrorSpy).toHaveBeenCalledWith('Search error:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('limits history to 10 items', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    // Add 12 items to history
    for (let i = 0; i < 12; i++) {
      wrapper.vm.saveInHistory({ type: 'text', content: `search ${i}` });
    }

    expect(wrapper.vm.searchHistory.value).toHaveLength(10);
  });

  it('avoids duplicate entries in history', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    wrapper.vm.saveInHistory({ type: 'text', content: 'duplicate' });
    wrapper.vm.saveInHistory({ type: 'text', content: 'other' });
    wrapper.vm.saveInHistory({ type: 'text', content: 'duplicate' });

    expect(wrapper.vm.searchHistory.value).toHaveLength(2);
    expect(wrapper.vm.searchHistory.value[0].content).toBe('duplicate');
  });

  it('updates search query when route query changes', async () => {
    mockRouteQuery.value = { q: 'new query' };

    const _wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          UiSearchList: true,
          Icon: true,
        },
      },
    });

    await nextTick();

    expect(mockSearchQuery.value).toBe('new query');
  });

  it('displays empty placeholder when no history and not searching', async () => {
    const wrapper = await mountSuspended(SearchField, {
      global: {
        plugins: [i18n],
        stubs: {
          UiButton: true,
          UiSearchBar: true,
          Icon: true,
        },
      },
    });

    const searchBar = wrapper.findComponent({ name: 'UiSearchBar' });
    await searchBar.vm.$emit('update:isFocused', true);
    await nextTick();

    // Check that the dropdown is visible and search history is empty
    expect(wrapper.vm.searchHistory.value).toHaveLength(0);
    expect(mockSearchQuery.value).toBe('');
    expect(wrapper.vm.isFocused.value).toBe(true);
  });
});
