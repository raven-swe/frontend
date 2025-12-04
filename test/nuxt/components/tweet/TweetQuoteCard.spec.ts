import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TweetQuoteCard from '@/components/tweet/TweetQuoteCard.vue';
import Avatar from '@/components/ui/Avatar.vue';
import TweetMedia from '@/components/tweet/TweetMedia.vue';
import type { Tweet } from '~~/shared/types/tweets';

// Mock useRouter to capture push calls
let pushMock: ReturnType<typeof vi.fn> | undefined;
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => pushMock && pushMock(...args),
  }),
}));

// Mock i18n
const i18nMock = {
  locale: 'en',
  t: (key: string) => key,
};

// Common stubs
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
};

const globalConfig = {
  stubs,
  mocks: {
    $i18n: i18nMock,
  },
};

function makeTweet(overrides: Partial<Tweet> = {}): Tweet {
  const content = 'Quoted @user and #Tag in text';
  const tweet: Tweet = {
    id: 'qt-1',
    content,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3h ago
    author: {
      username: 'quoteduser',
      displayName: 'Quoted User',
      avatarUrl: '/q-avatar.jpg',
      isFollowing: false,
      isFollower: false,
    },
    replyCount: 0,
    retweetCount: 0,
    likeCount: 0,
    isLiked: false,
    isRetweeted: false,
    entities: {
      mentions: [{ username: 'user', startPosition: content.indexOf('@user') }],
      hashtags: [{ hashtag: 'Tag', startPosition: content.indexOf('#Tag') }],
    },
    media: [{ type: 'IMAGE', url: '/image-1.jpg', altText: 'image', width: 600, height: 400 }],
  };
  return { ...tweet, ...overrides };
}

describe('TweetQuoteCard.vue', () => {
  it('renders compact quote wrapper with avatar, names and time', () => {
    const tweet = makeTweet();
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });

    // Wrapper id
    const card = wrapper.find(`#quoted-tweet-${tweet.id}`);
    expect(card.exists()).toBe(true);

    // Avatar
    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.exists()).toBe(true);

    // Names
    expect(wrapper.text()).toContain('Quoted User');
    expect(wrapper.text()).toContain('@quoteduser');

    // Time element exists with required attributes
    const timeEl = wrapper.find('time');
    expect(timeEl.exists()).toBe(true);
    expect(timeEl.attributes('datetime')).toBe(tweet.createdAt);
    const title = timeEl.attributes('title');
    expect(title && title.length > 0).toBe(true);
  });

  it('links author to profile and content segments to correct hrefs', () => {
    const tweet = makeTweet();
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });

    // Author profile link
    const profileLink = wrapper.find('a[href="/profile/quoteduser"]');
    expect(profileLink.exists()).toBe(true);

    // Content mention and hashtag
    const mention = wrapper.find('a[href="/profile/user"]');
    expect(mention.exists()).toBe(true);
    expect(mention.text()).toContain('@user');

    const hashtag = wrapper.find('a[href="/hashtag/Tag"]');
    expect(hashtag.exists()).toBe(true);
    expect(hashtag.text()).toContain('#Tag');
  });

  it('renders media via TweetMedia in compact mode when media exists', () => {
    const tweet = makeTweet({
      media: [{ type: 'VIDEO', url: '/video.mp4', altText: 'v', width: 640, height: 360 }],
    });
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });

    const media = wrapper.findComponent(TweetMedia);
    expect(media.exists()).toBe(true);
    expect(media.props('media')).toEqual(tweet.media);
    // compact prop should be passed and truthy
    expect(media.props('compact')).toBe(true);
  });

  it('does not render TweetMedia when media is empty', () => {
    const tweet = makeTweet({ media: [] });
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });
    const media = wrapper.findComponent(TweetMedia);
    expect(media.exists()).toBe(false);
  });

  it('renders plain text when there are no entities', () => {
    const tweet = makeTweet({
      content: 'Just quoted text',
      entities: { mentions: [], hashtags: [] },
    });
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });
    const contentP = wrapper.find('p');
    expect(contentP.exists()).toBe(true);
    expect(contentP.text()).toContain('Just quoted text');
    expect(contentP.findAll('a').length).toBe(0);
  });

  it('renders plain text when entities is undefined (early return path)', () => {
    const tweet = makeTweet({ content: 'No entities here' } as Partial<Tweet>);
    const tObj = tweet as unknown as { entities?: unknown };
    delete tObj.entities;
    const wrapper = mount(TweetQuoteCard, {
      props: { tweet: tObj as unknown as Tweet },
      global: globalConfig,
    });
    const contentP = wrapper.find('p');
    expect(contentP.exists()).toBe(true);
    expect(contentP.text()).toContain('No entities here');
    expect(contentP.findAll('a').length).toBe(0);
  });

  it('handles only mentions when hashtags are undefined', () => {
    const content = 'Hello @user there';
    const tweet = makeTweet();
    tweet.content = content;
    const entities = {
      mentions: [{ username: 'user', startPosition: content.indexOf('@user') }],
      // hashtags omitted
    } as unknown as Tweet['entities'];
    tweet.entities = entities;
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });
    const mention = wrapper.find('a[href="/profile/user"]');
    expect(mention.exists()).toBe(true);
    expect(wrapper.text()).toContain('Hello');
    expect(wrapper.text()).toContain('there');
  });

  it('handles only hashtags when mentions are undefined', () => {
    const content = 'Hello #Tag there';
    const tweet = makeTweet();
    tweet.content = content;
    const entities = {
      hashtags: [{ hashtag: 'Tag', startPosition: content.indexOf('#Tag') }],
      // mentions omitted
    } as unknown as Tweet['entities'];
    tweet.entities = entities;
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });
    const hashtag = wrapper.find('a[href="/hashtag/Tag"]');
    expect(hashtag.exists()).toBe(true);
    expect(wrapper.text()).toContain('Hello');
    expect(wrapper.text()).toContain('there');
  });

  it('handles click on quote card without errors (click.stop)', async () => {
    const tweet = makeTweet();
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });
    const card = wrapper.find(`#quoted-tweet-${tweet.id}`);
    expect(card.exists()).toBe(true);
    await expect(card.trigger('click')).resolves.toBeUndefined();
    // Ensure card still exists and DOM unchanged in a basic way
    expect(wrapper.find(`#quoted-tweet-${tweet.id}`).exists()).toBe(true);
  });

  it('applies compact styling through TweetMedia (max width class present)', () => {
    const tweet = makeTweet({
      media: [{ type: 'GIF', url: '/gif.gif', altText: 'g', width: 200, height: 200 }],
    });
    const wrapper = mount(TweetQuoteCard, { props: { tweet }, global: globalConfig });
    const mediaWrap = wrapper.findComponent(TweetMedia);
    expect(mediaWrap.exists()).toBe(true);
    // Assert compact prop toggles component; internal class is applied at TweetMedia root
    expect(mediaWrap.props('compact')).toBe(true);
  });
});
