/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ref, watch, watchEffect, onMounted } from 'vue';
import { useNotificationsList } from '@/composables/useNotificationsList';
import { notificationsService } from '@/services/notifications/notificationsService';
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';

vi.mock('@/services/notifications/notificationsService', () => {
  return {
    notificationsService: {
      getNotifications: vi.fn(),
      markAllSeen: vi.fn(),
    },
  };
});

vi.mock('@tanstack/vue-query', () => {
  return {
    useInfiniteQuery: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

vi.mock('@tanstack/vue-virtual', () => {
  return {
    useWindowVirtualizer: vi.fn(() => ({
      value: {
        getVirtualItems: () => [],
        getTotalSize: () => 0,
        measureElement: vi.fn(),
      },
    })),
  };
});

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: vi.fn(),
    onScopeDispose: vi.fn(),
    watchEffect: vi.fn(),
    watch: vi.fn(),
    nextTick: vi.fn().mockResolvedValue(undefined),
  };
});

describe('useNotificationsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.scrollTo for tests that trigger it
    window.scrollTo = vi.fn();
  });

  it('registers an infinite query and its queryFn calls notificationsService.getNotifications with expected args', async () => {
    // capture options passed to useInfiniteQuery
    let capturedOptions: any = null;
    const useInfiniteQueryMock = useInfiniteQuery as any;
    const useQueryClientMock = useQueryClient as any;

    useInfiniteQueryMock.mockImplementation((opts: any) => {
      capturedOptions = opts;
      return {
        data: ref({ pages: [] }),
        fetchNextPage: vi.fn(),
        hasNextPage: ref(false),
        isFetchingNextPage: ref(false),
        isLoading: ref(false),
      };
    });

    useQueryClientMock.mockReturnValue({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    });

    const lastNotification = ref(null);
    const unseenRef = ref<number>(0);

    useNotificationsList({
      queryKey: ['notifications-list'],
      filter: 'mentions',
      lastNotification,
      relatedQueryKeys: [],
      unseenRef,
    });

    expect(useInfiniteQueryMock).toHaveBeenCalled();
    expect(Array.isArray(capturedOptions.queryKey)).toBe(true);
    expect(capturedOptions.queryKey).toContain('notifications-list');

    (notificationsService.getNotifications as any).mockResolvedValue({
      data: [{ id: 'n1' }],
      pagination: { hasNextPage: false, nextCursor: null },
    });

    await capturedOptions.queryFn({ pageParam: null });

    expect(notificationsService.getNotifications).toHaveBeenCalledWith({
      cursor: null,
      limit: 20,
      filter: 'mentions',
    });
  });

  it('markAllSeen calls service, updates cache and resets unseenRef to 0', async () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    const useQueryClientMock = useQueryClient as any;
    const queryClient = { setQueryData: vi.fn(), invalidateQueries: vi.fn() };

    useQueryClientMock.mockReturnValue(queryClient);

    useInfiniteQueryMock.mockImplementation(() => {
      return {
        data: ref({ pages: [{ data: [{ id: '1', isSeen: false }] }] }),
        fetchNextPage: vi.fn(),
        hasNextPage: ref(false),
        isFetchingNextPage: ref(false),
        isLoading: ref(false),
      };
    });

    (notificationsService.markAllSeen as any).mockResolvedValue({ success: true });

    const lastNotification = ref(null);
    const unseenRef = ref<number>(5);

    const { markAllSeen } = useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification,
      relatedQueryKeys: [['related-key-1']],
      unseenRef,
    });

    // Capture the updater function to test its logic
    let updater: (oldData: any) => any;
    queryClient.setQueryData.mockImplementation((key, fn) => {
      updater = fn;
      const oldData = { pages: [{ data: [{ id: '1', isSeen: false }] }] };
      // Return the result of the updater to simulate cache update
      return updater(oldData);
    });

    await markAllSeen();

    expect(notificationsService.markAllSeen).toHaveBeenCalled();
    // Called for the main query key and the related query key
    expect(queryClient.setQueryData).toHaveBeenCalledTimes(2);
    expect(unseenRef.value).toBe(0);

    // Test the updater logic
    const oldDataWithUnseen = {
      pages: [
        {
          data: [
            { id: '1', isSeen: false },
            { id: '2', isSeen: false },
          ],
        },
      ],
    };
    const newData = updater(oldDataWithUnseen);
    expect(newData.pages[0].data.every((n: any) => n.isSeen)).toBe(true);

    // Test updater with invalid old data
    expect(updater(null)).toBe(null);
    expect(updater({})).toEqual({});
  });

  it('handles markAllSeen API failure gracefully', async () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    const useQueryClientMock = useQueryClient as any;
    const queryClient = { setQueryData: vi.fn() };
    console.error = vi.fn(); // Suppress console.error for this test

    useQueryClientMock.mockReturnValue(queryClient);
    useInfiniteQueryMock.mockReturnValue({ data: ref(null) });

    const apiError = new Error('API failed');
    (notificationsService.markAllSeen as any).mockRejectedValue(apiError);

    const unseenRef = ref(5);
    const { markAllSeen } = useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification: ref(null),
      unseenRef,
    });

    await markAllSeen();

    expect(notificationsService.markAllSeen).toHaveBeenCalled();
    // Cache should not be updated on failure
    expect(queryClient.setQueryData).not.toHaveBeenCalled();
    // Unseen count should not be reset
    expect(unseenRef.value).toBe(5);
    expect(console.error).toHaveBeenCalledWith('markAllSeen failed', apiError);
  });

  it('getPrimaryActor returns first preview actor or default when none exists', () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    const useQueryClientMock = useQueryClient as any;

    useInfiniteQueryMock.mockReturnValue({
      data: ref({ pages: [] }),
      fetchNextPage: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
    });

    useQueryClientMock.mockReturnValue({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    });

    const lastNotification = ref(null);

    const { getPrimaryActor } = useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification,
    });

    const actorSummary = {
      previewActors: [
        { username: 'user1', displayName: 'User One', avatarUrl: '/avatar1.png' },
        { username: 'user2', displayName: 'User Two', avatarUrl: '/avatar2.png' },
      ],
    };

    const result = getPrimaryActor(actorSummary);
    expect(result).toEqual({
      username: 'user1',
      displayName: 'User One',
      avatarUrl: '/avatar1.png',
    });

    const defaultResult = getPrimaryActor(null);
    expect(defaultResult).toEqual({
      username: 'unknown',
      displayName: 'Unknown',
      avatarUrl: '/default_profile.png',
    });
  });

  it('handles SSE notification updates by adding new notification to cache', async () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    const useQueryClientMock = useQueryClient as any;
    const queryClient = { setQueryData: vi.fn(), invalidateQueries: vi.fn() };

    useQueryClientMock.mockReturnValue(queryClient);

    useInfiniteQueryMock.mockReturnValue({
      data: ref({ pages: [{ data: [{ id: 'existing-1' }] }] }),
      fetchNextPage: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
    });

    const watchMock = watch as any;
    let sseWatchCallback: any = null;
    // There are two watchers on lastNotification. We need to capture the correct one.
    watchMock.mockImplementation((source: any, callback: any) => {
      if (source.toString().includes('lastNotification')) {
        // The SSE watcher is the one that calls setQueryData.
        // The other one calls nextTick and scrollTo.
        if (callback.toString().includes('setQueryData')) {
          sseWatchCallback = callback;
        }
      }
      return vi.fn(); // Return a cleanup function
    });

    const lastNotification = ref(null);

    useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification,
    });

    // Simulate SSE notification
    const newNotification = { id: 'new-notification', content: 'New message' };
    lastNotification.value = newNotification as any;

    // Manually trigger the watch callback
    if (sseWatchCallback) {
      sseWatchCallback(newNotification, null);
    }

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ['notifications-list'],
      expect.any(Function),
    );
  });

  it('does not add duplicate notifications from SSE updates', () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    const useQueryClientMock = useQueryClient as any;
    const queryClient = { setQueryData: vi.fn() };

    useQueryClientMock.mockReturnValue(queryClient);

    const existingNotification = { id: 'existing-1' };
    useInfiniteQueryMock.mockReturnValue({
      data: ref({ pages: [{ data: [existingNotification] }] }),
      fetchNextPage: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
    });

    const watchMock = watch as any;
    let sseWatchCallback: any = null;
    watchMock.mockImplementation((source: any, callback: any) => {
      if (source.toString().includes('lastNotification')) {
        if (callback.toString().includes('setQueryData')) {
          sseWatchCallback = callback;
        }
      }
      return vi.fn(); // Return a cleanup function
    });

    // Mock setQueryData to capture the updater function
    let capturedUpdater: any = null;
    queryClient.setQueryData.mockImplementation((key, updater) => {
      capturedUpdater = updater;
    });

    const lastNotification = ref(null);

    useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification,
    });

    // Simulate trying to add the same notification again
    lastNotification.value = existingNotification as any;

    // Manually trigger the watch callback
    if (sseWatchCallback) {
      sseWatchCallback(existingNotification, null);
    }

    // If the callback was not triggered, the updater would not be captured.
    expect(capturedUpdater).not.toBeNull();

    // Execute the updater function with existing data
    const oldData = { pages: [{ data: [existingNotification] }] };
    const result = capturedUpdater(oldData);

    // Should return unchanged data since notification already exists
    expect(result).toBe(oldData);
  });

  it('computes notifications correctly from paginated response data', () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    const useQueryClientMock = useQueryClient as any;

    const mockPages = [
      {
        data: [
          { id: '1', content: 'First' },
          { id: '2', content: 'Second' },
        ],
      },
      { data: [{ id: '3', content: 'Third' }] },
    ];

    useInfiniteQueryMock.mockReturnValue({
      data: ref({ pages: mockPages }),
      fetchNextPage: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
    });

    useQueryClientMock.mockReturnValue({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    });

    const lastNotification = ref(null);

    const { notifications } = useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification,
    });

    expect(notifications.value).toHaveLength(3);
    expect(notifications.value[0]).toEqual({ id: '1', content: 'First' });
    expect(notifications.value[1]).toEqual({ id: '2', content: 'Second' });
    expect(notifications.value[2]).toEqual({ id: '3', content: 'Third' });
  });

  it('handles virtualizer auto-fetch when scrolling near bottom', () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    const useQueryClientMock = useQueryClient as any;
    const fetchNextPageMock = vi.fn();

    const useWindowVirtualizerMock = useWindowVirtualizer as any;
    const mockVirtualizer = {
      getVirtualItems: vi.fn(() => [
        { index: 17 }, // Near the end of 20 items
      ]),
      getTotalSize: vi.fn(() => 2000),
      measureElement: vi.fn(),
    };

    useWindowVirtualizerMock.mockReturnValue({
      value: mockVirtualizer,
    });

    useInfiniteQueryMock.mockReturnValue({
      data: ref({
        pages: [
          {
            data: Array(20)
              .fill(null)
              .map((_, i) => ({ id: `n${i}` })),
          },
        ],
      }),
      fetchNextPage: fetchNextPageMock,
      hasNextPage: ref(true),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
    });

    useQueryClientMock.mockReturnValue({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    });

    const watchEffectMock = watchEffect as any;
    let watchEffectCallback: any = null;
    watchEffectMock.mockImplementation((callback: any) => {
      watchEffectCallback = callback;
      return vi.fn(); // Return a cleanup function
    });

    const lastNotification = ref(null);

    useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification,
    });

    // Execute the watchEffect callback manually
    if (watchEffectCallback) {
      watchEffectCallback();
    }

    expect(fetchNextPageMock).toHaveBeenCalled();
  });

  it('calls measureElement on the virtualizer instance', () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    useInfiniteQueryMock.mockReturnValue({ data: ref({ pages: [] }) });
    (useQueryClient as any).mockReturnValue({ setQueryData: vi.fn() });

    const virtualizerMeasureElement = vi.fn();
    const useWindowVirtualizerMock = useWindowVirtualizer as any;
    useWindowVirtualizerMock.mockReturnValue({
      value: {
        getVirtualItems: () => [],
        getTotalSize: () => 0,
        measureElement: virtualizerMeasureElement,
      },
    });

    const { measureElement } = useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification: ref(null),
    });

    // Test with null
    measureElement(null);
    expect(virtualizerMeasureElement).not.toHaveBeenCalled();

    // Test with an HTML Element
    const el = document.createElement('div');
    measureElement(el);
    expect(virtualizerMeasureElement).toHaveBeenCalledWith(el);

    // Test with a Vue component instance
    const componentEl = document.createElement('p');
    const vueComponent = { $el: componentEl };
    measureElement(vueComponent as any);
    expect(virtualizerMeasureElement).toHaveBeenCalledWith(componentEl);
  });

  it('updates parentOffsetRef on mount', () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    useInfiniteQueryMock.mockReturnValue({ data: ref({ pages: [] }) });
    (useQueryClient as any).mockReturnValue({ setQueryData: vi.fn() });

    let onMountedCallback: () => void = () => {};
    (onMounted as any).mockImplementation((cb: any) => {
      onMountedCallback = cb;
    });

    const { parentRef } = useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification: ref(null),
    });

    // Simulate the parent element being set
    parentRef.value = { offsetTop: 123 } as HTMLElement;

    // Trigger the onMounted hook
    onMountedCallback();
    expect(onMounted).toHaveBeenCalled();
  });

  it('scrolls to top when a new notification arrives via SSE', async () => {
    const useInfiniteQueryMock = useInfiniteQuery as any;
    useInfiniteQueryMock.mockReturnValue({ data: ref({ pages: [] }) });
    (useQueryClient as any).mockReturnValue({ setQueryData: vi.fn() });

    const watchMock = watch as any;
    let scrollWatchCallback: any = null;
    watchMock.mockImplementation((source: any, callback: any) => {
      if (source.toString().includes('lastNotification')) {
        // The scroll watcher is the one that calls nextTick
        if (callback.toString().includes('nextTick')) {
          scrollWatchCallback = callback;
        }
      }
      return vi.fn();
    });

    const lastNotification = ref(null);
    useNotificationsList({
      queryKey: ['notifications-list'],
      lastNotification,
    });

    // Simulate new notification
    lastNotification.value = { id: 'new-notif' } as any;

    // Manually trigger the watcher
    if (scrollWatchCallback) {
      await scrollWatchCallback();
    }

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
