import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, type Ref } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import TweetDefaultCard from '@/components/tweet/TweetDefaultCard.vue';
import Avatar from '@/components/ui/Avatar.vue';
import TweetMedia from '@/components/tweet/TweetMedia.vue';
import TweetActionButtons from '@/components/tweet/TweetActionButtons.vue';
import type { Tweet } from '~~/shared/types/tweets';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
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
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(() => ({ href: '' })),
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

const tweetContent = 'Look @john_doe and #Nuxt3 is cool';

const tweetMock: Tweet = {
  id: 'tw-1',
  content: tweetContent,
  createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
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
  entities: {
    mentions: [{ username: 'john_doe', startPosition: tweetContent.indexOf('@john_doe') }],
    hashtags: [{ hashtag: 'Nuxt3', startPosition: tweetContent.indexOf('#Nuxt3') }],
  },
  media: [{ type: 'GIF', url: '/gif-1.gif', altText: 'gif', width: 200, height: 200 }],
};

const useTweetMock = vi.hoisted(() =>
  vi.fn((tweetId: string) => {
    const tweet = { ...tweetMock, id: tweetId };
    return { data: tweet as Tweet | Ref<Tweet> };
  }),
);

const useTweetReposterMock = vi.hoisted(() =>
  vi.fn((_reposterId: string) => {
    return {
      data: null as null | {
        username: string;
        displayName: string;
      },
    };
  }),
);

vi.mock('~/composables/tweet/useTweet', () => {
  return {
    useTweet: useTweetMock,
    useTweetReposter: useTweetReposterMock,
  };
});

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    user: {
      username: 'current_user',
    },
  }),
}));

// Stub components for faster tests
const stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
  NuxtImg: { template: '<img />' },
  Icon: { template: '<i />' },
  VideoPlayer: { template: '<div class="video-player-stub"></div>' },
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
};

const globalConfig = {
  stubs,
  plugins: [i18n, VueQueryPlugin],
};

describe('TweetDefaultCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('renders header: avatar, display name, @username and relative time', async () => {
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweetId: 'tw-1' },
      global: globalConfig,
    });

    // Avatar component receives proper props
    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.exists()).toBe(true);
    expect(avatar.props('img')).toBe('/avatar.jpg');
    expect(avatar.props('size')).toBe('sm');
    expect(avatar.props('variant')).toBe('primary');

    // Display name and @username
    expect(wrapper.text()).toContain('Aesthetics X');
    expect(wrapper.text()).toContain('@aestheticsguy');

    // Relative time: should be "2h"
    expect(wrapper.text()).toContain('2h');

    const profileLink = wrapper.find('a[href="/profile/aestheticsguy"]');
    expect(profileLink.exists()).toBe(true);
    // Use wrapper text to assert display name to avoid potential slot timing issues
    expect(wrapper.text()).toContain('Aesthetics X');

    const timeEl = wrapper.find('time');
    expect(timeEl.exists()).toBe(true);
    expect(timeEl.attributes('datetime')).toBe(tweetMock.createdAt);
    const title = timeEl.attributes('title');
    expect(title && title.length > 0).toBe(true);
  });

  it('falls back to default avatar when no avatarUrl is provided', async () => {
    useTweetMock.mockImplementationOnce((tweetId: string) => {
      const tweet = { ...tweetMock, id: tweetId };
      tweet.author.avatarUrl = '' as unknown as string;
      return { data: tweet };
    });

    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweetId: 'tw-1' },
      global: globalConfig,
    });

    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.exists()).toBe(true);
    expect(avatar.props('img')).toBe('/default_profile.png');
  });

  it('renders media and action buttons components with correct props', async () => {
    const mockTweetLocal = JSON.parse(JSON.stringify(tweetMock));
    mockTweetLocal.media = [
      { type: 'IMAGE', url: '/image-1.jpg', altText: 'image1', width: 400, height: 300 },
      { type: 'VIDEO', url: '/video-1.mp4', altText: 'video1', width: 640, height: 360 },
    ];

    useTweetMock.mockImplementationOnce((tweetId: string) => {
      const tweet = { ...mockTweetLocal, id: tweetId };
      return { data: tweet };
    });

    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweetId: 'tw-1' },
      global: globalConfig,
    });

    const media = wrapper.findComponent(TweetMedia);
    expect(media.exists()).toBe(true);
    expect(media.props('media')).toEqual(mockTweetLocal.media);

    const actions = wrapper.findComponent(TweetActionButtons);
    expect(actions.exists()).toBe(true);
    expect(actions.props('tweet')).toEqual(mockTweetLocal);
  });

  it('handle clicking on tweet navigates to tweet detail page', async () => {
    useTweetMock.mockImplementationOnce((tweetId: string) => {
      const tweet = { ...tweetMock, id: tweetId };
      return { data: ref(tweet) };
    });

    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweetId: 'tw-1' },
      global: globalConfig,
    });

    // Click the article element to ensure the handler runs
    const article = wrapper.find('article');
    expect(article.exists()).toBe(true);
    await article.trigger('click');

    expect(routerMock.push).toHaveBeenCalledWith(
      `/profile/${tweetMock.author.username}/status/tw-1`,
    );
  });

  it('triggers AI summary when button is clicked', async () => {
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweetId: 'tw-1' },
      global: globalConfig,
    });

    const buttons = wrapper.findAll('button');
    const aiBtn = buttons.find((b) => b.html().includes('vscode-icons:file-type-gemini'));

    expect(aiBtn?.exists()).toBe(true);
    await aiBtn?.trigger('click');

    expect(handleAiSummaryMock).toHaveBeenCalled();
  });

  it('renders "Retweeted by" header correctly', async () => {
    useTweetMock.mockImplementationOnce((tweetId: string) => {
      const tweet = {
        ...tweetMock,
        id: tweetId,
      };
      return { data: tweet };
    });

    useTweetReposterMock.mockImplementationOnce(() => {
      const reposter = {
        username: 'retweeter',
        displayName: 'Retweeter',
      };
      return { data: reposter };
    });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweetId: 'tw-1' },
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('Retweeter');
    expect(wrapper.text()).toContain('Reposted');
  });

  it('renders "Retweeted by you" when reposted by current user', async () => {
    useTweetMock.mockImplementationOnce((tweetId: string) => {
      const tweet = {
        ...tweetMock,
        id: tweetId,
      };
      return { data: tweet };
    });

    useTweetReposterMock.mockImplementationOnce(() => {
      const reposter = {
        username: 'current_user',
        displayName: 'Current User',
      };
      return { data: reposter };
    });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweetId: 'tw-1' },
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('You Reposted');
  });

  it('renders "Replying to" header', async () => {
    useTweetMock.mockImplementationOnce((tweetId: string) => {
      const parent = {
        ...tweetMock,
        id: 'tw-parent',
        author: {
          username: 'parent_user',
          displayName: 'Parent User',
          avatarUrl: '/parent-avatar.jpg',
          isFollowing: false,
        },
      };
      const childTweet = {
        ...tweetMock,
        id: tweetId,
        replyToTweet: parent,
      };
      return { data: childTweet };
    });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweetId: 'tw-1' },
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('Replying to');
    expect(wrapper.text()).toContain('@parent_user');
  });
});
