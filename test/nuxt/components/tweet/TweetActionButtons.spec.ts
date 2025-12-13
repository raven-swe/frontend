import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetActionButtons from '@/components/tweet/TweetActionButtons.vue';
import Button from '@/components/ui/Button.vue';
import type { Tweet } from '~~/shared/types/tweets';
import {
  likeTweet,
  unLikeTweet,
  retweetTweet,
  undoRetweetTweet,
} from '~/services/tweet/actionButtonsService';
import { showToaster } from '~/utils/showToaster';

vi.mock('~/services/tweet/actionButtonsService', () => ({
  likeTweet: vi.fn(),
  unLikeTweet: vi.fn(),
  retweetTweet: vi.fn(),
  undoRetweetTweet: vi.fn(),
}));

vi.mock('~/utils/showToaster', () => ({
  showToaster: vi.fn(),
}));

vi.mock('~/utils/tweetLink', () => ({
  buildTweetLink: vi.fn((username, id) => `http://mock-link/${username}/${id}`),
}));

const writeTextMock = vi.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: writeTextMock,
  },
  writable: true,
});

function makeTweet(overrides: Partial<Tweet> = {}): Tweet {
  const base: Tweet = {
    id: '1',
    content: 'Hello world',
    createdAt: new Date().toISOString(),
    author: {
      username: 'aestheticsguy',
      displayName: 'Aesthetics X',
      avatarUrl: '/avatar.jpg',
      isFollowing: false,
      isFollower: false,
    },
    replyCount: 31,
    retweetCount: 1205,
    likeCount: 205000,
    isLiked: false,
    isRetweeted: false,
    entities: { mentions: [], hashtags: [] },
    media: [],
  };
  return { ...base, ...overrides };
}

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

