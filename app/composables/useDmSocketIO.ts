import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type {
  DmMessage,
  DmWsConversationSeenUpdate,
  DmWsUserTyping,
  DmWsUserTypingStop,
  DmWsReactionReceived,
} from '~~/shared/types/dm';
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
  const onSeenUpdateCallback = ref<
    ((data: Omit<DmWsConversationSeenUpdate, 'type'>) => void) | null
  >(null);
  const onUserTypingCallback = ref<((data: Omit<DmWsUserTyping, 'type'>) => void) | null>(null);
  const onUserTypingStopCallback = ref<((data: Omit<DmWsUserTypingStop, 'type'>) => void) | null>(
    null,
  );
  const onReactionReceivedCallback = ref<
    ((data: Omit<DmWsReactionReceived, 'type'>) => void) | null
  >(null);

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

    socket.value.on(
      'conversation_seen_update',
      (payload: Omit<DmWsConversationSeenUpdate, 'type'>) => {
        onSeenUpdateCallback.value?.(payload);
      },
    );

    socket.value.on('user_typing', (payload: Omit<DmWsUserTyping, 'type'>) => {
      onUserTypingCallback.value?.(payload);
    });

    socket.value.on('user_typing_stop', (payload: Omit<DmWsUserTypingStop, 'type'>) => {
      onUserTypingStopCallback.value?.(payload);
    });

    socket.value.on('reaction_received', (payload: Omit<DmWsReactionReceived, 'type'>) => {
      onReactionReceivedCallback.value?.(payload);
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

  function typingStart(conversationId: string) {
    socket.value?.emit('typing_start', { conversationId });
  }

  function typingStop(conversationId: string) {
    socket.value?.emit('typing_stop', { conversationId });
  }

  function sendReaction(conversationId: string, messageId: string, reaction: string) {
    socket.value?.emit('send_reaction', { conversationId, messageId, reaction });
  }

  function onMessage(cb: (m: DmMessage) => void) {
    onMessageCallback.value = cb;
  }
  function onError(cb: (e: string) => void) {
    onErrorCallback.value = cb;
  }
  function onSeenUpdate(cb: (data: Omit<DmWsConversationSeenUpdate, 'type'>) => void) {
    onSeenUpdateCallback.value = cb;
  }
  function onUserTyping(cb: (data: Omit<DmWsUserTyping, 'type'>) => void) {
    onUserTypingCallback.value = cb;
  }
  function onUserTypingStop(cb: (data: Omit<DmWsUserTypingStop, 'type'>) => void) {
    onUserTypingStopCallback.value = cb;
  }
  function onReactionReceived(cb: (data: Omit<DmWsReactionReceived, 'type'>) => void) {
    onReactionReceivedCallback.value = cb;
  }

  onUnmounted(() => {
    disconnect();
    onMessageCallback.value = null;
    onErrorCallback.value = null;
    onSeenUpdateCallback.value = null;
    onUserTypingCallback.value = null;
    onUserTypingStopCallback.value = null;
    onReactionReceivedCallback.value = null;
  });

  return {
    isConnected: readonly(isConnected),
    currentConversationId: readonly(currentConversationId),
    lastError: readonly(lastError),
    attemptedUrl: readonly(attemptedUrl),
    connect,
    disconnect,
    // Client → Server
    sendMessage,
    markSeen,
    typingStart,
    typingStop,
    sendReaction,
    // Server → Client callbacks
    onMessage,
    onError,
    onSeenUpdate,
    onUserTyping,
    onUserTypingStop,
    onReactionReceived,
  };
}
