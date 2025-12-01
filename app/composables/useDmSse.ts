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
  const lastNewMessageinfo = ref<DmSseEventMap['dm.new_message'] | null>(null);
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
          console.log('Received unseen_conversations_count event:', data);
        } catch {
          createError('Failed to parse unseen_conversations_count event data');
        }
      });

      es.addEventListener('dm.new_message', (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as DmSseEventMap['dm.new_message'];
          lastNewMessageinfo.value = data;
          console.log('Received new_message event:', data);
        } catch {
          createError('Failed to parse new_message event data');
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

  return {
    // state
    unseenCount,
    lastNewMessageinfo,
    isConnected,
    error,
    reconnectAttempts,
    // controls
    connect,
    disconnect,
    reconnect,
  };
}
