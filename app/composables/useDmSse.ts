import type { DmSseEventMap } from '~~/shared/types/dm';
import { EventSourcePolyfill } from 'event-source-polyfill';
import type { Notification } from '~~/shared/types/notifications';
import { useQueryClient } from '@tanstack/vue-query';
import { updateConversationLastMessage } from '~/composables/useDmConversations';

interface UseDmSseOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  baseReconnectDelay?: number;
}

export function useDmSse(options: UseDmSseOptions = {}) {
  const { autoReconnect = true, maxReconnectAttempts = 5, baseReconnectDelay = 1000 } = options;

  const SSEendpoint = `/api/stream?topics=dm,notifications,timeline`;
  const unseenCount = ref<number>(0);
  const lastNewMessageinfo = ref<DmSseEventMap['dm.new_message'] | null>(null);
  const lastNotification = ref<Notification | null>(null);
  const unseenNotificationsCount = ref<number>(0);
  const timelineFollowingAvatars = ref<string[]>([]);
  const isConnected = ref<boolean>(false);
  const error = ref<Event | null>(null);
  const reconnectAttempts = ref<number>(0);
  const queryClient = useQueryClient();
  const route = useRoute();
  const userStore = useUserStore();
  const selectedConversationId = computed(() => (route.params.conversationId as string) || null);
  // Track last processed message to avoid duplicates
  const lastProcessedMessageId = ref<string | null>(null);

  let es: EventSource | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let shouldReconnect = true;

  const clearReconnectTimeout = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  const scheduleReconnect = () => {
    if (!shouldReconnect || !autoReconnect) return;
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      return;
    }

    clearReconnectTimeout();

    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.value);

    reconnectTimeout = setTimeout(() => {
      reconnectAttempts.value++;
      connect();
    }, delay);
  };

  const connect = () => {
    // Don't create duplicate connections
    if (es && es.readyState !== EventSource.CLOSED) {
      return;
    }

    if (!SSEendpoint) {
      return;
    }

    // Clean up any existing connection
    disconnect();

    try {
      es = new EventSourcePolyfill(SSEendpoint, {
        withCredentials: true,
        heartbeatTimeout: 120_000, // expect some data within this time
      }) as unknown as EventSource;

      es.onopen = () => {
        isConnected.value = true;
        reconnectAttempts.value = 0;
        error.value = null;
      };

      es.onerror = (evt) => {
        error.value = evt;
        isConnected.value = false;
        if (es) {
          es.close();
          es = null;
        }

        scheduleReconnect();
      };

      es.addEventListener('dm.unseen_conversations_count', (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as DmSseEventMap['dm.unseen_conversations_count'];

          unseenCount.value = data.count;
          // console.log('Received unseen_conversations_count event:', data);
        } catch {
          createError('Failed to parse unseen_conversations_count event data');
        }
      });

      es.addEventListener('dm.new_message', (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as DmSseEventMap['dm.new_message'];
          lastNewMessageinfo.value = data;

          // Avoid processing duplicate messages
          if (data.messageId === lastProcessedMessageId.value) return;
          lastProcessedMessageId.value = data.messageId;

          // If user is currently in this conversation and is not the sender mark as seen
          // Otherwise mark as unseen
          const isCurrentConversation = selectedConversationId.value === data.conversationId;
          const isNotSender = data.sender.username !== userStore.user?.username;
          const shouldMarkAsSeen = isCurrentConversation && isNotSender;
          updateConversationLastMessage(queryClient, data.conversationId, {
            content: data.bodySnippet,
            senderUsername: data.sender.username,
            sentAt: data.createdAt,
            seen: shouldMarkAsSeen,
          });
        } catch {
          createError('Failed to parse new_message event data');
        }
      });

      es.addEventListener('notifications.count_update', (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as { count: number };
          unseenNotificationsCount.value = data.count;
          // console.log('Received notifications.count_update event:', unseenNotificationsCount.value);
        } catch {
          createError('Failed to parse notifications.count_update event data');
        }
      });

      es.addEventListener('notifications.delete', (evt: MessageEvent) => {
        console.log('Received notifications.delete event:', evt.data);
        // invalidate notifications queries to refetch immediatly and update list
        queryClient.invalidateQueries({ queryKey: ['notifications-main'] });
      });

      // negative updates: unlike/unretweet/unfollow
      es.addEventListener('notifications.update', () => {
        console.log('Received notifications.update event:');
        // invalidate notifications queries to refetch immediatly and update list
        queryClient.invalidateQueries({ queryKey: ['notifications-main'] });
      });

      es.addEventListener('notifications.new', (evt: MessageEvent) => {
        try {
          const notif = JSON.parse(evt.data) as Notification;
          lastNotification.value = notif;
          // update a notification and not insert a new one if it already exists here
          queryClient.setQueryData(['notifications-main'], (oldData: unknown) => {
            if (!oldData || typeof oldData !== 'object') return oldData;

            const od = oldData as {
              pages?: Array<{ data?: Notification[] }>;
              [k: string]: unknown;
            };

            const pages = (od.pages ?? []).map((p) => ({
              ...(p as object),
              data: (p as { data?: Notification[] }).data ?? [],
            }));

            // Try to find existing notification by id across all pages
            let foundPageIndex = -1;
            let foundItemIndex = -1;
            for (let i = 0; i < pages.length; i++) {
              const data = pages[i]?.data as Notification[];
              const idx = data.findIndex((n) => n.id === notif.id);
              if (idx !== -1) {
                foundPageIndex = i;
                foundItemIndex = idx;
                break;
              }
            }

            // Clone pages for immutable update
            const newPages = pages.map((p) => ({ ...p, data: [...(p.data ?? [])] }));

            if (foundPageIndex !== -1 && foundItemIndex !== -1) {
              // Merge update with existing item
              const existing = newPages[foundPageIndex]?.data[foundItemIndex];
              const merged = { ...existing, ...notif };

              // Remove the existing item from its original location
              newPages[foundPageIndex]?.data.splice(foundItemIndex, 1);

              // Ensure we don't create duplicates: remove any existing with same id from first page
              if (newPages.length > 0 && newPages[0]?.data) {
                newPages[0].data = newPages[0]?.data.filter((n) => n.id !== merged.id);
                // Move merged item to very top of the first page
                newPages[0]?.data.unshift(merged);
              } else {
                // No pages exist; create the first page with merged item
                newPages.unshift({ data: [merged] });
              }

              return {
                ...od,
                pages: newPages,
              };
            }

            // Not found: insert into first page (create pages if none)
            if (newPages.length === 0) {
              return {
                ...od,
                pages: [{ data: [notif] }],
              };
            }

            // Insert new notification at top of first page
            if (newPages[0]?.data) newPages[0].data = [notif, ...(newPages[0]?.data ?? [])];

            return {
              ...od,
              pages: newPages,
            };
          });
          // console.log('Received notifications.new event:', notif);
        } catch {
          createError('Failed to parse notifications.new event data');
        }
      });

      es.addEventListener('timeline.following', (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as DmSseEventMap['timeline.following'];
          timelineFollowingAvatars.value = data.authors;
        } catch {
          createError('Failed to parse timeline.following event data');
        }
      });
    } catch {
      scheduleReconnect();
    }
  };

  const disconnect = () => {
    shouldReconnect = false;
    clearReconnectTimeout();

    if (es) {
      es.close();
      es = null;
      isConnected.value = false;
    }
  };

  const reconnect = () => {
    shouldReconnect = true;
    reconnectAttempts.value = 0;
    connect();
  };

  onBeforeUnmount(() => {
    disconnect();
  });

  const clearTimelineFollowingAvatars = () => {
    timelineFollowingAvatars.value = [];
  };

  return {
    // state
    unseenCount,
    lastNewMessageinfo,
    lastNotification,
    unseenNotificationsCount,
    timelineFollowingAvatars,
    isConnected,
    error,
    reconnectAttempts,
    // controls
    connect,
    disconnect,
    reconnect,
    clearTimelineFollowingAvatars,
  };
}
