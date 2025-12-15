import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import en from '@@/i18n/locales/en.json';
import type { ComponentMountingOptions } from '@vue/test-utils';
import type TweetIdPage from '@/pages/profile/[username]/status/[tweetid]/index.vue';
import TweetView from '~/components/tweet/TweetView.vue';
import { ref } from 'vue';

const i18n = createI18n({ locale: 'en', messages: { en } });

const mockTweetWithParent = {
  id: 'tw-thread-7',
  content:
    'hm worldly fuzzy subtract through emphasize when @smWUk39D46QO outside furthermore after hmph given without slimy which atop up @Vd70r0HKbb9t1c #fit #pearl https://uncomfortable-contractor.info/ lazy now gracefully sharply misreport whack unnecessarily @xE8iBDsQ phew but very apud',
  createdAt: '2025-12-07T20:36:52.974Z',
  author: {
    username: 'kpy3q1b',
    displayName: 'Tyra59',
    avatarUrl: 'https://avatars.githubusercontent.com/u/3699669',
    isFollowing: false,
    isFollower: true,
  },
  replyCount: 3,
  retweetCount: 91,
  likeCount: 245,
  isLiked: false,
  isRetweeted: false,
  entities: {
    mentions: [
      {
        username: 'smWUk39D46QO',
        startPosition: 49,
      },
      {
        username: 'Vd70r0HKbb9t1c',
        startPosition: 128,
      },
      {
        username: 'xE8iBDsQ',
        startPosition: 253,
      },
    ],
    hashtags: [
      {
        hashtag: 'fit',
        startPosition: 144,
      },
      {
        hashtag: 'pearl',
        startPosition: 149,
      },
    ],
  },
  media: [],
  replyToTweetId: 'tw-thread-6',
  hasMoreParents: true,
  parentTweets: [
    {
      id: 'tw-thread-3',
      content:
        'zowie troubled excepting lashes dramatize but fabricate red unsightly https://grimy-velocity.com/ furthermore https://hasty-newsprint.net amid yearn coop howl though verve reproachfully apostrophize haunting rapid quaff embody warmhearted https://wide-eyed-tennis.net/ beret afore #lashes quiet destock unselfish cone likewise beyond multicolored worth yet near depot beep',
      createdAt: '2025-12-07T20:36:48.971Z',
      author: {
        username: 'ehqbmo',
        displayName: 'Alysa_Mante4',
        avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/75.jpg',
        isFollowing: false,
        isFollower: true,
      },
      replyCount: 0,
      retweetCount: 10,
      likeCount: 217,
      isLiked: false,
      isRetweeted: true,
      entities: {
        mentions: [],
        hashtags: [
          {
            hashtag: 'lashes',
            startPosition: 281,
          },
        ],
      },
      media: [],
      quoteToTweetId: null,
      quotedTweet: null,
    },
    {
      id: 'tw-thread-4',
      content:
        'these intently quaintly ick of @fM5BOQ which palatable #pliers unit consequently patiently #tool near sadly term shovel concerning so since founder yippee colorful whoever knitting oh before proceed exalted desecrate adjudge fun with given properly https://elliptical-loyalty.net upon owlishly bah @Uo0XiNT3jm #hepatitis phooey https://terrible-government.com/ noisily off while waterlogged',
      createdAt: '2025-12-07T20:36:49.972Z',
      author: {
        username: 'wqvd2_z2mia6h',
        displayName: 'Jensen_Doyle',
        avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/78.jpg',
        isFollowing: true,
        isFollower: true,
      },
      replyCount: 0,
      retweetCount: 28,
      likeCount: 104,
      isLiked: true,
      isRetweeted: true,
      entities: {
        mentions: [
          {
            username: 'fM5BOQ',
            startPosition: 31,
          },
          {
            username: 'Uo0XiNT3jm',
            startPosition: 298,
          },
        ],
        hashtags: [
          {
            hashtag: 'pliers',
            startPosition: 55,
          },
          {
            hashtag: 'tool',
            startPosition: 91,
          },
          {
            hashtag: 'hepatitis',
            startPosition: 310,
          },
        ],
      },
      media: [],
      quoteToTweetId: null,
      quotedTweet: null,
    },
    {
      id: 'tw-thread-5',
      content:
        'inside eek starch to given toward #brace cool tired bonnet reluctantly saloon incidentally @cksw6WRLLE before pop nippy till angelic properly publicity',
      createdAt: '2025-12-07T20:36:50.972Z',
      author: {
        username: 'ny5q',
        displayName: 'Esta20',
        avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/24.jpg',
        isFollowing: false,
        isFollower: true,
      },
      replyCount: 0,
      retweetCount: 20,
      likeCount: 164,
      isLiked: false,
      isRetweeted: false,
      entities: {
        mentions: [
          {
            username: 'cksw6WRLLE',
            startPosition: 91,
          },
        ],
        hashtags: [
          {
            hashtag: 'brace',
            startPosition: 34,
          },
        ],
      },
      media: [],
      quoteToTweetId: null,
      quotedTweet: null,
    },
    {
      id: 'tw-thread-6',
      content:
        'wrongly forecast flashy astride https://unhealthy-waist.com suddenly developing barring yesterday molasses @HpQpj7SQwQ5Eu always gripping defrag fidget notwithstanding about beneath throughout er blank well-documented fill red',
      createdAt: '2025-12-07T20:36:51.973Z',
      author: {
        username: 'tq73oy',
        displayName: 'Guadalupe13',
        avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/23.jpg',
        isFollowing: true,
        isFollower: true,
      },
      replyCount: 0,
      retweetCount: 85,
      likeCount: 233,
      isLiked: true,
      isRetweeted: true,
      entities: {
        mentions: [
          {
            username: 'HpQpj7SQwQ5Eu',
            startPosition: 107,
          },
        ],
        hashtags: [],
      },
      media: [
        {
          type: 'VIDEO',
          url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          altText: 'Aestas vigor asperiores consectetur sui vester demens.',
          width: 1639,
          height: 464,
        },
      ],
      quoteToTweetId: null,
      quotedTweet: null,
    },
  ],
  quoteToTweetId: null,
  quotedTweet: null,
  rootTweet: {
    id: 'tw-thread-0',
    content:
      'smoggy besides ew #release cauliflower alongside hence evince weight @RAf throughout supposing psst valley @xchkvis_tECceW5 #sticker where @zWScbQH #tail',
    createdAt: '2025-12-07T20:36:45.968Z',
    author: {
      username: 'id9',
      displayName: 'Abel.Emard79',
      avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/15.jpg',
      isFollowing: true,
      isFollower: true,
    },
    replyCount: 2,
    retweetCount: 57,
    likeCount: 233,
    isLiked: false,
    isRetweeted: true,
    entities: {
      mentions: [
        {
          username: 'RAf',
          startPosition: 69,
        },
        {
          username: 'xchkvis_tECceW5',
          startPosition: 107,
        },
        {
          username: 'zWScbQH',
          startPosition: 139,
        },
      ],
      hashtags: [
        {
          hashtag: 'release',
          startPosition: 18,
        },
        {
          hashtag: 'sticker',
          startPosition: 124,
        },
        {
          hashtag: 'tail',
          startPosition: 148,
        },
      ],
    },
    media: [
      {
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/9632/579/419',
        altText: 'Veritatis veniam stillicidium tero conturbo averto paens cubicularis uterque.',
        width: 1576,
        height: 998,
      },
    ],
    hasMoreParents: false,
    parentTweets: null,
    quoteToTweetId: null,
    quotedTweet: null,
    rootTweet: null,
  },
};

