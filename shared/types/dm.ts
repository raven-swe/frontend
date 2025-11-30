export interface DmConversation {
  id: string;
  participant: {
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  lastMessage: {
    content: string;
    senderUsername: string;
    sentAt: string;
  };
  isMuted: boolean;
}

export interface DmMessageEntityMention {
  username: string;
  startPosition: number;
}

export interface DmMessageEntityHashtag {
  hashtag: string;
  startPosition: number;
}

export interface DmMessageEntities {
  mentions: DmMessageEntityMention[];
  hashtags: DmMessageEntityHashtag[];
}

export interface DmMessageSender {
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface DmMessage {
  id: string;
  content: string;
  entities: DmMessageEntities;
  mediaUrl?: string | null;
  createdAt: string;
  isMine: boolean;
}

// WebSocket Types
export interface DmWsSendMessagePayload {
  type: 'send_message';
  conversationId: string;
  clientMessageId: string;
  body: string;
}

export interface DmWsMarkSeenPayload {
  type: 'mark_seen';
  conversationId: string;
  lastSeenMessageId: string;
}

export type DmWsClientMessage = DmWsSendMessagePayload | DmWsMarkSeenPayload;

export interface DmWsMessageReceived {
  type: 'message_received';
  conversationId: string;
  message: {
    id: string;
    sender: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
    clientMessageId: string;
    body: string;
    createdAt: string;
  };
}

export interface DmWsMessageDeleted {
  type: 'message_deleted';
  conversationId: string;
  messageId: string;
  deletedAt: string;
}

export interface DmWsConversationSeenUpdate {
  type: 'conversation_seen_update';
  conversationId: string;
  username: string;
  lastSeenMessageId: string;
  seenAt: string;
}

export interface DmWsError {
  type: 'error';
  clientMessageId: string;
  code: string;
  message: string;
}

export type DmWsServerMessage =
  | DmWsMessageReceived
  | DmWsMessageDeleted
  | DmWsConversationSeenUpdate
  | DmWsError;
export interface DmConversationMessagesResponse {
  participant: {
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  messages: DmMessage[];
}

export type DmSseEventName = 'dm.unseen_conversations_count' | 'dm.new_message';

export interface DmUnseenConversationsCountEventData {
  count: number;
}

export interface DmNewMessageEventData {
  conversationId: string;
  messageId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  bodySnippet: string;
  createdAt: string;
}

export interface DmSseEventMap {
  'dm.unseen_conversations_count': DmUnseenConversationsCountEventData;
  'dm.new_message': DmNewMessageEventData;
}
