import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmMessageItem from '@/components/dm/conversation/DmMessageItem.vue';
import type { DmMessage } from '#shared/types/dm';

const createMockMessage = (overrides?: Partial<DmMessage>): DmMessage => ({
  id: 'msg_1',
  content: 'Test message',
  entities: { mentions: [], hashtags: [] },
  mediaUrl: null,
  createdAt: new Date().toISOString(),
  isMine: false,
  ...overrides,
});

// Global stubs to simplify child component testing
const globalStubs = {
  DmMessageDropDown: {
    template: '<div data-test="dropdown" @click="$emit(\'deleted\')" />',
  },
  DmReactionPicker: {
    template: '<div data-test="picker" @click="$emit(\'select\', \'❤️\')" />',
  },
  DmReactionDisplay: {
    template: '<div data-test="display" @click="$emit(\'remove\', \'🔥\')" />',
  },
  NuxtImg: { template: '<img />' },
};

describe('DmMessageItem Component', () => {
  const defaultProps = { conversationId: 'conv-1' };

  it('renders correctly with content, media, alignment and styles', async () => {
    const messages = [
      createMockMessage({ isMine: true, content: 'Mine', mediaUrl: 'url.jpg' }),
      createMockMessage({ isMine: false, content: 'Theirs' }),
    ];

    for (const message of messages) {
      const wrapper = await mountSuspended(DmMessageItem, {
        props: { message, ...defaultProps },
        global: { stubs: globalStubs },
      });

      const container = wrapper.find('div');
      expect(container.exists()).toBe(true);
      expect(container.classes()).toContain(message.isMine ? 'justify-end' : 'justify-start');

      const bubble = wrapper.find('.rounded-3xl');
      expect(bubble.exists()).toBe(true);
      expect(bubble.classes()).toContain(message.isMine ? 'bg-primary' : 'bg-accent');

      const img = wrapper.find('img');
      if (message.mediaUrl) {
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe(message.mediaUrl);
      } else {
        expect(img.exists()).toBe(false);
      }

      expect(wrapper.text()).toContain(message.content);
    }
  });

  it('renders mentions and hashtags', async () => {
    const message = createMockMessage({
      content: 'Hello @john #cool',
      entities: {
        mentions: [{ username: 'john', startPosition: 6 }],
        hashtags: [{ hashtag: 'cool', startPosition: 12 }],
      },
    });

    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
      global: { stubs: globalStubs },
    });

    const html = wrapper.html();
    expect(html).toContain('john');
    expect(html).toContain('data-user');
    expect(html).toContain('#cool');
  });

  it('emits deleted event from dropdown', async () => {
    const message = createMockMessage({ isMine: true });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
      global: { stubs: globalStubs },
    });

    await wrapper.find('[data-test="dropdown"]').trigger('click');
    expect(wrapper.emitted('deleted')).toEqual([['msg_1']]);
  });

  it('emits reaction from picker', async () => {
    const message = createMockMessage({ isMine: false });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
      global: { stubs: globalStubs },
    });

    await wrapper.find('[data-test="picker"]').trigger('click');
    expect(wrapper.emitted('reaction')).toEqual([['msg_1', '❤️']]);
  });

  it('renders reaction display and emits remove', async () => {
    const message = createMockMessage({
      reactions: { receiver: { reaction: '🔥' } },
    });

    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, ...defaultProps },
      global: { stubs: globalStubs },
    });

    const display = wrapper.find('[data-test="display"]');
    expect(display.exists()).toBe(true);

    await display.trigger('click');
    expect(wrapper.emitted('reaction')).toEqual([['msg_1', '🔥']]);
  });

  it('displays timestamp and seen status', async () => {
    const createdAt = new Date('2024-01-01T12:30:00Z').toISOString();
    const message = createMockMessage({ createdAt, isMine: true });
    const wrapper = await mountSuspended(DmMessageItem, {
      props: { message, isSeen: true, ...defaultProps },
      global: { stubs: globalStubs },
    });

    const time = wrapper.find('.text-muted-foreground');
    expect(time.exists()).toBe(true);
    expect(wrapper.text()).toContain('·'); // seen dot
  });
});
