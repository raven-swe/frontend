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
    seen: boolean;
  } | null;
  isBlocking?: boolean;
  isBlockedBy?: boolean;
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
  mediaType?: string | null;
  height?: number | null;
  width?: number | null;
  altText?: string | null;
  createdAt: string;
  isMine: boolean;
}

// WebSocket Types

// Client → Server
export interface DmWsSendMessagePayload {
  type: 'send_message';
  conversationId: string;
  clientMessageId: string;
  body: string;
  mediaId?: string;
}

export interface DmWsMarkSeenPayload {
  type: 'mark_seen';
  conversationId: string;
  lastSeenMessageId: string;
}

export interface DmWsTypingStartPayload {
  type: 'typing_start';
  conversationId: string;
}

export interface DmWsTypingStopPayload {
  type: 'typing_stop';
  conversationId: string;
}

export interface DmWsSendReactionPayload {
  type: 'send_reaction';
  conversationId: string;
  messageId: string;
  reaction: string;
}

export type DmWsClientMessage =
  | DmWsSendMessagePayload
  | DmWsMarkSeenPayload
  | DmWsTypingStartPayload
  | DmWsTypingStopPayload
  | DmWsSendReactionPayload;

// Server → Client
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
  mediaUrl: string | null;
  mediaType: string | null;
  height: number | null;
  width: number | null;
  altText: string | null;
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

export interface DmWsUserTyping {
  type: 'user_typing';
  conversationId: string;
  username: string;
}

export interface DmWsUserTypingStop {
  type: 'user_typing_stop';
  conversationId: string;
  username: string;
}

export interface DmReactionUser {
  username: string;
  displayName: string;
  avatarUrl: string;
  reaction: string | null;
  reactedAt: string | null;
}

export interface DmWsReactionReceived {
  type: 'reaction_received';
  conversationId: string;
  messageId: string;
  reactions: {
    sender: DmReactionUser;
    receiver: DmReactionUser;
  };
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
  | DmWsUserTyping
  | DmWsUserTypingStop
  | DmWsReactionReceived
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
