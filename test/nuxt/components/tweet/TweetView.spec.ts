import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { VueQueryPlugin } from '@tanstack/vue-query';
import TweetDefaultCard from '@/components/tweet/TweetView.vue';
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

describe('TweetView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders header: avatar, display name, @username and relative time', async () => {
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet: tweetMock },
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
    const mockTweetLocal = JSON.parse(JSON.stringify(tweetMock));
    mockTweetLocal.author.avatarUrl = undefined;

    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet: mockTweetLocal },
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

    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet: mockTweetLocal, media: true },
      global: globalConfig,
    });

    const media = wrapper.findComponent(TweetMedia);
    expect(media.exists()).toBe(true);
    expect(media.props('media')).toEqual(mockTweetLocal.media);

    const actions = wrapper.findComponent(TweetActionButtons);
    expect(actions.exists()).toBe(true);
    expect(actions.props('tweet')).toEqual(mockTweetLocal);
  });

  it('triggers AI summary when button is clicked', async () => {
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet: tweetMock },
      global: globalConfig,
    });

    const buttons = wrapper.findAll('button');
    const aiBtn = buttons.find((b) => b.html().includes('vscode-icons:file-type-gemini'));

    expect(aiBtn?.exists()).toBe(true);
    await aiBtn?.trigger('click');

    expect(handleAiSummaryMock).toHaveBeenCalled();
  });
});
