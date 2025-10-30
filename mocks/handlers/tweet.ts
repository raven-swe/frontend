import { http, HttpResponse } from 'msw';
import type { Tweet } from '../../shared/types/tweets';
import tweetsData from '../data/tweet.json' assert { type: 'json' };
import type { ApiSuccessResponse } from '#shared/types/api';

const API_URL = process.env.BACKEND_URL;
const initialTweets = (tweetsData as unknown as Tweet[]) || [];
const tweets = new Map<string, Tweet>(initialTweets.map((t) => [t.id, { ...t }]));

const getTweet = (id: string) => tweets.get(id);

const likeTweet = (t: Tweet) => {
  if (!t.isLiked) {
    t.isLiked = true;
    t.likeCount += 1;
  }
};

const unlikeTweet = (t: Tweet) => {
  if (t.isLiked) {
    t.isLiked = false;
    t.likeCount = Math.max(0, t.likeCount - 1);
  }
};

const retweet = (t: Tweet) => {
  if (!t.isRetweeted) {
    t.isRetweeted = true;
    t.retweetCount += 1;
  }
};

const unretweet = (t: Tweet) => {
  if (t.isRetweeted) {
    t.isRetweeted = false;
    t.retweetCount = Math.max(0, t.retweetCount - 1);
  }
};

export const handlers = [
  // Get All Tweets
  http.get(`${API_URL}/tweets`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Tweets fetched successfully.',
        data: Array.from(tweets.values()),
      },
      { status: 200 },
    );
  }),

  // GET /tweets/:id — fetch a tweet by id
  http.get(`${API_URL}/tweets/:id`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    return HttpResponse.json(
      {
        success: true,
        message: 'Tweet fetched successfully.',
        data: tweet,
      },
      { status: 200 },
    );
  }),

  // POST /tweets/:id/like — like a tweet
  http.post(`${API_URL}/tweets/:id/like`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    if (tweet.isLiked) {
      return HttpResponse.json({ message: 'Tweet already liked.' }, { status: 409 });
    }
    likeTweet(tweet);
    return HttpResponse.json(
      { success: true, message: 'Tweet liked successfully.' },
      { status: 200 },
    );
  }),

  // DELETE /tweets/:id/like — unlike a tweet
  http.delete(`${API_URL}/tweets/:id/like`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    if (!tweet.isLiked) {
      return HttpResponse.json({ message: 'Tweet is not liked.' }, { status: 400 });
    }
    unlikeTweet(tweet);
    return HttpResponse.json(
      { success: true, message: 'Tweet unliked successfully.' },
      { status: 200 },
    );
  }),

  // POST /tweets/:id/retweet — retweet a tweet
  http.post(`${API_URL}/tweets/:id/retweet`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    if (tweet.isRetweeted) {
      return HttpResponse.json({ message: 'Tweet already retweeted.' }, { status: 409 });
    }
    retweet(tweet);
    return HttpResponse.json(
      { success: true, message: 'Tweet retweeted successfully.' },
      { status: 200 },
    );
  }),

  // DELETE /tweets/:id/retweet — undo retweet
  http.delete(`${API_URL}/tweets/:id/retweet`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    if (!tweet.isRetweeted) {
      return HttpResponse.json({ message: 'Tweet is not retweeted.' }, { status: 400 });
    }
    unretweet(tweet);
    return HttpResponse.json(
      { success: true, message: 'Retweet undone successfully.' },
      { status: 200 },
    );
  }),

  // GET /timeline/for-you
  http.get(`${API_URL}/timeline/for-you`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || null;
    const limit = Number(url.searchParams.get('limit') || '20');

    const allTweets = Array.from(tweets.values());
    const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
    const paginatedTweets = allTweets.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + paginatedTweets.length;
    const nextCursor = nextIndex < allTweets.length ? String(nextIndex) : null;

    return HttpResponse.json(
      {
        success: true,
        message: 'Timeline fetched successfully.',
        data: {
          data: paginatedTweets,
          pagination: {
            cursor: String(startIndex),
            nextCursor,
            hasNextPage: !!nextCursor,
          },
        },
      } as ApiSuccessResponse<{
        data: Tweet[];
        pagination: { cursor: string; nextCursor: string | null; hasNextPage: boolean };
      }>,
      { status: 200 },
    );
  }),
];
