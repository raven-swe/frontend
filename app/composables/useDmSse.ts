import { ref, onBeforeUnmount } from 'vue';
import type { DmSseEventMap } from '~~/shared/types/dm';
import { EventSourcePolyfill } from 'event-source-polyfill';

interface UseDmSseOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  baseReconnectDelay?: number;
}

export function useDmSse(options: UseDmSseOptions = {}) {
  const { autoReconnect = true, maxReconnectAttempts = 5, baseReconnectDelay = 1000 } = options;

  const SSEendpoint = `/api/dm/stream?topics=dm`;
  const unseenCount = ref<number>(0);
  const lastNewMessage = ref<DmSseEventMap['dm.new_message'] | null>(null);
  const isConnected = ref<boolean>(false);
  const error = ref<Event | null>(null);
  const reconnectAttempts = ref<number>(0);

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
      console.error('[useDmSse] Max reconnection attempts reached');
      return;
    }

    clearReconnectTimeout();

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s...
    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.value);
    console.warn(
      `[useDmSse] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value + 1}/${maxReconnectAttempts})`,
    );

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
      console.error('[useDmSse] No SSE endpoint configured');
      return;
    }

    // Clean up any existing connection
    disconnect();

    try {
      es = new EventSourcePolyfill(SSEendpoint, {
        withCredentials: true,
        heartbeatTimeout: 120_000, // 2 minutes - expect some data within this time
      }) as unknown as EventSource;

      es.onopen = () => {
        isConnected.value = true;
        reconnectAttempts.value = 0; // Reset on successful connection
        error.value = null;
        console.warn('[useDmSse] SSE connection opened');
      };

      es.onerror = (evt) => {
        error.value = evt;
        isConnected.value = false;
        console.error('[useDmSse] SSE connection error', evt);

        // EventSource automatically tries to reconnect unless we close it
        // But we want controlled reconnection with backoff
        if (es) {
          es.close();
          es = null;
        }

        scheduleReconnect();
      };

      // Listen for unseen conversations count updates
      es.addEventListener('dm.unseen_conversations_count', (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as DmSseEventMap['dm.unseen_conversations_count'];
          unseenCount.value = data.count;
          console.warn('[useDmSse] Updated unseen DM count:', data.count);
        } catch (err) {
          console.error('[useDmSse] Failed to parse unseen_conversations_count', err);
        }
      });

      // Listen for new message events
      es.addEventListener('dm.new_message', (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as DmSseEventMap['dm.new_message'];
          lastNewMessage.value = data;
          console.warn('[useDmSse] New DM message:', data.conversationId);
        } catch (err) {
          console.error('[useDmSse] Failed to parse new_message', err);
        }
      });
    } catch (err) {
      console.error('[useDmSse] Failed to create EventSource', err);
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

  return {
    // state
    unseenCount,
    lastNewMessage,
    isConnected,
    error,
    reconnectAttempts,
    // controls
    connect,
    disconnect,
    reconnect,
  };
}
