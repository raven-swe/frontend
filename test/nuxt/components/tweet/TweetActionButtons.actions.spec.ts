import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { nextTick } from 'vue';
import TweetActionButtons from '@/components/tweet/TweetActionButtons.vue';
import Button from '@/components/ui/Button.vue';
import type { Tweet } from '~~/shared/types/tweets';

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

  it('clicking like calls likeTweet once and emits like-success; pending prevents double call', async () => {
    const def = deferred<{ success: boolean }>();
    mocks.svc.likeTweet.mockReturnValueOnce(def.promise);

    const tweet = makeTweet({ isLiked: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const likeBtn = buttons[2]!;

    // Rapid double click before resolution
    await likeBtn.trigger('click');
    await likeBtn.trigger('click');
    expect(mocks.svc.likeTweet).toHaveBeenCalledTimes(1);
    expect(mocks.svc.likeTweet).toHaveBeenCalledWith('tw-1');

    // Resolve and ensure event emitted on success
    def.resolve({ success: true });
    await Promise.resolve();
    expect(wrapper.emitted()['like-success']).toBeTruthy();
  });

  it('clicking unlike calls unLikeTweet and emits unlike-success', async () => {
    mocks.svc.unLikeTweet.mockResolvedValueOnce({ success: true });
    const tweet = makeTweet({ isLiked: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const unlikeBtn = buttons[2]!;

    await unlikeBtn.trigger('click');
    expect(mocks.svc.unLikeTweet).toHaveBeenCalledWith('tw-1');
    expect(wrapper.emitted()['unlike-success']).toBeTruthy();
  });

  it('unlike pending prevents double call', async () => {
    const def = deferred<{ success: boolean }>();
    mocks.svc.unLikeTweet.mockReturnValueOnce(def.promise);
    const tweet = makeTweet({ isLiked: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const unlikeBtn = buttons[2]!;

    await unlikeBtn.trigger('click');
    await unlikeBtn.trigger('click');
    expect(mocks.svc.unLikeTweet).toHaveBeenCalledTimes(1);

    def.resolve({ success: true });
    await Promise.resolve();
  });

  it('handles like error path with optimistic emit then revert', async () => {
    mocks.svc.likeTweet.mockRejectedValueOnce(new Error('like-err'));
    const tweet = makeTweet({ isLiked: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const likeBtn = buttons[2]!;

    await likeBtn.trigger('click');
    await Promise.resolve();
    // Optimistic success fired
    expect(wrapper.emitted()['like-success']).toHaveLength(1);
    // Revert fired on error
    expect(wrapper.emitted()['unlike-success']).toHaveLength(1);
  });

  it('reverts like when service returns success=false (optimistic then revert)', async () => {
    mocks.svc.likeTweet.mockResolvedValueOnce({ success: false });
    const tweet = makeTweet({ isLiked: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const likeBtn = buttons[2]!;

    await likeBtn.trigger('click');
    await Promise.resolve();
    expect(wrapper.emitted()['like-success']).toHaveLength(1);
    expect(wrapper.emitted()['unlike-success']).toHaveLength(1);
  });

  it('clicking retweet calls retweetTweet; pending prevents double; emits retweet-success', async () => {
    const def = deferred<{ success: boolean }>();
    mocks.svc.retweetTweet.mockReturnValueOnce(def.promise);
    const tweet = makeTweet({ isRetweeted: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });

    // First open the dropdown
    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    // Then find and click the retweet action item
    const retweetItem = document.querySelector(
      '[data-testid="retweet-action-item"]',
    ) as HTMLElement;
    expect(retweetItem).not.toBeNull();

    await retweetItem.click();
    await retweetItem.click(); // Test double click prevention

    expect(mocks.svc.retweetTweet).toHaveBeenCalledTimes(1);
    expect(mocks.svc.retweetTweet).toHaveBeenCalledWith('tw-1');

    def.resolve({ success: true });
    await Promise.resolve();
    expect(wrapper.emitted()['retweet-success']).toBeTruthy();

    wrapper.unmount();
  });

  it('clicking undo-retweet calls undoRetweetTweet and emits undo-retweet-success', async () => {
    mocks.svc.undoRetweetTweet.mockResolvedValueOnce({ success: true });
    const tweet = makeTweet({ isRetweeted: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });

    // First open the dropdown
    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    // Then find and click the undo retweet action item
    const undoItem = document.querySelector('[data-testid="retweet-action-item"]') as HTMLElement;
    expect(undoItem).not.toBeNull();

    await undoItem.click();

    expect(mocks.svc.undoRetweetTweet).toHaveBeenCalledWith('tw-1');
    expect(wrapper.emitted()['undo-retweet-success']).toBeTruthy();

    wrapper.unmount();
  });

  it('undo-retweet pending prevents double call', async () => {
    const def = deferred<{ success: boolean }>();
    mocks.svc.undoRetweetTweet.mockReturnValueOnce(def.promise);
    const tweet = makeTweet({ isRetweeted: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });

    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    const undoItem = document.querySelector('[data-testid="retweet-action-item"]') as HTMLElement;
    expect(undoItem).not.toBeNull();

    await undoItem.click();
    await undoItem.click(); // Test double click prevention

    expect(mocks.svc.undoRetweetTweet).toHaveBeenCalledTimes(1);

    def.resolve({ success: true });
    await Promise.resolve();

    wrapper.unmount();
  });

  it('handles unlike error path with optimistic emit then revert', async () => {
    mocks.svc.unLikeTweet.mockRejectedValueOnce(new Error('unlike-err'));
    const tweet = makeTweet({ isLiked: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const unlikeBtn = buttons[2]!;

    await unlikeBtn.trigger('click');
    await Promise.resolve();
    expect(wrapper.emitted()['unlike-success']).toHaveLength(1);
    expect(wrapper.emitted()['like-success']).toHaveLength(1);
  });

  it('reverts unlike when service returns success=false (optimistic then revert)', async () => {
    mocks.svc.unLikeTweet.mockResolvedValueOnce({ success: false });
    const tweet = makeTweet({ isLiked: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const unlikeBtn = buttons[2]!;

    await unlikeBtn.trigger('click');
    await Promise.resolve();
    expect(wrapper.emitted()['unlike-success']).toHaveLength(1);
    expect(wrapper.emitted()['like-success']).toHaveLength(1);
  });

  it('handles retweet error path with optimistic emit then revert', async () => {
    mocks.svc.retweetTweet.mockRejectedValueOnce(new Error('retweet-err'));
    const tweet = makeTweet({ isRetweeted: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
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

    expect(wrapper.emitted()['retweet-success']).toHaveLength(1);
    expect(wrapper.emitted()['undo-retweet-success']).toHaveLength(1);

    wrapper.unmount();
  });

  it('reverts retweet when service returns success=false (optimistic then revert)', async () => {
    mocks.svc.retweetTweet.mockResolvedValueOnce({ success: false });
    const tweet = makeTweet({ isRetweeted: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
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

    expect(wrapper.emitted()['retweet-success']).toHaveLength(1);
    expect(wrapper.emitted()['undo-retweet-success']).toHaveLength(1);

    wrapper.unmount();
  });

  it('handles undo-retweet error path with optimistic emit then revert', async () => {
    mocks.svc.undoRetweetTweet.mockRejectedValueOnce(new Error('undo-err'));
    const tweet = makeTweet({ isRetweeted: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });

    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    const undoItem = document.querySelector('[data-testid="retweet-action-item"]') as HTMLElement;
    expect(undoItem).not.toBeNull();

    await undoItem.click();
    await Promise.resolve();

    expect(wrapper.emitted()['undo-retweet-success']).toHaveLength(1);
    expect(wrapper.emitted()['retweet-success']).toHaveLength(1);

    wrapper.unmount();
  });

  it('reverts undo-retweet when service returns success=false (optimistic then revert)', async () => {
    mocks.svc.undoRetweetTweet.mockResolvedValueOnce({ success: false });
    const tweet = makeTweet({ isRetweeted: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });

    const dropdownTrigger = wrapper.find('[data-testid="retweet-dropdown-trigger"]');
    await dropdownTrigger.trigger('click');
    await nextTick();

    const undoItem = document.querySelector('[data-testid="retweet-action-item"]') as HTMLElement;
    expect(undoItem).not.toBeNull();

    await undoItem.click();
    await Promise.resolve();

    expect(wrapper.emitted()['undo-retweet-success']).toHaveLength(1);
    expect(wrapper.emitted()['retweet-success']).toHaveLength(1);

    wrapper.unmount();
  });

  it('share copies link to clipboard and shows success toaster', async () => {
    // Mock navigator.clipboard
    const writeText = vi.fn().mockResolvedValue(undefined);
    (
      globalThis as unknown as {
        navigator: { clipboard: { writeText: (s: string) => Promise<void> } };
      }
    ).navigator = {
      clipboard: { writeText },
    } as { clipboard: { writeText: (s: string) => Promise<void> } };

    const tweet = makeTweet({ id: '42', author: { ...makeTweet().author, username: 'user' } });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const shareBtn = buttons[3]!;

    await shareBtn.trigger('click');
    expect(writeText).toHaveBeenCalled();
    expect(writeText.mock.calls[0]![0]!).toContain('/user/status/42');
    expect(mocks.showToaster).toHaveBeenCalledWith('success', 'Link copied to clipboard');
  });

  it('share handles clipboard error and shows error toaster', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    (
      globalThis as unknown as {
        navigator: { clipboard: { writeText: (s: string) => Promise<void> } };
      }
    ).navigator = {
      clipboard: { writeText },
    } as { clipboard: { writeText: (s: string) => Promise<void> } };

    const tweet = makeTweet({ id: '99', author: { ...makeTweet().author, username: 'me' } });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
    });
    const buttons = wrapper.findAllComponents(Button);
    const shareBtn = buttons[3]!;

    await shareBtn.trigger('click');
    expect(mocks.showToaster).toHaveBeenCalledWith('error', 'Failed to copy link');
  });
});
