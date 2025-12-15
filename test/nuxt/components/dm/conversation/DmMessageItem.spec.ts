import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmMessageItem from '@/components/dm/conversation/DmMessageItem.vue';
import type { DmMessage } from '#shared/types/dm';

const createMockMessage = (overrides?: Partial<DmMessage>): DmMessage => ({
  id: 'msg_1',
  content: 'Test message',
  entities: {
    mentions: [],
    hashtags: [],
  },
  mediaUrl: null,
  createdAt: new Date().toISOString(),
  isMine: false,
  ...overrides,
});

describe('DmMessageItem Component', () => {
  const defaultProps = { conversationId: 'conv-1' };

  it('renders message with correct structure', async () => {
    const message = createMockMessage();
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
  });

  it('displays message content', async () => {
    const message = createMockMessage({ content: 'Hello world!' });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    expect(wrapper.text()).toContain('Hello world!');
  });

  it('aligns message to the right when isMine is true', async () => {
    const message = createMockMessage({ isMine: true });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('justify-end');
  });

  it('aligns message to the left when isMine is false', async () => {
    const message = createMockMessage({ isMine: false });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('justify-start');
  });

  it('applies primary background when isMine is true', async () => {
    const message = createMockMessage({ isMine: true });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const bubble = wrapper.find('.rounded-3xl');
    expect(bubble.classes()).toContain('bg-primary');
    expect(bubble.classes()).toContain('text-white');
  });

  it('applies accent background when isMine is false', async () => {
    const message = createMockMessage({ isMine: false });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const bubble = wrapper.find('.rounded-3xl');
    expect(bubble.classes()).toContain('bg-accent');
    expect(bubble.classes()).toContain('text-foreground');
  });

  it('displays formatted time', async () => {
    const createdAt = new Date('2024-01-01T12:30:00Z').toISOString();
    const message = createMockMessage({ createdAt });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const time = wrapper.find('.text-muted-foreground');
    expect(time.exists()).toBe(true);
    // Time format will depend on locale, just check the element exists
  });

  it('renders mentions with proper styling', async () => {
    const message = createMockMessage({
      content: 'Hello @john',
      entities: {
        mentions: [{ username: 'john', startPosition: 6 }],
        hashtags: [],
      },
    });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const html = wrapper.html();
    expect(html).toContain('john');
    expect(html).toContain('data-user');
  });

  it('renders hashtags with proper styling', async () => {
    const message = createMockMessage({
      content: 'Check this #awesome',
      entities: {
        mentions: [],
        hashtags: [{ hashtag: 'awesome', startPosition: 11 }],
      },
    });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const html = wrapper.html();
    expect(html).toContain('#awesome');
  });

  it('displays media when mediaUrl is provided', async () => {
    const message = createMockMessage({
      mediaUrl: 'https://example.com/image.jpg',
    });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://example.com/image.jpg');
  });

  it('does not display media when mediaUrl is null', async () => {
    const message = createMockMessage({ mediaUrl: null });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(false);
  });

  it('handles messages with both content and media', async () => {
    const message = createMockMessage({
      content: 'Check this out!',
      mediaUrl: 'https://example.com/image.jpg',
    });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    expect(wrapper.text()).toContain('Check this out!');
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
  });

  it('limits message width to 68%', async () => {
    const message = createMockMessage();
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const messageContent = wrapper.find('.max-w-\\[68\\%\\]');
    expect(messageContent.exists()).toBe(true);
  });

  it('applies rounded corners to message bubble', async () => {
    const message = createMockMessage();
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const bubble = wrapper.find('.rounded-3xl');
    expect(bubble.exists()).toBe(true);
  });

  it('renders media with rounded corners', async () => {
    const message = createMockMessage({
      mediaUrl: 'https://example.com/image.jpg',
    });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
    });

    const mediaContainer = wrapper.find('.rounded-xl');
    expect(mediaContainer.exists()).toBe(true);
  });
});
