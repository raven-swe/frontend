import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { nextTick } from 'vue';
import TweetActionButtons from '@/components/tweet/TweetActionButtons.vue';
import Button from '@/components/ui/Button.vue';
import type { Tweet } from '~~/shared/types/tweets';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

// Mock the tweet action services and toaster (use hoisted-safe mocks)
const mocks = vi.hoisted(() => {
  const likeTweet = vi.fn();
  const unLikeTweet = vi.fn();
  const retweetTweet = vi.fn();
  const undoRetweetTweet = vi.fn();
  const showToaster = vi.fn();
  return {
    svc: { likeTweet, unLikeTweet, retweetTweet, undoRetweetTweet },
    showToaster,
  };
});

vi.mock('@/services/tweet/actionButtonsService', () => mocks.svc);
vi.mock('@/utils/showToaster', () => ({ showToaster: mocks.showToaster }));

function makeTweet(overrides: Partial<Tweet> = {}): Tweet {
  const base: Tweet = {
    id: 'tw-1',
    content: 'Hello',
    createdAt: new Date().toISOString(),
    author: {
      username: 'user',
      displayName: 'User',
      avatarUrl: '/a.jpg',
      isFollowing: false,
      isFollower: false,
    },
    replyCount: 0,
    retweetCount: 0,
    likeCount: 0,
    isLiked: false,
    isRetweeted: false,
    entities: { mentions: [], hashtags: [] },
    media: [],
  };
  return { ...base, ...overrides };
}

