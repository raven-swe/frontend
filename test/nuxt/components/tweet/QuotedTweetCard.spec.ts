import QuotedTweetCard from '~/components/tweet/QuotedTweetCard.vue';
import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

describe('QuotedTweetCard', () => {
  it('shows quote if not deleted', async () => {
    const wrapper = await mountSuspended(QuotedTweetCard, {
      props: {
        tweet: {
          id: '1',
          content: 'This is a quoted tweet',
        },
      },
      global: {
        stubs: {
          TweetQuoteCard: { template: '<div class="tweet-quote-card">Quoted Tweet Content</div>' },
          DeletedTweetPlaceholder: {
            template: '<div class="deleted-tweet-placeholder">Deleted Tweet</div>',
          },
        },
      },
    });
    expect(wrapper.find('.tweet-quote-card').exists()).toBe(true);
    expect(wrapper.find('.deleted-tweet-placeholder').exists()).toBe(false);
  });

  it('shows deleted placeholder if quote is deleted', async () => {
    const wrapper = await mountSuspended(QuotedTweetCard, {
      props: {
        tweet: { isDeleted: true },
      },
      global: {
        stubs: {
          TweetQuoteCard: { template: '<div class="tweet-quote-card">Quoted Tweet Content</div>' },
          DeletedTweetPlaceholder: {
            template: '<div class="deleted-tweet-placeholder">Deleted Tweet</div>',
          },
        },
      },
    });
    expect(wrapper.find('.tweet-quote-card').exists()).toBe(false);
    expect(wrapper.find('.deleted-tweet-placeholder').exists()).toBe(true);
  });
});