describe('TweetActionButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders reply, retweet, like counts and share button', async () => {
    const tweet = makeTweet({ replyCount: 5, retweetCount: 10, likeCount: 20 });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    // Three labels (reply, retweet, like) + one share button
    const labels = wrapper.findAll('label');
    expect(labels).toHaveLength(3);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons).toHaveLength(4);

    // Counts visible
    expect(wrapper.text()).toContain('5');
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('20');

    // Share button variant
    const shareButton = buttons[3]!;
    expect(shareButton.props('variant')).toBe('tweet-icon-blue');
    expect(shareButton.props('size')).toBe('icon-md');
  });

  it('uses non-active styles when retweeted=false, liked=false', async () => {
    const tweet = makeTweet({ isRetweeted: false, isLiked: false });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const buttons = wrapper.findAllComponents(Button);

    // Retweet button should be non-active style when NOT retweeted
    expect(buttons[1]!.props('variant')).toBe('tweet-icon-turquoise');

    // Like button should be non-active style and outline heart icon
    expect(buttons[2]!.props('variant')).toBe('tweet-icon-red');

    // Like label should NOT include text-brand-red class
    const likeLabel = wrapper.findAll('label')[2]!;
    expect(likeLabel.classes()).not.toContain('text-brand-red');

    // Icon name for like (stubbed)
    expect(wrapper.html()).toContain('tabler:heart');
  });

  it('uses active styles when retweeted=true, liked=true', async () => {
    const tweet = makeTweet({ isRetweeted: true, isLiked: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const buttons = wrapper.findAllComponents(Button);

    // Retweet button should be active variant when retweeted=true (per component template)
    expect(buttons[1]!.props('variant')).toBe('tweet-icon-turquoise-active');

    // Like button should be active variant & label colored
    expect(buttons[2]!.props('variant')).toBe('tweet-icon-red-active');
    const likeLabel = wrapper.findAll('label')[2]!;
    expect(likeLabel.classes()).toContain('text-brand-red');

    // Icon name for liked (stubbed)
    expect(wrapper.html()).toContain('line-md:heart-filled');
  });

  it('handles like action: calls service and emits success', async () => {
    const tweet = makeTweet({ isLiked: false, id: '123' });
    (likeTweet as Mock).mockResolvedValue({ success: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const likeBtn = wrapper.findAllComponents(Button)[2];
    expect(likeBtn).toBeDefined();
    await likeBtn!.trigger('click');

    expect(wrapper.emitted('like-success')).toBeTruthy();
    expect(likeTweet).toHaveBeenCalledWith('123');
  });

  it('handles unlike action: calls service and emits success', async () => {
    const tweet = makeTweet({ isLiked: true, id: '123' });
    (unLikeTweet as Mock).mockResolvedValue({ success: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const likeBtn = wrapper.findAllComponents(Button)[2];
    expect(likeBtn).toBeDefined();
    await likeBtn!.trigger('click');

    expect(wrapper.emitted('unlike-success')).toBeTruthy();
    expect(unLikeTweet).toHaveBeenCalledWith('123');
  });

  it('reverts like state on API failure', async () => {
    const tweet = makeTweet({ isLiked: false });
    (likeTweet as Mock).mockRejectedValue(new Error('fail'));
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const likeBtn = wrapper.findAllComponents(Button)[2];
    expect(likeBtn).toBeDefined();
    await likeBtn!.trigger('click');

    // Optimistic update emitted like-success
    expect(wrapper.emitted('like-success')).toBeTruthy();
    // Revert emitted unlike-success
    // Wait for async promise to settle
    await new Promise(process.nextTick);
    expect(wrapper.emitted('unlike-success')).toBeTruthy();
  });

  it('reverts unlike state on API failure', async () => {
    const tweet = makeTweet({ isLiked: true });
    (unLikeTweet as Mock).mockRejectedValue(new Error('fail'));
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const likeBtn = wrapper.findAllComponents(Button)[2];
    expect(likeBtn).toBeDefined();
    await likeBtn!.trigger('click');

    expect(wrapper.emitted('unlike-success')).toBeTruthy();
    await new Promise(process.nextTick);
    expect(wrapper.emitted('like-success')).toBeTruthy();
  });

  it('handles retweet action', async () => {
    const tweet = makeTweet({ isRetweeted: false, id: '123' });
    (retweetTweet as Mock).mockResolvedValue({ success: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    // Find retweet dropdown item
    const retweetItem = wrapper.find('[data-testid="retweet-action-item"]');
    expect(retweetItem.exists()).toBe(true);

    await retweetItem.trigger('click');

    expect(wrapper.emitted('retweet-success')).toBeTruthy();
    expect(retweetTweet).toHaveBeenCalledWith('123');
  });

  it('handles undo retweet action', async () => {
    const tweet = makeTweet({ isRetweeted: true, id: '123' });
    (undoRetweetTweet as Mock).mockResolvedValue({ success: true });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const retweetItem = wrapper.find('[data-testid="retweet-action-item"]');
    await retweetItem.trigger('click');

    expect(wrapper.emitted('undo-retweet-success')).toBeTruthy();
    expect(undoRetweetTweet).toHaveBeenCalledWith('123');
  });

  it('reverts retweet on failure', async () => {
    const tweet = makeTweet({ isRetweeted: false });
    (retweetTweet as Mock).mockRejectedValue(new Error('fail'));
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const retweetItem = wrapper.find('[data-testid="retweet-action-item"]');
    await retweetItem.trigger('click');

    expect(wrapper.emitted('retweet-success')).toBeTruthy();
    await new Promise(process.nextTick);
    expect(wrapper.emitted('undo-retweet-success')).toBeTruthy();
  });

  it('reverts undo retweet on failure', async () => {
    const tweet = makeTweet({ isRetweeted: true });
    (undoRetweetTweet as Mock).mockRejectedValue(new Error('fail'));
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const retweetItem = wrapper.find('[data-testid="retweet-action-item"]');
    await retweetItem.trigger('click');

    expect(wrapper.emitted('undo-retweet-success')).toBeTruthy();
    await new Promise(process.nextTick);
    expect(wrapper.emitted('retweet-success')).toBeTruthy();
  });

  it('handles share action', async () => {
    const tweet = makeTweet({
      author: {
        ...makeTweet().author,
        username: 'user',
      },
      id: '123',
    });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const shareBtn = wrapper.findAllComponents(Button)[3];
    expect(shareBtn).toBeDefined();
    await shareBtn!.trigger('click');

    expect(writeTextMock).toHaveBeenCalledWith('http://mock-link/user/123');
    expect(showToaster).toHaveBeenCalledWith('success', 'Link copied to clipboard');
  });

  it('handles share action failure', async () => {
    const tweet = makeTweet();
    writeTextMock.mockRejectedValue(new Error('fail'));
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const shareBtn = wrapper.findAllComponents(Button)[3];
    expect(shareBtn).toBeDefined();
    await shareBtn!.trigger('click');

    // Wait for async
    await new Promise(process.nextTick);
    expect(showToaster).toHaveBeenCalledWith('error', 'Failed to copy link');
  });

  it('opens reply dialog and emits reply-success', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const replyBtn = wrapper.findAllComponents(Button)[0];
    expect(replyBtn).toBeDefined();
    await replyBtn!.trigger('click');

    const dialog = wrapper.findComponent({ name: 'ReplyTweetDialog' });
    expect(dialog.props('open')).toBe(true);

    const replyTweet = makeTweet({ id: 'reply' });
    dialog.vm.$emit('reply-success', replyTweet);

    expect(wrapper.emitted('reply-success')?.[0]).toEqual([replyTweet]);
  });

  it('opens quote dialog and emits retweet-success on quote success', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs },
    });

    const quoteItem = wrapper.find('[data-testid="quote-action-item"]');
    await quoteItem.trigger('click');

    const dialog = wrapper.findComponent({ name: 'QuoteTweetDialog' });
    expect(dialog.props('open')).toBe(true);

    dialog.vm.$emit('quote-success');
    expect(wrapper.emitted('retweet-success')).toBeTruthy();
  });
});
