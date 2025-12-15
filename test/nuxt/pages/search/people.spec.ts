import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import PeoplePage from '~/pages/search/people.vue';
import { ref } from 'vue';

const { searchServiceMock } = vi.hoisted(() => ({
  searchServiceMock: {
    getPeople: vi.fn(),
  },
}));

vi.mock('~/services/search/searchService', () => ({
  searchService: searchServiceMock,
}));

const searchStoreMock = vi.hoisted(() => ({
  excludeMutedAndBlocked: false,
}));

const mockSearchQuery = ref('');
const mockRouteQuery = ref<Record<string, string>>({});

mockNuxtImport('useSearchStore', () => {
  return () => searchStoreMock;
});

mockNuxtImport('useRoute', () => {
  return () => ({
    query: mockRouteQuery.value,
  });
});

mockNuxtImport('useSearchQuery', () => {
  return () => ({
    searchQuery: mockSearchQuery,
    initializeFromRoute: () => {
      const q = mockRouteQuery.value.q;
      if (typeof q === 'string') {
        mockSearchQuery.value = q;
      }
    },
  });
});

describe('Search people.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchQuery.value = '';
    mockRouteQuery.value = {};
    searchServiceMock.getPeople.mockResolvedValue({
      data: [],
      pagination: { cursor: null, nextCursor: null, hasNextPage: false },
    });
  });

  it('renders UserList component', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    const wrapper = await mountSuspended(PeoplePage, {
      route: '/search/people?q=test',
      global: {
        stubs: {
          UserList: true,
        },
      },
    });

    const userList = wrapper.findComponent({ name: 'UserList' });
    expect(userList.exists()).toBe(true);
  });

  it('passes correct props to UserList', async () => {
    mockRouteQuery.value = { q: 'javascript' };
    mockSearchQuery.value = 'javascript';

    const wrapper = await mountSuspended(PeoplePage, {
      route: '/search/people?q=javascript',
      global: {
        stubs: {
          UserList: true,
        },
      },
    });

    const userList = wrapper.findComponent({ name: 'UserList' });
    expect(userList.props('currentUsername')).toBe('search');
    expect(userList.props('showDropdown')).toBe(false);
    expect(userList.props('queryKeySuffix')).toContain('search-people');
    expect(userList.props('queryKeySuffix')).toContain('javascript');
  });

  it('fetcher function calls searchService.getPeople with correct parameters', async () => {
    mockRouteQuery.value = { q: 'javascript' };
    mockSearchQuery.value = 'javascript';

    const wrapper = await mountSuspended(PeoplePage, {
      route: '/search/people?q=javascript',
      global: {
        stubs: {
          UserList: true,
        },
      },
    });

    const userList = wrapper.findComponent({ name: 'UserList' });
    const fetcherFn = userList.props('fetcherFn');

    // Call the fetcher function
    const signal = new AbortController().signal;
    await fetcherFn(null, signal);

    expect(searchServiceMock.getPeople).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'javascript',
        pagination: { cursor: null },
        peopleFilter: 'anyone',
        excludeMutedAndBlocked: false,
      }),
      signal,
    );
  });

  it('respects peopleFilter parameter', async () => {
    mockRouteQuery.value = { q: 'test', pf: 'on' };
    mockSearchQuery.value = 'test';

    const wrapper = await mountSuspended(PeoplePage, {
      route: '/search/people?q=test&pf=on',
      global: {
        stubs: {
          UserList: true,
        },
      },
    });

    const userList = wrapper.findComponent({ name: 'UserList' });
    const fetcherFn = userList.props('fetcherFn');

    const signal = new AbortController().signal;
    await fetcherFn(null, signal);

    expect(searchServiceMock.getPeople).toHaveBeenCalledWith(
      expect.objectContaining({
        peopleFilter: 'following',
      }),
      signal,
    );
  });

  it('respects excludeMutedAndBlocked from store', async () => {
    searchStoreMock.excludeMutedAndBlocked = true;

    const wrapper = await mountSuspended(PeoplePage, {
      route: '/search/people?q=test',
      global: {
        stubs: {
          UserList: true,
        },
      },
    });

    const userList = wrapper.findComponent({ name: 'UserList' });
    const fetcherFn = userList.props('fetcherFn');

    const signal = new AbortController().signal;
    await fetcherFn(null, signal);

    expect(searchServiceMock.getPeople).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeMutedAndBlocked: true,
      }),
      signal,
    );

    // Reset for other tests
    searchStoreMock.excludeMutedAndBlocked = false;
  });

  it('updates fetcher when query parameter changes', async () => {
    mockRouteQuery.value = { q: 'initial' };
    mockSearchQuery.value = 'initial';

    const wrapper = await mountSuspended(PeoplePage, {
      route: '/search/people?q=initial',
      global: {
        stubs: {
          UserList: true,
        },
      },
    });

    // Update the search query
    mockRouteQuery.value = { q: 'updated' };
    mockSearchQuery.value = 'updated';
    await wrapper.vm.$nextTick();

    const userList = wrapper.findComponent({ name: 'UserList' });
    const fetcherFn = userList.props('fetcherFn');

    const signal = new AbortController().signal;
    await fetcherFn(null, signal);

    expect(searchServiceMock.getPeople).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'updated',
      }),
      signal,
    );
  });

  it('handles non-string query parameter', async () => {
    mockRouteQuery.value = { q: ['array', 'query'] as unknown as string };
    mockSearchQuery.value = 'test';

    const wrapper = await mountSuspended(PeoplePage, {
      route: '/search/people',
      global: {
        stubs: {
          UserList: true,
        },
      },
    });

    // searchQuery should not be updated if route.query.q is not a string
    const userList = wrapper.findComponent({ name: 'UserList' });
    expect(userList.exists()).toBe(true);
  });
});
