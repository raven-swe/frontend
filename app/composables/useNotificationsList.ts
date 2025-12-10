import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import type { Ref, ComponentPublicInstance } from 'vue';
import type {
  Notification,
  ActorSummary,
  ActorSummaryContainer,
} from '~~/shared/types/notifications';
import { notificationsService } from '~/services/notifications/notificationsService';

type QueryPages = {
  pages?: Array<{ data?: Notification[] }>;
} & Record<string, unknown>;
type ApiPage = {
  data?: unknown[];
  pagination?: { hasNextPage?: boolean; nextCursor?: string | null };
} & Record<string, unknown>;

export function useNotificationsList(options: {
  queryKey: unknown[];
  filter?: string | null;
  lastNotification: Ref<Notification | null>;
  relatedQueryKeys?: unknown[][];
  unseenRef?: Ref<number> | null;
}) {
  const {
    queryKey,
    filter = 'all',
    lastNotification,
    relatedQueryKeys = [],
    unseenRef = null,
  } = options;
  const queryClient = useQueryClient();

  // Infinite Query
  const {
    data: response,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam = null }) =>
      notificationsService.getNotifications({
        cursor: pageParam,
        limit: 20,
        filter: filter ?? undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
    structuralSharing: false,
    retry: false,
  });

  const notifications = computed<Notification[]>(() => {
    const pages = (response.value?.pages as unknown as ApiPage[]) ?? [];
    const items = pages.flatMap((p) => (p.data ?? []) as Notification[]);
    return items;
  });

  // Virtualizer
  const parentRef = ref<HTMLElement | null>(null);
  const parentOffsetRef = ref(0);

  onMounted(() => {
    parentOffsetRef.value = parentRef.value?.offsetTop ?? 0;
  });

  const rowVirtualizerOptions = computed(() => ({
    count: hasNextPage.value ? notifications.value.length + 1 : notifications.value.length,
    estimateSize: () => 100,
    overscan: 3,
    scrollMargin: parentOffsetRef.value,
    getItemKey: (index: number) => notifications.value[index]?.id || index,
  }));

  const rowVirtualizer = useWindowVirtualizer(rowVirtualizerOptions);

  const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
  const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

  const measureElement = (el: Element | ComponentPublicInstance | null) => {
    if (!el) return;
    const element = 'nodeType' in el ? el : (el as ComponentPublicInstance).$el;
    rowVirtualizer.value.measureElement(element);
  };

  // Auto-fetch more when near bottom
  watchEffect(() => {
    const [lastItem] = [...virtualRows.value].reverse();
    if (
      lastItem &&
      lastItem.index >= notifications.value.length - 3 &&
      hasNextPage.value &&
      !isFetchingNextPage.value
    ) {
      fetchNextPage();
    }
  });

  // SSE
  watch(
    () => lastNotification.value,
    (notif) => {
      if (!notif) return;
      queryClient.setQueryData(queryKey, (oldData: unknown) => {
        const od = oldData as QueryPages;
        if (!od?.pages?.length) return oldData;

        const firstPage = od.pages[0];
        const exists = od.pages.some((page) =>
          page.data?.some((n: Notification) => n.id === notif.id),
        );
        if (exists) return oldData;

        return {
          ...od,
          pages: [
            {
              ...firstPage,
              data: [notif, ...(firstPage?.data ?? [])],
            },
            ...od.pages.slice(1),
          ],
        };
      });
    },
  );

  // Scroll to top on new notification
  watch(
    () => lastNotification.value,
    async () => {
      await nextTick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  );

  // markAllSeen
  const setAllSeenOnCache = (key: unknown[]) => {
    queryClient.setQueryData(key, (oldData: unknown) => {
      const od = oldData as QueryPages;
      if (!od || !od.pages) return oldData;
      return {
        ...od,
        pages: od.pages.map((page) => ({
          ...page,
          data: page.data?.map((n: Notification) => ({ ...n, isSeen: true })),
        })),
      };
    });
  };

  const markAllSeen = async () => {
    try {
      await notificationsService.markAllSeen();
      setAllSeenOnCache(queryKey);

      relatedQueryKeys.forEach((key) => {
        setAllSeenOnCache(key);
      });

      if (unseenRef) unseenRef.value = 0;
    } catch (err) {
      console.error('markAllSeen failed', err);
    }
  };

  const getPrimaryActor = (actorSummary?: ActorSummaryContainer | null): ActorSummary => {
    return (
      actorSummary?.previewActors?.[0] ?? {
        username: 'unknown',
        displayName: 'Unknown',
        avatarUrl: '/default_profile.png',
      }
    );
  };

  return {
    notifications,
    virtualRows,
    totalSize,

    parentRef,
    measureElement,

    hasNextPage,
    isFetchingNextPage,
    isLoading,

    markAllSeen,
    getPrimaryActor,
  };
}
