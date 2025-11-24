import type {
  DmMessage,
  DmWsClientMessage,
  DmWsServerMessage,
  DmWsMessageReceived,
} from '~~/shared/types/dm';
import { getAccessToken } from '~/services/auth/authService';

export function useDmWebSocket() {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const currentConversationId = ref<string | null>(null);
  const userStore = useUserStore();
  const config = useRuntimeConfig();
  // Extra debug state
  const lastError = ref<string | null>(null);
  const lastEvent = ref<string | null>(null);
  const attemptedUrl = ref<string | null>(null);

  const onMessageCallback = ref<((message: DmMessage) => void) | null>(null);
  const onErrorCallback = ref<((error: string) => void) | null>(null);

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN || isConnecting.value) {
      return;
    }

    isConnecting.value = true;
    const token = getAccessToken();
    if (!token) {
      console.error('No access token available for WebSocket connection');
      isConnecting.value = false;
      return;
    }

    try {
      const wsUrl = `${config.public.dmWebSocketUrl}?token=${encodeURIComponent(token)}`;
      attemptedUrl.value = wsUrl;
      console.error('[WS DEBUG] Attempting connection', {
        wsUrl,
        tokenPresent: Boolean(token),
        time: new Date().toISOString(),
      });
      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
        isConnected.value = true;
        isConnecting.value = false;
        lastEvent.value = 'open';
        console.error('[WS DEBUG] Connection opened', { url: wsUrl });
      };

      ws.value.onmessage = (event) => {
        try {
          const data: DmWsServerMessage = JSON.parse(event.data);
          handleServerMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          lastError.value = `parse_error: ${(error as Error)?.message}`;
        }
      };

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onErrorCallback.value) {
          onErrorCallback.value('WebSocket connection error');
        }
        lastError.value = 'connection_error';
        lastEvent.value = 'error';
      };

      ws.value.onclose = (evt) => {
        isConnected.value = false;
        isConnecting.value = false;
        lastEvent.value = 'close';
        const info = { code: evt.code, reason: evt.reason, wasClean: evt.wasClean };
        if (evt.code !== 1000) {
          lastError.value = `close_code_${evt.code}:${evt.reason || 'no-reason'}`;
        }
        console.error('[WS DEBUG] Connection closed', info);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      isConnecting.value = false;
      lastError.value = `creation_error: ${(error as Error)?.message}`;
    }
  }

  function disconnect() {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
      isConnected.value = false;
      isConnecting.value = false;
      currentConversationId.value = null;
    }
  }

  function send(message: DmWsClientMessage) {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    try {
      const payload = JSON.stringify(message);
      console.error('[WS DEBUG] Sending message', { payload });
      ws.value.send(payload);
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      lastError.value = `send_error: ${(error as Error)?.message}`;
    }
  }

  function handleServerMessage(data: DmWsServerMessage) {
    console.error('[WS DEBUG] Received server message', { type: data.type, raw: data });
    switch (data.type) {
      case 'message_received':
        handleMessageReceived(data);
        break;
      case 'message_deleted':
        // Handle message deletion (can be implemented later)
        break;
      case 'conversation_seen_update':
        // Handle seen update (can be implemented later)
        break;
      case 'error':
        console.error('WebSocket error:', data.message);
        if (onErrorCallback.value) {
          onErrorCallback.value(data.message);
        }
        lastError.value = `server_error: ${data.message}`;
        break;
    }
  }

  function handleMessageReceived(data: DmWsMessageReceived) {
    // Transform WebSocket message to DmMessage format
    const message: DmMessage = {
      id: data.message.id,
      // sender: {
      //   username: data.message.sender.username,
      //   displayName: data.message.sender.displayName,
      //   avatarUrl: data.message.sender.avatarUrl || '',
      // },
      content: data.message.body,
      entities: {
        mentions: [],
        hashtags: [],
      },
      mediaUrl: null,
      createdAt: data.message.createdAt,
      isMine: data.message.sender.username === userStore.user.username,
    };

    if (onMessageCallback.value) {
      onMessageCallback.value(message);
    }
  }

  function sendMessage(conversationId: string, body: string): string {
    const clientMessageId = crypto.randomUUID();
    send({
      type: 'send_message',
      conversationId,
      clientMessageId,
      body,
    });
    return clientMessageId;
  }

  function markSeen(conversationId: string, lastSeenMessageId: string) {
    send({
      type: 'mark_seen',
      conversationId,
      lastSeenMessageId,
    });
  }

  function switchConversation(conversationId: string, lastSeenMessageId?: string) {
    currentConversationId.value = conversationId;
    console.error('[WS DEBUG] Switched conversation', { conversationId, lastSeenMessageId });

    // Mark as seen when switching conversations
    if (lastSeenMessageId) {
      markSeen(conversationId, lastSeenMessageId);
    }
  }

  function onMessage(handler: (message: DmMessage) => void) {
    onMessageCallback.value = handler;
  }

  function onError(handler: (error: string) => void) {
    onErrorCallback.value = handler;
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect();
    onMessageCallback.value = null;
    onErrorCallback.value = null;
  });

  return {
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    currentConversationId: readonly(currentConversationId),
    lastError: readonly(lastError),
    lastEvent: readonly(lastEvent),
    attemptedUrl: readonly(attemptedUrl),
    connect,
    disconnect,
    sendMessage,
    markSeen,
    switchConversation,
    onMessage,
    onError,
  };
}
