import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetView from '@/components/tweet/TweetView.vue';
import Avatar from '@/components/ui/Avatar.vue';
import TweetMedia from '@/components/tweet/TweetMedia.vue';
import TweetActionButtons from '@/components/tweet/TweetActionButtons.vue';
import type { Tweet } from '~~/shared/types/tweets';
import type { Ref } from 'vue';

interface TweetViewVM {
  tweet: Ref<Tweet>;
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
  it('renders header (avatar, display name, username) and time', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
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
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const mention = wrapper.find('a[href="/@alice"]');
    expect(mention.exists()).toBe(true);
    expect(mention.text()).toContain('@alice');

    const hashtag = wrapper.find('a[href="/hashtag/Testing"]');
    expect(hashtag.exists()).toBe(true);
    expect(hashtag.text()).toContain('#Testing');
  });

  it('renders media and action buttons with correct props when media=true', async () => {
    const tweet = makeTweet();
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet, media: true },
      global: { stubs: { NuxtImg: true, Icon: true } },
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
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const media = wrapper.findComponent(TweetMedia);
    expect(media.exists()).toBe(false);
  });

  it('handles like/unlike events and updates state', async () => {
    const tweet = makeTweet({ isLiked: false, likeCount: 5 });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const actions = wrapper.findComponent(TweetActionButtons);

    // Emit like-success event
    await actions.vm.$emit('like-success');
    await wrapper.vm.$nextTick();

    // Access the reactive tweet ref
    const vm = wrapper.vm as unknown as TweetViewVM;
    expect(vm.tweet.value.isLiked).toBe(true);
    expect(vm.tweet.value.likeCount).toBe(6);

    // Emit unlike-success event
    await actions.vm.$emit('unlike-success');
    await wrapper.vm.$nextTick();

    expect(vm.tweet.value.isLiked).toBe(false);
    expect(vm.tweet.value.likeCount).toBe(5);
  });

  it('handles retweet/undo events and updates state', async () => {
    const tweet = makeTweet({ isRetweeted: false, retweetCount: 10 });
    const wrapper = await mountSuspended(TweetView, {
      props: { tweet },
      global: { stubs: { NuxtImg: true, Icon: true } },
    });

    const actions = wrapper.findComponent(TweetActionButtons);

    // Emit retweet-success event
    await actions.vm.$emit('retweet-success');
    await wrapper.vm.$nextTick();

    // Access the reactive tweet ref
    const vm = wrapper.vm as unknown as TweetViewVM;
    expect(vm.tweet.value.isRetweeted).toBe(true);
    expect(vm.tweet.value.retweetCount).toBe(11);

    // Emit undo-retweet-success event
    await actions.vm.$emit('undo-retweet-success');
    await wrapper.vm.$nextTick();

    expect(vm.tweet.value.isRetweeted).toBe(false);
    expect(vm.tweet.value.retweetCount).toBe(10);
  });
});
