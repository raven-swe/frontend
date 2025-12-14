import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmReactionDisplay from '@/components/dm/conversation/reaction/DmReactionDisplay.vue';
import type { DmMessageReactions } from '~~/shared/types/dm';

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

const createMockReactions = (overrides?: Partial<DmMessageReactions>): DmMessageReactions => ({
  sender: {
    username: 'sender',
    displayName: 'Sender User',
    avatarUrl: 'https://example.com/sender.jpg',
    reaction: '',
    reactedAt: '',
  },
  receiver: {
    username: 'receiver',
    displayName: 'Receiver User',
    avatarUrl: 'https://example.com/receiver.jpg',
    reaction: '❤️',
    reactedAt: new Date().toISOString(),
  },
  ...overrides,
});

describe('DmReactionDisplay Component', () => {
  it('displays receiver reaction when it exists', async () => {
    const reactions = createMockReactions();

    const wrapper = await mountSuspended(DmReactionDisplay, {
      props: {
        reactions,
        isMine: true,
      },
    });

    // Should show receiver's reaction
    expect(wrapper.text()).toContain('❤️');
  });

  it('does not render when receiver has no reaction', async () => {
    const reactions = createMockReactions({
      receiver: {
        username: 'receiver',
        displayName: 'Receiver User',
        avatarUrl: 'https://example.com/receiver.jpg',
        reaction: '',
        reactedAt: '',
      },
    });

    const wrapper = await mountSuspended(DmReactionDisplay, {
      props: {
        reactions,
        isMine: true,
      },
    });

    // Should not render when receiver has no reaction
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('positions on left for own messages', async () => {
    const reactions = createMockReactions();

    const wrapper = await mountSuspended(DmReactionDisplay, {
      props: {
        reactions,
        isMine: true,
      },
    });

    expect(wrapper.find('div').classes()).toContain('-left-1');
  });

  it('positions on right for other messages', async () => {
    const reactions = createMockReactions();

    const wrapper = await mountSuspended(DmReactionDisplay, {
      props: {
        reactions,
        isMine: false,
      },
    });

    expect(wrapper.find('div').classes()).toContain('-right-1');
  });

  it('emits remove event when clicked by reaction owner', async () => {
    const reactions = createMockReactions({
      receiver: {
        username: 'currentuser', // current user's reaction
        displayName: 'Current User',
        avatarUrl: 'https://example.com/current.jpg',
        reaction: '👍',
        reactedAt: new Date().toISOString(),
      },
    });

    const wrapper = await mountSuspended(DmReactionDisplay, {
      props: {
        reactions,
        isMine: true,
      },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')![0]).toEqual(['👍']);
  });

  it('does not emit remove when clicked by non-owner', async () => {
    const reactions = createMockReactions({
      receiver: {
        username: 'otheruser', // not the current user
        displayName: 'Other User',
        avatarUrl: 'https://example.com/other.jpg',
        reaction: '�',
        reactedAt: new Date().toISOString(),
      },
    });

    const wrapper = await mountSuspended(DmReactionDisplay, {
      props: {
        reactions,
        isMine: true,
      },
    });

    await wrapper.find('button').trigger('click');

    // Should not emit remove since current user doesn't own this reaction
    expect(wrapper.emitted('remove')).toBeFalsy();
  });
});
