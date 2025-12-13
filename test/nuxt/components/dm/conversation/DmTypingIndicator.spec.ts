import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import DmTypingIndicator from '@/components/dm/conversation/DmTypingIndicator.vue';

type TypingCallback = (data: { conversationId: string; username: string }) => void;

// Mock Nuxt auto-imports
vi.mock('#imports', () => ({
  useUserStore: () => ({
    user: { username: 'currentuser' },
  }),
}));

// Mock user store
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: { username: 'currentuser' },
  }),
}));

interface MockDmSocket {
  onUserTyping: ReturnType<typeof vi.fn>;
  onUserTypingStop: ReturnType<typeof vi.fn>;
  isConnected: ReturnType<typeof ref<boolean>>;
  typingCallback?: TypingCallback;
  typingStopCallback?: TypingCallback;
}

const createMockDmSocket = (): MockDmSocket => {
  const socket: MockDmSocket = {
    onUserTyping: vi.fn(),
    onUserTypingStop: vi.fn(),
    isConnected: ref(true),
  };

  socket.onUserTyping.mockImplementation((cb: TypingCallback) => {
    socket.typingCallback = cb;
  });

  socket.onUserTypingStop.mockImplementation((cb: TypingCallback) => {
    socket.typingStopCallback = cb;
  });

  return socket;
};

describe('DmTypingIndicator Component', () => {
  it('does not render when no one is typing', async () => {
    const mockSocket = createMockDmSocket();

    const wrapper = await mountSuspended(DmTypingIndicator, {
      props: { conversationId: 'conv_1' },
      global: {
        provide: {
          dmSocket: mockSocket,
        },
      },
    });

    expect(wrapper.find('div').exists()).toBe(false);
  });

  it('shows typing indicator when user starts typing', async () => {
    const mockSocket = createMockDmSocket();

    const wrapper = await mountSuspended(DmTypingIndicator, {
      props: { conversationId: 'conv_1' },
      global: {
        provide: {
          dmSocket: mockSocket,
        },
      },
    });

    // Simulate typing event
    mockSocket.typingCallback?.({ conversationId: 'conv_1', username: 'otheruser' });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('otheruser');
  });

  it('hides typing indicator when user stops typing', async () => {
    const mockSocket = createMockDmSocket();

    const wrapper = await mountSuspended(DmTypingIndicator, {
      props: { conversationId: 'conv_1' },
      global: {
        provide: {
          dmSocket: mockSocket,
        },
      },
    });

    // Start typing
    mockSocket.typingCallback?.({ conversationId: 'conv_1', username: 'otheruser' });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('otheruser');

    // Stop typing
    mockSocket.typingStopCallback?.({ conversationId: 'conv_1', username: 'otheruser' });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('div').exists()).toBe(false);
  });

  it('ignores typing events from different conversations', async () => {
    const mockSocket = createMockDmSocket();

    const wrapper = await mountSuspended(DmTypingIndicator, {
      props: { conversationId: 'conv_1' },
      global: {
        provide: {
          dmSocket: mockSocket,
        },
      },
    });

    // Typing event from different conversation
    mockSocket.typingCallback?.({ conversationId: 'conv_2', username: 'otheruser' });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('div').exists()).toBe(false);
  });

  it('ignores typing events from current user', async () => {
    const mockSocket = createMockDmSocket();

    const wrapper = await mountSuspended(DmTypingIndicator, {
      props: { conversationId: 'conv_1' },
      global: {
        provide: {
          dmSocket: mockSocket,
        },
      },
    });

    // Typing event from current user (should be ignored)
    mockSocket.typingCallback?.({ conversationId: 'conv_1', username: 'currentuser' });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('div').exists()).toBe(false);
  });

  it('renders animated dots when typing', async () => {
    const mockSocket = createMockDmSocket();

    const wrapper = await mountSuspended(DmTypingIndicator, {
      props: { conversationId: 'conv_1' },
      global: {
        provide: {
          dmSocket: mockSocket,
        },
      },
    });

    mockSocket.typingCallback?.({ conversationId: 'conv_1', username: 'otheruser' });
    await wrapper.vm.$nextTick();

    // Check for 3 animated dots
    const dots = wrapper.findAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });
});
