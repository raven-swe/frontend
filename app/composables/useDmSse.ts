import { ref, onBeforeUnmount } from 'vue';
import { getAccessToken } from '~/services/auth/authService';
import type { DmSseEventMap } from '~~/shared/types/dm';
import { EventSourcePolyfill } from 'event-source-polyfill';

export function useDmSse() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.dmSseUrl;
  const SSEendpoint = baseUrl ? `${baseUrl}/stream?topics=dm` : '';
  const unseenCount = ref<number>(0);
  const lastNewMessage = ref<DmSseEventMap['dm.new_message'] | null>(null);
  const isConnected = ref<boolean>(false);
  const error = ref<Event | null>(null);

  let es: EventSource | null = null;

  const connect = () => {
    const token = getAccessToken();
    // console.log('Connecting to DM SSE...');
    // console.log('token:', token);
    if (es) return;
    if (!SSEendpoint) return;
    // es = new EventSource(SSEendpoint, {
    //   withCredentials: true,
    // });
    es = new EventSourcePolyfill(SSEendpoint, {
      withCredentials: true,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'text/event-stream',
      },
    }) as unknown as EventSource;

    es.onopen = () => {
      isConnected.value = true;
    };

    es.onerror = (evt) => {
      error.value = evt;
      isConnected.value = false;
    };

    es.addEventListener('dm.unseen_conversations_count', (evt: MessageEvent) => {
      try {
        const data = JSON.parse(evt.data) as DmSseEventMap['dm.unseen_conversations_count'];
        unseenCount.value = data.count;
      } catch {
        // ignore malformed payloads for now
      }
    });

    es.addEventListener('dm.new_message', (evt: MessageEvent) => {
      try {
        const data = JSON.parse(evt.data) as DmSseEventMap['dm.new_message'];
        lastNewMessage.value = data;
      } catch {
        // ignore malformed payloads for now
      }
    });
  };

  const disconnect = () => {
    if (es) {
      es.close();
      es = null;
      isConnected.value = false;
    }
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
    // controls
    connect,
    disconnect,
  };
}
