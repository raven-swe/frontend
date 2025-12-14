import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { VueQueryPlugin } from '@tanstack/vue-query';
import TweetView from '@/components/tweet/TweetView.vue';
import Avatar from '@/components/ui/Avatar.vue';
import TweetMedia from '@/components/tweet/TweetMedia.vue';
import TweetActionButtons from '@/components/tweet/TweetActionButtons.vue';
import type { Tweet } from '~~/shared/types/tweets';
import type { Ref } from 'vue';
import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';

// Set up i18n
const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
  },
});

const { mutateFollow, mutateBlock } = vi.hoisted(() => ({
  mutateFollow: vi.fn(),
  mutateBlock: vi.fn(),
}));

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    user: { username: 'current_user' },
  }),
}));

vi.mock('~/composables/useProfileMutation', () => ({
  useFollowMutation: () => ({
    mutate: mutateFollow,
  }),
  useBlockMutation: () => ({
    mutate: mutateBlock,
  }),
}));

const setQueryDataMock = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/vue-query')>();
  return {
    ...actual,
    useQueryClient: () => ({
      setQueryData: setQueryDataMock,
    }),
  };
});

const routerMock = vi.hoisted(() => {
  return {
    currentRoute: {
      value: {
        params: {
          tweetid: 'tw-view-1',
        },
      },
    },
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    resolve: vi.fn(),
  };
});

mockNuxtImport('useRouter', () => {
  return () => routerMock;
});

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    t: (key: string) => key,
  });
});

const handleAiSummaryMock = vi.fn();

const stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
  NuxtImg: { template: '<img />' },
  Icon: { template: '<i />' },
  Avatar: Avatar,
  TweetMedia: TweetMedia,
  TweetActionButtons: TweetActionButtons,
  AiSummary: {
    template: '<div class="ai-summary-stub"></div>',
    methods: {
      handleAiSummary: handleAiSummaryMock,
    },
  },
  UserHoverCard: {
    name: 'UserHoverCard',
    template: '<div><slot /></div>',
    props: ['username'],
    emits: ['follow', 'block', 'unblock', 'unfollow'],
  },
  TweetDropdown: {
    template: '<div><slot /></div>',
    props: ['tweet', 'username'],
  },
  QuotedTweetCard: {
    template: '<div class="quoted-tweet-stub"></div>',
    props: ['tweet'],
  },
  ContentEntitiesRenderer: {
    name: 'ContentEntitiesRenderer',
    template: '<span>{{ content }}</span>',
    props: ['content', 'entities'],
  },
};

interface TweetViewVM {
  tweetClone: Ref<Tweet>;
}

function makeTweet(overrides: Partial<Tweet> = {}): Tweet {
  const content = 'Hello @alice check out #Testing';
  const tweet: Tweet = {
    id: 'tw-view-1',
    content,
    createdAt: new Date().toISOString(),
    author: {
      username: 'tester',
      displayName: 'Test User',
      avatarUrl: '/avatar.png',
      isFollowing: false,
      isFollower: false,
    },
    replyCount: 1,
    retweetCount: 2,
    likeCount: 3,
    isLiked: false,
    isRetweeted: false,
    entities: {
      mentions: [{ username: 'alice', startPosition: content.indexOf('@alice') }],
      hashtags: [{ hashtag: 'Testing', startPosition: content.indexOf('#Testing') }],
    },
    media: [
      {
        type: 'IMAGE',
        url: '/img.jpg',
        altText: 'img',
        width: 400,
        height: 300,
      },
    ],
  };
  return { ...tweet, ...overrides };
}

