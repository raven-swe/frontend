import { http, HttpResponse } from 'msw';
import type { DmConversation, DmMessage } from '~~/shared/types/dm';
import type { ApiSuccessResponse, ApiErrorResponse } from '~~/shared/types/api';

const API_URL = process.env.BACKEND_URL;

const conversations: DmConversation[] = [
  {
    id: '1',
    participant: {
      username: 'hussein',
      displayName: 'Hussein',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
    lastMessage: {
      content: 'Hey! How are you doing?',
      senderUsername: '@hussein',
      sentAt: '2h',
    },
    isMuted: false,
  },
  {
    id: '2',
    participant: {
      username: 'btngana',
      displayName: 'Ahmed Amr',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
    },
    lastMessage: {
      content: 'Did you see the new update?',
      senderUsername: '@btngana',
      sentAt: '5h',
    },
    isMuted: false,
  },
  {
    id: '3',
    participant: {
      username: 'farag',
      displayName: 'Abdullah Farag',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
    },
    lastMessage: {
      content: 'Thanks for your help yesterday!',
      senderUsername: '@farag',
      sentAt: '1d',
    },
    isMuted: true,
  },
  {
    id: '4',
    participant: {
      username: 'mostafa',
      displayName: 'Mostafa Hassan',
      avatarUrl: 'https://i.pravatar.cc/150?img=13',
    },
    lastMessage: {
      content: "Let's catch up soon",
      senderUsername: '@mostafa',
      sentAt: '2d',
    },
    isMuted: false,
  },
  {
    id: '5',
    participant: {
      username: 'habiba',
      displayName: 'Habiba Ayman',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
    },
    lastMessage: {
      content: 'The meeting is at 3 PM',
      senderUsername: '@habiba',
      sentAt: '3d',
    },
    isMuted: false,
  },
];

const buildNow = () => new Date().toISOString();
const me = {
  username: 'hussein',
  displayName: 'Hussein',
  avatarUrl: 'https://i.pravatar.cc/150?img=2',
};
const other = {
  username: 'btngana',
  displayName: 'Ahmed Amr',
  avatarUrl: 'https://i.pravatar.cc/150?img=3',
};

// Messages for conversation id = 1
const messagesConv1: DmMessage[] = [
  {
    id: 'msg_1',
    sender: { ...me },
    content: 'Hey! How are you?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: { ...other },
    content: 'I’m good! Working on the project.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
  {
    id: 'msg_3',
    sender: { ...me },
    content: `Great! Let’s push the latest changes. ${other.username}`,
    entities: {
      mentions: [{ username: other.username.replace(/^@/, ''), startPosition: 39 }],
      hashtags: [],
    },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
  {
    id: 'msg_4',
    sender: { ...me },
    content: 'Check this out #update',
    entities: { mentions: [], hashtags: [{ hashtag: 'update', startPosition: 15 }] },
    mediaUrl: 'https://picsum.photos/seed/dm/300/200',
    createdAt: buildNow(),
    isMine: true,
  },
  {
    id: 'msg_1',
    sender: { ...me },
    content: 'Hey! How are you?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: { ...other },
    content: 'I’m good! Working on the project.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
  {
    id: 'msg_1',
    sender: { ...me },
    content: 'Hey! How are you?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: { ...other },
    content: 'I’m good! Working on the project.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
  {
    id: 'msg_1',
    sender: { ...me },
    content: 'Hey! How are you?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: { ...other },
    content: 'I’m good! Working on the project.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
];

// Different messages for conversation id = 2 (shorter & distinct content)
const messagesConv2: DmMessage[] = [
  {
    id: 'c2_msg_1',
    sender: { ...other },
    content: 'Hey Hussein, did you review the PR?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
  {
    id: 'c2_msg_2',
    sender: { ...me },
    content: 'Yes, left some comments. Check the performance section.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
  {
    id: 'c2_msg_3',
    sender: { ...other },
    content: 'Great. I will push fixes now. #refactor',
    entities: { mentions: [], hashtags: [{ hashtag: 'refactor', startPosition: 37 }] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
  {
    id: 'c2_msg_4',
    sender: { ...me },
    content: 'Cool, ping me when done so I merge.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
];

// Helper to get a guaranteed sender for a conversation id
const getParticipant = (id: string) => {
  const found = conversations.find((c) => c.id === id)?.participant;
  return found ? { ...found } : { ...me };
};

// Minimal messages for conversations 3, 4, 5 (2 messages each)
const messagesConv3: DmMessage[] = [
  {
    id: 'c3_msg_1',
    sender: getParticipant('3'),
    content: 'Hello Hussein! 👋',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
  {
    id: 'c3_msg_2',
    sender: { ...me },
    content: 'Hey! Long time no see.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
];

const messagesConv4: DmMessage[] = [
  {
    id: 'c4_msg_1',
    sender: getParticipant('4'),
    content: "Let's catch up this weekend?",
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
  {
    id: 'c4_msg_2',
    sender: { ...me },
    content: 'Sounds good to me 👍',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
];

const messagesConv5: DmMessage[] = [
  {
    id: 'c5_msg_1',
    sender: getParticipant('5'),
    content: 'Meeting moved to 4 PM.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: false,
  },
  {
    id: 'c5_msg_2',
    sender: { ...me },
    content: 'Got it, thanks!',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: buildNow(),
    isMine: true,
  },
];

const messagesByConversation: Record<string, DmMessage[]> = {
  '1': messagesConv1,
  '2': messagesConv2,
  '3': messagesConv3,
  '4': messagesConv4,
  '5': messagesConv5,
};

export const handlers = [
  http.get(`${API_URL}/conversations`, () => {
    const response: ApiSuccessResponse<DmConversation[]> = {
      success: true,
      data: conversations,
    };
    return HttpResponse.json(response, { status: 200 });
  }),

  http.get(`${API_URL}/conversations/:conversationId/messages`, ({ params }) => {
    const { conversationId } = params as { conversationId: string };
    const data = messagesByConversation[conversationId] || [];
    const response: ApiSuccessResponse<DmMessage[]> = {
      success: true,
      data,
    };
    return HttpResponse.json(response, { status: 200 });
  }),

  // GET /conversations/:conversationId -> single conversation
  http.get(`${API_URL}/conversations/:conversationId`, ({ params }) => {
    const { conversationId } = params as { conversationId: string };
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Conversation not found' },
        } as ApiErrorResponse,
        { status: 404 },
      );
    }
    const response: ApiSuccessResponse<DmConversation> = {
      success: true,
      data: conversation,
    };
    return HttpResponse.json(response, { status: 200 });
  }),
];
