import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetActionButtons from '@/components/tweet/TweetActionButtons.vue';
import Button from '@/components/ui/Button.vue';
import type { Tweet } from '~~/shared/types/tweets';

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

describe('TweetActionButtons', () => {
  it('renders reply, retweet, like counts and share button', async () => {
    const tweet = makeTweet({ replyCount: 5, retweetCount: 10, likeCount: 20 });
    const wrapper = await mountSuspended(TweetActionButtons, {
      props: { tweet },
      global: { stubs: { Icon: true } },
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
      global: { stubs: { Icon: true } },
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
      global: { stubs: { Icon: true } },
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
});
