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
