import { http, HttpResponse } from 'msw';
import type { Tweet } from '../../types/tweets';
import tweetsData from '../data/tweet.json' assert { type: 'json' };

const API_URL = '';
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
];
