import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import TweetDropdown from '~/components/tweet/TweetDropdown.vue';
import { deleteTweet } from '~/services/tweet/actionButtonsService';
import { showToaster } from '~/utils/showToaster';
import { useQueryClient } from '@tanstack/vue-query';
import type { Tweet } from '~~/shared/types/tweets';

// Mocks
vi.mock('~/services/tweet/actionButtonsService', () => ({
  deleteTweet: vi.fn(),
}));
vi.mock('~/utils/showToaster', () => ({
  showToaster: vi.fn(),
}));
vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: vi.fn(),
}));

// Mock vue-i18n composable to avoid plugin install requirement
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

const mockSetQueriesData = vi.fn();
const useQueryClientMock = useQueryClient as unknown as Mock;
useQueryClientMock.mockReturnValue({
  setQueriesData: mockSetQueriesData,
});

const mockTweet: Tweet = {
  id: '123',
  content: 'Hello world',
  createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
  author: {
    username: 'authorUser',
    displayName: 'Author User',
    avatarUrl: 'avatar.jpg',
    isFollowing: false,
    isFollower: false,
  },
  replyCount: 0,
  retweetCount: 0,
  likeCount: 0,
  isLiked: false,
  isRetweeted: false,
  entities: { mentions: [], hashtags: [] },
  media: [],
};

const globalStubs = {
  UiAlertDialog: { template: '<div><slot /></div>' },
  UiDropdownMenu: { template: '<div><slot /></div>' },
  UiDropdownMenuTrigger: { template: '<div><slot /></div>' },
  UiDropdownMenuContent: { template: '<div><slot /></div>' },
  UiDropdownMenuItem: { template: '<div><slot /></div>' },
  UiAlertDialogTrigger: { template: '<div><slot /></div>' },
  UiAlertDialogContent: { template: '<div><slot /></div>' },
  UiAlertDialogHeader: { template: '<div><slot /></div>' },
  UiAlertDialogTitle: { template: '<div><slot /></div>' },
  UiAlertDialogDescription: { template: '<div><slot /></div>' },
  UiAlertDialogFooter: { template: '<div><slot /></div>' },
  UiAlertDialogAction: {
    name: 'UiAlertDialogAction',
    template: '<button class="action-delete" @click="$emit(\'click\')"><slot /></button>',
  },
  UiAlertDialogCancel: { template: '<div><slot /></div>' },
  NuxtLink: { template: '<a><slot /></a>' },
  Icon: { template: '<span></span>' },
};

const globalMocks = {
  $t: (key: string) => key,
};

describe('TweetDropdown', () => {
  function assertDefined<T>(value: T, message?: string): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
      throw new Error(message ?? 'Expected value to be defined');
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(TweetDropdown, {
      props: {
        tweet: mockTweet,
        username: 'otherUser',
      },
      global: {
        stubs: globalStubs,
        mocks: globalMocks,
      },
      slots: {
        default: '<button>Trigger</button>',
      },
    });

    expect(wrapper.find('button').text()).toBe('Trigger');
    // NuxtLink is stubbed as an <a> element in tests
    expect(wrapper.find('a').exists()).toBe(true);
  });

  it('shows delete option when user is author', async () => {
    const wrapper = await mountSuspended(TweetDropdown, {
      props: {
        tweet: mockTweet,
        username: 'authorUser',
      },
      global: {
        stubs: globalStubs,
        mocks: globalMocks,
      },
    });

    expect(wrapper.text()).toContain('tweet.delete-tweet');
  });

  it('does not show delete option when user is not author', async () => {
    const wrapper = await mountSuspended(TweetDropdown, {
      props: {
        tweet: mockTweet,
        username: 'otherUser',
      },
      global: {
        stubs: globalStubs,
        mocks: globalMocks,
      },
    });

    expect(wrapper.text()).not.toContain('tweet.delete-tweet');
  });

  it('handles delete success', async () => {
    (deleteTweet as unknown as Mock).mockResolvedValue({});
    const wrapper = await mountSuspended(TweetDropdown, {
      props: {
        tweet: mockTweet,
        username: 'authorUser',
      },
      global: {
        stubs: globalStubs,
        mocks: globalMocks,
      },
    });

    const deleteAction = wrapper.find('.action-delete');
    await deleteAction.trigger('click');

    expect(deleteTweet).toHaveBeenCalledWith('123');
    expect(showToaster).toHaveBeenCalledWith('success', 'tweet.delete-success');

    // Check query updates (at least once per expected key)
    expect(mockSetQueriesData.mock.calls.length).toBeGreaterThanOrEqual(6);

    // Verify keys
    const calls = mockSetQueriesData.mock.calls;
    const keys = calls
      .map((call) => (call[0] as { queryKey?: unknown[] }).queryKey)
      .filter((k): k is unknown[] => Array.isArray(k));
    expect(keys).toContainEqual(['for-you']);
    expect(keys).toContainEqual(['following']);
    expect(keys).toContainEqual(['profile', 'authorUser', 'tweets']);
  });

  it('handles delete error', async () => {
    (deleteTweet as unknown as Mock).mockRejectedValue(new Error('Failed'));
    const wrapper = await mountSuspended(TweetDropdown, {
      props: {
        tweet: mockTweet,
        username: 'authorUser',
      },
      global: {
        stubs: globalStubs,
        mocks: globalMocks,
      },
    });

    const deleteAction = wrapper.find('.action-delete');
    await deleteAction.trigger('click');

    expect(deleteTweet).toHaveBeenCalledWith('123');
    expect(showToaster).toHaveBeenCalledWith('error', 'tweet.delete-error');
    expect(mockSetQueriesData).not.toHaveBeenCalled();
  });

  it('updates cache correctly via removeTweetFromInfiniteData', async () => {
    (deleteTweet as unknown as Mock).mockResolvedValue({});
    const wrapper = await mountSuspended(TweetDropdown, {
      props: {
        tweet: mockTweet,
        username: 'authorUser',
      },
      global: {
        stubs: globalStubs,
        mocks: globalMocks,
      },
    });

    await wrapper.find('.action-delete').trigger('click');

    // Verify the callback passed to setQueriesData
    // We grab the first call's updater function
    expect(mockSetQueriesData).toHaveBeenCalled();
    const updater = mockSetQueriesData.mock.calls[0]?.[1] as
      | ((oldData: unknown) => unknown)
      | undefined;
    if (!updater) throw new Error('Expected updater to be defined');

    const oldData = {
      pages: [{ data: [{ id: '123' }, { id: '456' }] }, { data: [{ id: '789' }] }],
    };

    const newData = updater(oldData) as { pages: Array<{ data: Array<{ id: string }> }> };
    assertDefined(newData.pages, 'pages should be defined');
    assertDefined(newData.pages[0], 'first page should be defined');
    assertDefined(newData.pages[1], 'second page should be defined');
    assertDefined(newData.pages[0].data, 'first page data should be defined');
    assertDefined(newData.pages[1].data, 'second page data should be defined');
    expect(newData.pages[0].data).toHaveLength(1);
    expect(newData.pages[1].data).toHaveLength(1);
    const firstItemP0 = newData.pages[0].data[0]!;
    const firstItemP1 = newData.pages[1].data[0]!;
    expect(firstItemP0.id).toBe('456');
    expect(firstItemP1.id).toBe('789');

    // Test edge cases for the updater
    expect(updater(undefined)).toBeUndefined();
    expect(updater({})).toEqual({});
  });
});
