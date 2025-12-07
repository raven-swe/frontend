import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { DmMessage } from '~~/shared/types/dm';
import { getAccessToken } from '~/services/auth/authService';

interface ServerMessageReceivedPayload {
  message: {
    id: string;
    body: string;
    createdAt: string;
    sender: { username: string };
  };
}

export function useDmSocketIO() {
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const currentConversationId = ref<string | null>(null);
  const lastError = ref<string | null>(null);
  const attemptedUrl = ref<string | null>(null);

  const userStore = useUserStore();
  const config = useRuntimeConfig();

  const onMessageCallback = ref<((m: DmMessage) => void) | null>(null);
  const onErrorCallback = ref<((e: string) => void) | null>(null);

  function connect() {
    if (socket.value?.connected) return;
    const token = getAccessToken();
    if (!token) {
      lastError.value = 'no_token';
      return;
    }
    const base = config.public.dmWebSocketUrl;
    const fullUrl = `${base}?token=${token}`;
    attemptedUrl.value = fullUrl;
    socket.value = io(fullUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
    });
    socket.value.on('connect_error', (err: Error) => {
      lastError.value = `connect_error:${err.message}`;
      if (onErrorCallback.value) onErrorCallback.value(err.message);
    });
    socket.value.on('disconnect', (_reason: string) => {
      isConnected.value = false;
    });

    // Custom server events
    socket.value.on('message_received', (payload: ServerMessageReceivedPayload) => {
      // console.log('Socket.IO message_received event payload:', payload);
      const data = payload.message;
      // console.log('Received message via Socket.IO:', data);
      const message: DmMessage = {
        id: data.id,
        content: data.body,
        entities: { mentions: [], hashtags: [] },
        mediaUrl: null,
        createdAt: data.createdAt,
        isMine: data.sender.username === userStore.user.username,
      };
      onMessageCallback.value?.(message);
    });
    socket.value.on('error', (msg: string) => {
      lastError.value = `server_error:${msg}`;
      if (onErrorCallback.value) onErrorCallback.value(msg);
    });

    // socket.value.onAny((eventName, payload) => {
    //   console.log('Received event:', eventName, payload);
    // });
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
      currentConversationId.value = null;
    }
  }

  function sendMessage(conversationId: string, body: string) {
    const clientMessageId = crypto.randomUUID();
    // console.log('Sending message via Socket.IO:', { conversationId, body, clientMessageId });
    socket.value?.emit('send_message', { conversationId, body, clientMessageId });
    return clientMessageId;
  }

  function markSeen(conversationId: string, lastSeenMessageId: string) {
    socket.value?.emit('mark_seen', { conversationId, lastSeenMessageId });
  }

  function onMessage(cb: (m: DmMessage) => void) {
    onMessageCallback.value = cb;
  }
  function onError(cb: (e: string) => void) {
    onErrorCallback.value = cb;
  }

  onUnmounted(() => {
    disconnect();
    onMessageCallback.value = null;
    onErrorCallback.value = null;
  });

  return {
    isConnected: readonly(isConnected),
    currentConversationId: readonly(currentConversationId),
    lastError: readonly(lastError),
    attemptedUrl: readonly(attemptedUrl),
    connect,
    disconnect,
    sendMessage,
    markSeen,
    onMessage,
    onError,
  };
}
