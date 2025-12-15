import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import messages from '@@/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import UserRow from '~/components/user/UserRow.vue';
import { ref } from 'vue';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const genUsers = (count: number) => {
  const users = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      username: `user${i}`,
      displayName: `User ${i}`,
      bio: `Bio of user ${i}`,
      bioEntities: null,
      avatarUrl: `https://example.com/avatar${i}.jpg`,
      relationship: {
        following: false,
        follower: false,
        muted: false,
        blocking: false,
        blockedBy: false,
      },
    });
  }
  return users;
};

const virtualItems: Array<{ index: number; key: string; start: number }> = [
  {
    index: 0,
    key: '0',
    start: 0,
  },
  {
    index: 1,
    key: '1',
    start: 100,
  },
];

const useVirtualizerMock = vi.hoisted(() => ({
  value: {
    getVirtualItems: vi.fn(() => virtualItems),
    getTotalSize: () => 1000,
    options: { scrollMargin: 0 },
    measureElement: vi.fn(),
  },
  options: { scrollMargin: 0 },
}));

vi.mock('@tanstack/vue-virtual', () => ({
  useWindowVirtualizer: () => useVirtualizerMock,
}));

vi.mock('@tanstack/vue-query', async (actualImport) => {
  const original = await actualImport<typeof import('@tanstack/vue-query')>();
  return {
    ...original,
    useInfiniteQuery: vi.fn(() => {
      const pages = [
        {
          data: genUsers(5),
          pagination: { hasNextPage: true, nextCursor: 'cursor2' },
        },
      ];

      return {
        data: ref({ pages }),
        hasNextPage: ref(true),
        fetchNextPage: vi.fn(),
        isFetchingNextPage: ref(false),
        isLoading: ref(false),
      };
    }),
  };
});

describe('UserList Component', () => {
  it('renders user rows', async () => {
    const { default: UserList } = await import('~/components/user/UserList.vue');
    const wrapper = await mountSuspended(UserList, {
      props: {
        fetcherFn: async () => {
          return {
            success: true,
            data: [],
          };
        },
        queryKeySuffix: 'test-users',
        currentUsername: 'currentuser',
        emptyDescription: 'No users found.',
        emptyTitle: 'No Users',
      },
      global: {
        plugins: [i18n],
      },
    });

    const userRows = wrapper.findAllComponents(UserRow);
    expect(userRows.length).toBe(2);
    expect(userRows[0]?.props('user').username).toBe('user1');
    expect(userRows[1]?.props('user').username).toBe('user2');
  });

  it('renders empty state when no users are found', async () => {
    const { default: UserList } = await import('~/components/user/UserList.vue');
    const useInfiniteQuery = (await import('@tanstack/vue-query')).useInfiniteQuery;
    vi.mocked(useInfiniteQuery).mockImplementation(() => {
      return {
        data: ref({ pages: [{ data: [] }] }),
        hasNextPage: ref(false),
        fetchNextPage: vi.fn(),
        isFetchingNextPage: ref(false),
        isLoading: ref(false),
      } as unknown as ReturnType<typeof useInfiniteQuery>;
    });
    const wrapper = await mountSuspended(UserList, {
      props: {
        fetcherFn: async () => {
          return {
            success: true,
            data: [],
          };
        },
        queryKeySuffix: 'empty-users',
        currentUsername: 'currentuser',
        emptyDescription: 'No users found.',
        emptyTitle: 'No Users',
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.text()).toContain('No Users');
    expect(wrapper.text()).toContain('No users found.');
  });
});
