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
      const wsUrl = `${config.public.dmWebSocketUrl}?token=${token}`;
      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
        isConnected.value = true;
        isConnecting.value = false;
      };

      ws.value.onmessage = (event) => {
        try {
          const data: DmWsServerMessage = JSON.parse(event.data);
          handleServerMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onErrorCallback.value) {
          onErrorCallback.value('WebSocket connection error');
        }
      };

      ws.value.onclose = () => {
        isConnected.value = false;
        isConnecting.value = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      isConnecting.value = false;
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
      ws.value.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  function handleServerMessage(data: DmWsServerMessage) {
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
        break;
    }
  }

  function handleMessageReceived(data: DmWsMessageReceived) {
    // Transform WebSocket message to DmMessage format
    const message: DmMessage = {
      id: data.message.id,
      sender: {
        username: data.message.sender.username,
        displayName: data.message.sender.displayName,
        avatarUrl: data.message.sender.avatarUrl || '',
      },
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
    connect,
    disconnect,
    sendMessage,
    markSeen,
    switchConversation,
    onMessage,
    onError,
  };
}
