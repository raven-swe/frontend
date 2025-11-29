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