const createWrapper = async ({
  props,
  options,
}:
  | {
      props?: ComponentMountingOptions<typeof TweetIdPage>['props'];
      options?: Partial<ComponentMountingOptions<typeof TweetIdPage>>;
    }
  | undefined = {}) => {
  const { default: tweetPage } = await import(
    '@/pages/profile/[username]/status/[tweetid]/index.vue'
  );
  return mountSuspended(tweetPage, {
    props,
    global: {
      plugins: [i18n],
    },
    route: {
      params: {
        username: mockTweetWithParent.author.username,
        tweetid: mockTweetWithParent.id,
      },
    },
    ...options,
  });
};

describe('/pages/profile/[username]/status/[tweetid].vue', () => {
  beforeEach(() => {
    vi.doMock('~/composables/tweet/useTweet', () => ({
      useTweetWithParents: vi.fn(() => ({
        data: ref(mockTweetWithParent),
        isPending: ref(false),
        error: ref(null),
        suspense: vi.fn(),
      })),
    }));
  });

  it('renders tweetView', async () => {
    const wrapper = await createWrapper();
    const tweetView = wrapper.findComponent(TweetView);
    expect(tweetView.exists()).toBe(true);
    expect(tweetView.props('tweet')).toEqual(mockTweetWithParent);
  });
});
