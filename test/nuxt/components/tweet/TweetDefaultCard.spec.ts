import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetDefaultCard from '@/components/tweet/TweetDefaultCard.vue';
import Avatar from '@/components/ui/Avatar.vue';
import TweetMedia from '@/components/tweet/TweetMedia.vue';
import TweetActionButtons from '@/components/tweet/TweetActionButtons.vue';
import type { Tweet } from '~~/shared/types/tweets';

function makeTweet(overrides: Partial<Tweet> = {}): Tweet {
  const content = 'Look @john_doe and #Nuxt3 is cool';
  const tweet: Tweet = {
    id: 'tw-1',
    content,
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
      mentions: [{ username: 'john_doe', startPosition: content.indexOf('@john_doe') }],
      hashtags: [{ hashtag: 'Nuxt3', startPosition: content.indexOf('#Nuxt3') }],
    },
    media: [{ type: 'GIF', url: '/gif-1.gif', altText: 'gif', width: 200, height: 200 }],
  };
  return { ...tweet, ...overrides };
}

describe('TweetDefaultCard.vue', () => {
  it('renders header: avatar, display name, @username and relative time', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: {
        stubs: {
          NuxtImg: true,
          Icon: true,
        },
      },
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
  });

  it('splits content into text + mention + hashtag links with correct hrefs', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    // Mention link
    const mention = wrapper.find('a[href="/@john_doe"]');
    expect(mention.exists()).toBe(true);
    expect(mention.text()).toContain('@john_doe');

    // Hashtag link
    const hashtag = wrapper.find('a[href="/hashtag/Nuxt3"]');
    expect(hashtag.exists()).toBe(true);
    expect(hashtag.text()).toContain('#Nuxt3');

    // Plain text chunks remain present
    expect(wrapper.text()).toContain('Look');
    expect(wrapper.text()).toContain('and');
    expect(wrapper.text()).toContain('is cool');
  });

  it('renders media and action buttons components with correct props', async () => {
    const tweet = makeTweet({
      media: [
        {
          type: 'VIDEO',
          url: '/video.mp4',
          altText: 'v',
          width: 640,
          height: 360,
        },
      ],
    });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const media = wrapper.findComponent(TweetMedia);
    expect(media.exists()).toBe(true);
    expect(media.props('media')).toEqual(tweet.media);

    const actions = wrapper.findComponent(TweetActionButtons);
    expect(actions.exists()).toBe(true);
    expect(actions.props('tweet')).toEqual(tweet);
  });

  it('handles adjacent entities without extra text (covers no-gap branch)', async () => {
    const content = '@john_doe #Nuxt3';
    const tweet = makeTweet({
      content,
      entities: {
        mentions: [{ username: 'john_doe', startPosition: 0 }],
        hashtags: [{ hashtag: 'Nuxt3', startPosition: content.indexOf('#Nuxt3') }],
      },
    });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    // Find links within the tweet content area (excluding author username link)
    const mentionLink = wrapper.find('a[href="/@john_doe"]');
    const hashtagLink = wrapper.find('a[href="/hashtag/Nuxt3"]');

    expect(mentionLink.exists()).toBe(true);
    expect(mentionLink.text()).toContain('@john_doe');
    expect(hashtagLink.exists()).toBe(true);
    expect(hashtagLink.text()).toContain('#Nuxt3');
  });

  it('renders plain text when there are no entities (covers early return)', async () => {
    const tweet = makeTweet({
      content: 'Just a plain tweet with no entities.',
      entities: { mentions: [], hashtags: [] },
    });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const contentP = wrapper.find('p');
    expect(contentP.exists()).toBe(true);
    // Should render text without any links
    expect(contentP.text()).toContain('Just a plain tweet with no entities.');
    expect(contentP.findAll('a').length).toBe(0);
  });

  it('renders plain text when entities is undefined (covers !entities branch)', async () => {
    const tweet = makeTweet({
      content: 'No entities field on this tweet.',
    } as Partial<Tweet>);
    // Force entities to be undefined to hit the first OR branch without using `any`
    const tObj = tweet as unknown as { entities?: unknown };
    delete tObj.entities;
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet: tObj as unknown as Tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const contentP = wrapper.find('p');
    expect(contentP.exists()).toBe(true);
    expect(contentP.text()).toContain('No entities field on this tweet.');
    expect(contentP.findAll('a').length).toBe(0);
  });

  it('updates like state on like-success when not previously liked', async () => {
    const tweet = makeTweet({ isLiked: false, likeCount: 10 });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const actions = wrapper.findComponent(TweetActionButtons);
    expect(actions.exists()).toBe(true);

    // Emit like-success from child
    actions.vm.$emit('like-success');
    await nextTick();

    // Props passed to child should reflect updated reactive tweet
    const updated = actions.props('tweet') as Tweet;
    expect(updated.isLiked).toBe(true);
    expect(updated.likeCount).toBe(11);
  });

  it('does nothing on like-success if already liked (no-op branch)', async () => {
    const tweet = makeTweet({ isLiked: true, likeCount: 5 });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const actions = wrapper.findComponent(TweetActionButtons);
    actions.vm.$emit('like-success');
    await nextTick();

    const updated = actions.props('tweet') as Tweet;
    expect(updated.isLiked).toBe(true);
    expect(updated.likeCount).toBe(5);
  });

  it('updates like state on unlike-success and clamps likeCount at 0', async () => {
    // Case 1: normal decrement
    const tweet1 = makeTweet({ isLiked: true, likeCount: 2 });
    const wrapper1 = await mountSuspended(TweetDefaultCard, {
      props: { tweet: tweet1 },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });
    const actions1 = wrapper1.findComponent(TweetActionButtons);
    actions1.vm.$emit('unlike-success');
    await nextTick();
    const updated1 = actions1.props('tweet') as Tweet;
    expect(updated1.isLiked).toBe(false);
    expect(updated1.likeCount).toBe(1);

    // Case 2: clamp at zero
    const tweet2 = makeTweet({ isLiked: true, likeCount: 0 });
    const wrapper2 = await mountSuspended(TweetDefaultCard, {
      props: { tweet: tweet2 },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });
    const actions2 = wrapper2.findComponent(TweetActionButtons);
    actions2.vm.$emit('unlike-success');
    await nextTick();
    const updated2 = actions2.props('tweet') as Tweet;
    expect(updated2.isLiked).toBe(false);
    expect(updated2.likeCount).toBe(0);
  });

  it('does nothing on unlike-success if not liked (no-op branch)', async () => {
    const tweet = makeTweet({ isLiked: false, likeCount: 3 });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });
    const actions = wrapper.findComponent(TweetActionButtons);
    actions.vm.$emit('unlike-success');
    await nextTick();
    const updated = actions.props('tweet') as Tweet;
    expect(updated.isLiked).toBe(false);
    expect(updated.likeCount).toBe(3);
  });

  it('updates retweet state on retweet-success when not previously retweeted', async () => {
    const tweet = makeTweet({ isRetweeted: false, retweetCount: 4 });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });
    const actions = wrapper.findComponent(TweetActionButtons);
    actions.vm.$emit('retweet-success');
    await nextTick();
    const updated = actions.props('tweet') as Tweet;
    expect(updated.isRetweeted).toBe(true);
    expect(updated.retweetCount).toBe(5);
  });

  it('does nothing on retweet-success if already retweeted (no-op branch)', async () => {
    const tweet = makeTweet({ isRetweeted: true, retweetCount: 8 });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });
    const actions = wrapper.findComponent(TweetActionButtons);
    actions.vm.$emit('retweet-success');
    await nextTick();
    const updated = actions.props('tweet') as Tweet;
    expect(updated.isRetweeted).toBe(true);
    expect(updated.retweetCount).toBe(8);
  });

  it('updates retweet state on undo-retweet-success and clamps retweetCount at 0', async () => {
    // Case 1: normal decrement
    const tweet1 = makeTweet({ isRetweeted: true, retweetCount: 2 });
    const wrapper1 = await mountSuspended(TweetDefaultCard, {
      props: { tweet: tweet1 },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });
    const actions1 = wrapper1.findComponent(TweetActionButtons);
    actions1.vm.$emit('undo-retweet-success');
    await nextTick();
    const updated1 = actions1.props('tweet') as Tweet;
    expect(updated1.isRetweeted).toBe(false);
    expect(updated1.retweetCount).toBe(1);

    // Case 2: clamp at zero
    const tweet2 = makeTweet({ isRetweeted: true, retweetCount: 0 });
    const wrapper2 = await mountSuspended(TweetDefaultCard, {
      props: { tweet: tweet2 },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });
    const actions2 = wrapper2.findComponent(TweetActionButtons);
    actions2.vm.$emit('undo-retweet-success');
    await nextTick();
    const updated2 = actions2.props('tweet') as Tweet;
    expect(updated2.isRetweeted).toBe(false);
    expect(updated2.retweetCount).toBe(0);
  });

  it('does nothing on undo-retweet-success if not retweeted (no-op branch)', async () => {
    const tweet = makeTweet({ isRetweeted: false, retweetCount: 7 });
    const wrapper = await mountSuspended(TweetDefaultCard, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });
    const actions = wrapper.findComponent(TweetActionButtons);
    actions.vm.$emit('undo-retweet-success');
    await nextTick();
    const updated = actions.props('tweet') as Tweet;
    expect(updated.isRetweeted).toBe(false);
    expect(updated.retweetCount).toBe(7);
  });
});