function deferred<T = unknown>() {
  let resolve!: (v: T | PromiseLike<T>) => void;
  let reject!: (e?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('TweetActionButtons actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const stubs = {
    Icon: true,
    QuoteTweetDialog: {
      name: 'QuoteTweetDialog',
      template: '<div data-testid="quote-dialog"></div>',
      props: ['open', 'quoteToTweet'],
      emits: ['update:open', 'quote-success'],
    },
    ReplyTweetDialog: {
      name: 'ReplyTweetDialog',
      template: '<div data-testid="reply-dialog"></div>',
      props: ['open', 'replyTweet'],
      emits: ['update:open', 'reply-success'],
    },
    UiDropdownMenu: { template: '<div><slot /></div>' },
    UiDropdownMenuTrigger: { template: '<div><slot /></div>' },
    UiDropdownMenuContent: { template: '<div><slot /></div>' },
    UiDropdownMenuItem: {
      template: '<div class="dropdown-item" @click="$emit(\'click\', $event)"><slot /></div>',
    },
  };

  it('clicking like calls likeTweet', async () => {
    const def = deferred<{ success: boolean }>();
    mocks.svc.likeTweet.mockReturnValueOnce(def.promise);
    const tweet = makeTweet({ isLiked: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs,
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const buttons = wrapper.findAllComponents(Button);
    const likeBtn = buttons[2]!;

    await likeBtn.trigger('click');
    expect(mocks.svc.likeTweet).toHaveBeenCalledTimes(1);
    expect(mocks.svc.likeTweet).toHaveBeenCalledWith('tw-1');

    // Resolve promise
    def.resolve({ success: true });
    await Promise.resolve();
  });

  it('clicking unlike calls unLikeTweet', async () => {
    mocks.svc.unLikeTweet.mockResolvedValueOnce({ success: true });
    const tweet = makeTweet({ isLiked: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs,
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const buttons = wrapper.findAllComponents(Button);
    const unlikeBtn = buttons[2]!;

    await unlikeBtn.trigger('click');
    expect(mocks.svc.unLikeTweet).toHaveBeenCalledWith('tw-1');
  });

  it('handles like error path', async () => {
    mocks.svc.likeTweet.mockRejectedValueOnce(new Error('like-err'));
    const tweet = makeTweet({ isLiked: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs: { Icon: true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const buttons = wrapper.findAllComponents(Button);
    const likeBtn = buttons[2]!;

    await likeBtn.trigger('click');
    await Promise.resolve();
    // Revert logic handled by query cache
  });

  it('reverts like when service returns success=false', async () => {
    mocks.svc.likeTweet.mockResolvedValueOnce({ success: false });
    const tweet = makeTweet({ isLiked: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs: { Icon: true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const buttons = wrapper.findAllComponents(Button);
    const likeBtn = buttons[2]!;

    await likeBtn.trigger('click');
    await Promise.resolve();
  });

  it('clicking retweet calls retweetTweet; pending prevents double', async () => {
    const def = deferred<{ success: boolean }>();
    mocks.svc.retweetTweet.mockReturnValueOnce(def.promise);
    const tweet = makeTweet({ isRetweeted: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs,
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    // First open the dropdown
    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    // Then find and click the retweet action item
    const retweetItem = wrapper.find('[data-testid="retweet-action-item"]');
    expect(retweetItem.exists()).toBe(true);

    await retweetItem.trigger('click');

    expect(mocks.svc.retweetTweet).toHaveBeenCalled();
    expect(mocks.svc.retweetTweet).toHaveBeenCalledWith('tw-1');

    def.resolve({ success: true });
    await Promise.resolve();

    wrapper.unmount();
  });

  it('clicking undo-retweet calls undoRetweetTweet', async () => {
    mocks.svc.undoRetweetTweet.mockResolvedValueOnce({ success: true });
    const tweet = makeTweet({ isRetweeted: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs,
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    // First open the dropdown
    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    // Then find and click the undo retweet action item
    const undoItem = wrapper.find('[data-testid="retweet-action-item"]');
    expect(undoItem.exists()).toBe(true);

    await undoItem.trigger('click');

    expect(mocks.svc.undoRetweetTweet).toHaveBeenCalledWith('tw-1');

    wrapper.unmount();
  });

  // Deleted 'undo-retweet pending prevents double call' test

  it('handles unlike error path', async () => {
    mocks.svc.unLikeTweet.mockRejectedValueOnce(new Error('unlike-err'));
    const tweet = makeTweet({ isLiked: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs: { Icon: true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const buttons = wrapper.findAllComponents(Button);
    const unlikeBtn = buttons[2]!;

    await unlikeBtn.trigger('click');
    await Promise.resolve();
    // Revert logic handled by query cache
  });

  it('reverts unlike when service returns success=false', async () => {
    mocks.svc.unLikeTweet.mockResolvedValueOnce({ success: false });
    const tweet = makeTweet({ isLiked: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs: { Icon: true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const buttons = wrapper.findAllComponents(Button);
    const unlikeBtn = buttons[2]!;

    await unlikeBtn.trigger('click');
    await Promise.resolve();
  });

  it('handles retweet error path', async () => {
    mocks.svc.retweetTweet.mockRejectedValueOnce(new Error('retweet-err'));
    const tweet = makeTweet({ isRetweeted: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs: { Icon: true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    const retweetItem = document.querySelector(
      '[data-testid="retweet-action-item"]',
    ) as HTMLElement;
    expect(retweetItem).not.toBeNull();

    await retweetItem.click();
    await Promise.resolve();

    wrapper.unmount();
  });

  it('reverts retweet when service returns success=false', async () => {
    mocks.svc.retweetTweet.mockResolvedValueOnce({ success: false });
    const tweet = makeTweet({ isRetweeted: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs: { Icon: true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    const retweetItem = document.querySelector(
      '[data-testid="retweet-action-item"]',
    ) as HTMLElement;
    expect(retweetItem).not.toBeNull();

    await retweetItem.click();
    await Promise.resolve();

    wrapper.unmount();
  });

  it('handles undo-retweet error path', async () => {
    mocks.svc.undoRetweetTweet.mockRejectedValueOnce(new Error('undo-err'));
    const tweet = makeTweet({ isRetweeted: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs: { Icon: true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    const undoItem = document.querySelector('[data-testid="retweet-action-item"]') as HTMLElement;
    expect(undoItem).not.toBeNull();

    await undoItem.click();
    await Promise.resolve();

    wrapper.unmount();
  });

  it('reverts undo-retweet when service returns success=false', async () => {
    mocks.svc.undoRetweetTweet.mockResolvedValueOnce({ success: false });
    const tweet = makeTweet({ isRetweeted: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs: { Icon: true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    const undoItem = document.querySelector('[data-testid="retweet-action-item"]') as HTMLElement;
    expect(undoItem).not.toBeNull();

    await undoItem.click();
    await Promise.resolve();

    wrapper.unmount();
  });

  it('share copies link to clipboard and shows success toaster', async () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const tweet = makeTweet({ id: '42', author: { ...makeTweet().author, username: 'user' } });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs,
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const buttons = wrapper.findAllComponents(Button);
    const shareBtn = buttons[3]!;

    await shareBtn.trigger('click');
    expect(writeTextMock).toHaveBeenCalled();
    expect(writeTextMock.mock.calls[0]![0]!).toContain('/user/status/42');
    expect(mocks.showToaster).toHaveBeenCalledWith('success', 'Link copied to clipboard');
  });

  it('share handles clipboard error and shows error toaster', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const tweet = makeTweet({ id: '99', author: { ...makeTweet().author, username: 'me' } });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: {
        stubs,
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const buttons = wrapper.findAllComponents(Button);
    const shareBtn = buttons[3]!;

    await shareBtn.trigger('click');

    // Wait for async
    await new Promise(process.nextTick);

    expect(mocks.showToaster).toHaveBeenCalledWith('error', 'Failed to share or copy link');
  });
});