describe('TweetView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset router params
    routerMock.currentRoute.value.params.tweetid = 'tw-view-1';
  });

  it('renders header (avatar, display name, username) and time', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n, VueQueryPlugin] },
    });

    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.exists()).toBe(true);
    expect(avatar.props('img')).toBe('/avatar.png');

    expect(wrapper.text()).toContain('Test User');
    expect(wrapper.text()).toContain('@tester');
    // createdAt is rendered via formatDate — at least ensure year is present
    expect(wrapper.text()).toContain(new Date(tweet.createdAt).getFullYear().toString());
  });

  it('renders content with mention and hashtag links', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n, VueQueryPlugin] },
    });

    // Since we stub ContentEntitiesRenderer, we just check if it exists and props are passed
    const renderer = wrapper.findComponent({ name: 'ContentEntitiesRenderer' });
    expect(renderer.exists()).toBe(true);
    expect(renderer.props('content')).toBe(tweet.content);
  });

  it('renders media and action buttons with correct props when media=true', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet, media: true },
      global: {
        stubs: {
          NuxtImg: true,
          NuxtLink: { template: '<a><slot /></a>' },
          Icon: true,
          UserHoverCard: { template: '<div><slot /></div>' },
          TweetDropdown: true,
          ContentEntitiesRenderer: true,
          QuotedTweetCard: true,
          AiSummary: true,
          MediaItem: true,
        },
        plugins: [i18n, VueQueryPlugin],
      },
    });

    const media = wrapper.findComponent(TweetMedia);
    expect(media.exists()).toBe(true);
    expect(media.props('media')).toEqual(tweet.media);

    const actions = wrapper.findComponent(TweetActionButtons);
    expect(actions.exists()).toBe(true);
    // Check that the tweet prop is passed (actual values are reactive)
    expect(actions.props('tweet')).toBeDefined();
  });

  it('does not render media when media=false', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet, media: false },
      global: {
        stubs: {
          NuxtImg: true,
          NuxtLink: { template: '<a><slot /></a>' },
          Icon: true,
          UserHoverCard: { template: '<div><slot /></div>' },
          TweetDropdown: true,
          ContentEntitiesRenderer: true,
          QuotedTweetCard: true,
          AiSummary: true,
          MediaItem: true,
        },
      },
    });

    const media = wrapper.findComponent(TweetMedia);
    expect(media.exists()).toBe(false);
  });

  it('handles like/unlike events and updates state', async () => {
    const tweet = makeTweet({ isLiked: false, likeCount: 5 });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n] },
    });

    const actions = wrapper.findComponent(TweetActionButtons);

    // Emit like-success event
    await actions.vm.$emit('like-success');
    await wrapper.vm.$nextTick();

    // Access the reactive tweet ref
    const vm = wrapper.vm as unknown as TweetViewVM;
    expect(vm.tweetClone.value.isLiked).toBe(true);
    expect(vm.tweetClone.value.likeCount).toBe(6);

    // Emit unlike-success event
    await actions.vm.$emit('unlike-success');
    await wrapper.vm.$nextTick();

    expect(vm.tweetClone.value.isLiked).toBe(false);
    expect(vm.tweetClone.value.likeCount).toBe(5);
  });

  it('handles retweet/undo events and updates state', async () => {
    const tweet = makeTweet({ isRetweeted: false, retweetCount: 10 });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n] },
    });

    const actions = wrapper.findComponent(TweetActionButtons);

    // Emit retweet-success event
    await actions.vm.$emit('retweet-success');
    await wrapper.vm.$nextTick();

    // Access the reactive tweet ref
    const vm = wrapper.vm as unknown as TweetViewVM;
    expect(vm.tweetClone.value.isRetweeted).toBe(true);
    expect(vm.tweetClone.value.retweetCount).toBe(11);

    // Emit undo-retweet-success event
    await actions.vm.$emit('undo-retweet-success');
    await wrapper.vm.$nextTick();

    expect(vm.tweetClone.value.isRetweeted).toBe(false);
    expect(vm.tweetClone.value.retweetCount).toBe(10);
  });

  it('renders "Retweeted by" header correctly', async () => {
    const tweet = makeTweet({
      repostedBy: {
        username: 'retweeter',
        displayName: 'Retweeter',
      },
    });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n] },
    });

    expect(wrapper.text()).toContain('Retweeter');
    expect(wrapper.text()).toContain('Retweeter Reposted');
  });

  it('renders "Retweeted by you" when reposted by current user', async () => {
    const tweet = makeTweet({
      repostedBy: {
        username: 'current_user',
        displayName: 'Me',
      },
    });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n] },
    });

    expect(wrapper.text()).toContain('You Reposted');
  });

  it('triggers AI summary when button is clicked', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n] },
    });

    const buttons = wrapper.findAll('button');
    const aiBtn = buttons.find((b) => b.html().includes('vscode-icons:file-type-gemini'));

    expect(aiBtn?.exists()).toBe(true);
    await aiBtn?.trigger('click');

    expect(handleAiSummaryMock).toHaveBeenCalled();
  });

  it('emits user mutations from UserHoverCard instances', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n] },
    });

    const hoverCards = wrapper.findAllComponents({ name: 'UserHoverCard' });
    expect(hoverCards.length).toBeGreaterThan(0);

    // Iterate over all UserHoverCard instances to ensure coverage for all of them
    for (const card of hoverCards) {
      card.vm.$emit('follow');
      expect(mutateFollow).toHaveBeenLastCalledWith({
        username: tweet.author.username,
        action: 'follow',
      });

      card.vm.$emit('block');
      expect(mutateBlock).toHaveBeenLastCalledWith({
        username: tweet.author.username,
        action: 'block',
      });

      card.vm.$emit('unblock');
      expect(mutateBlock).toHaveBeenLastCalledWith({
        username: tweet.author.username,
        action: 'unblock',
      });

      card.vm.$emit('unfollow');
      expect(mutateFollow).toHaveBeenLastCalledWith({
        username: tweet.author.username,
        action: 'unfollow',
      });
    }
  });

  it('handles reply-success: increments replyCount and updates query cache if replying to same tweet', async () => {
    const tweet = makeTweet({ id: 'tw-view-1', replyCount: 5 });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n, VueQueryPlugin] },
    });

    const actions = wrapper.findComponent(TweetActionButtons);
    const replyTweet = makeTweet({ id: 'reply-1', replyToTweetId: 'tw-view-1' });

    const oldData = {
      pages: [
        {
          data: [makeTweet({ id: 'existing-reply' })],
          meta: {},
        },
      ],
      pageParams: [null],
    };

    setQueryDataMock.mockImplementation((key, updater) => {
      if (typeof updater === 'function') {
        return updater(oldData);
      }
      return updater;
    });

    actions.vm.$emit('reply-success', replyTweet);
    await wrapper.vm.$nextTick();

    const vm = wrapper.vm as unknown as TweetViewVM;
    expect(vm.tweetClone.value.replyCount).toBe(6);

    expect(setQueryDataMock).toHaveBeenCalledWith(
      ['tweet-replies', 'tw-view-1'],
      expect.any(Function),
    );
  });

  it('does not update query cache on reply-success if reply is not to this tweet', async () => {
    const tweet = makeTweet({ id: 'tw-view-1' });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n, VueQueryPlugin] },
    });

    const actions = wrapper.findComponent(TweetActionButtons);
    const replyTweet = makeTweet({ id: 'reply-1', replyToTweetId: 'other-tweet' });

    actions.vm.$emit('reply-success', replyTweet);
    await wrapper.vm.$nextTick();

    expect(setQueryDataMock).not.toHaveBeenCalled();
  });

  it('ensures likeCount and retweetCount do not go below zero', async () => {
    const tweet = makeTweet({ isLiked: true, likeCount: 0, isRetweeted: true, retweetCount: 0 });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n] },
    });

    const actions = wrapper.findComponent(TweetActionButtons);

    // Unlike when count is 0
    await actions.vm.$emit('unlike-success');
    await wrapper.vm.$nextTick();
    // @ts-expect-error accessing private state
    expect(wrapper.vm.tweetClone.value.likeCount).toBe(0);

    // Undo retweet when count is 0
    await actions.vm.$emit('undo-retweet-success');
    await wrapper.vm.$nextTick();
    // @ts-expect-error accessing private state
    expect(wrapper.vm.tweetClone.value.retweetCount).toBe(0);
  });

  it('does not update query cache if old data is missing', async () => {
    const tweet = makeTweet({ id: 'tw-view-1' });
    const replyTweet = makeTweet({ replyToTweetId: tweet.id });

    // Mock setQueryData to execute the callback
    setQueryDataMock.mockImplementation((key, callback) => {
      if (typeof callback === 'function') {
        // Case 1: old data is null
        const result1 = callback(null);
        expect(result1).toBeNull();

        // Case 2: old data has empty pages
        const result2 = callback({ pages: [], pageParams: [] });
        expect(result2).toEqual({ pages: [], pageParams: [] });
      }
    });

    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs, plugins: [i18n, VueQueryPlugin] },
    });

    const actions = wrapper.findComponent(TweetActionButtons);
    await actions.vm.$emit('reply-success', replyTweet);

    expect(setQueryDataMock).toHaveBeenCalled();
  });
});
