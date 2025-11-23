import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmMessagesList from '@/components/dm/conversation/DmMessagesList.vue';
import type { DmMessage } from '#shared/types/dm';

const createMockMessages = (): DmMessage[] => [
  {
    id: 'msg_1',
    sender: {
      username: 'user1',
      displayName: 'User One',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    },
    content: 'First message',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: new Date().toISOString(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: {
      username: 'user2',
      displayName: 'User Two',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
    content: 'Second message',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: new Date().toISOString(),
    isMine: false,
  },
  {
    id: 'msg_3',
    sender: {
      username: 'user1',
      displayName: 'User One',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    },
    content: 'Third message',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: new Date().toISOString(),
    isMine: true,
  },
];

describe('DmMessagesList Component', () => {
  it('renders the messages list container', async () => {
    const messages = createMockMessages();
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    const container = wrapper.find('div.flex.flex-col');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('gap-2');
    expect(container.classes()).toContain('p-3');
  });

  it('renders all messages', async () => {
    const messages = createMockMessages();
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    expect(wrapper.text()).toContain('First message');
    expect(wrapper.text()).toContain('Second message');
    expect(wrapper.text()).toContain('Third message');
  });

  it('renders correct number of message items', async () => {
    const messages = createMockMessages();
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    // Count message bubbles
    const messageBubbles = wrapper.findAll('.rounded-3xl');
    expect(messageBubbles.length).toBe(messages.length);
  });

  it('renders empty list when no messages provided', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages: [] },
    });

    const container = wrapper.find('div.flex.flex-col');
    expect(container.exists()).toBe(true);

    const messageBubbles = wrapper.findAll('.rounded-3xl');
    expect(messageBubbles.length).toBe(0);
  });

  it('preserves message order', async () => {
    const messages = createMockMessages();
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    const text = wrapper.text();
    const firstIndex = text.indexOf('First message');
    const secondIndex = text.indexOf('Second message');
    const thirdIndex = text.indexOf('Third message');

    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });

  it('renders messages with proper spacing', async () => {
    const messages = createMockMessages();
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    const container = wrapper.find('div.flex.flex-col');
    expect(container.classes()).toContain('gap-2');
  });

  it('renders each message with unique key', async () => {
    const messages = createMockMessages();
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    // All messages should be rendered (checked by content)
    expect(wrapper.text()).toContain('First message');
    expect(wrapper.text()).toContain('Second message');
    expect(wrapper.text()).toContain('Third message');
  });

  it('handles single message', async () => {
    const allMessages = createMockMessages();
    const firstMessage = allMessages[0];
    if (!firstMessage) throw new Error('No message found');
    const messages = [firstMessage];
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    expect(wrapper.text()).toContain('First message');
    const messageBubbles = wrapper.findAll('.rounded-3xl');
    expect(messageBubbles.length).toBe(1);
  });

  it('renders messages with different alignments based on isMine', async () => {
    const messages = createMockMessages();
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    const html = wrapper.html();
    // Should have both justify-end (isMine: true) and justify-start (isMine: false)
    expect(html).toContain('justify-end');
    expect(html).toContain('justify-start');
  });

  it('passes message data correctly to child components', async () => {
    const messages = [
      {
        id: 'msg_special',
        sender: {
          username: 'special_user',
          displayName: 'Special User',
          avatarUrl: 'https://i.pravatar.cc/150?img=5',
        },
        content: 'Special message content',
        entities: { mentions: [], hashtags: [] },
        mediaUrl: null,
        createdAt: new Date().toISOString(),
        isMine: true,
      },
    ];
    const wrapper = await mountSuspended(DmMessagesList, {
      props: { messages },
    });

    expect(wrapper.text()).toContain('Special message content');
  });
});
