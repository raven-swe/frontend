import { http, HttpResponse } from 'msw';
import type { TrendingHashtag } from '../../shared/types/hashtag';
import type { ExploreTab } from '../../shared/types/timeline';
import hashtagsData from '../data/mock-hashtags-categorized.json' assert { type: 'json' };
import tweetsData from '../data/mock-tweets.json' assert { type: 'json' };
import { faker } from '@faker-js/faker';

const API_URL = process.env.BACKEND_URL;

// Type-safe access to the categorized hashtags
const categorizedHashtags = hashtagsData as Record<ExploreTab, TrendingHashtag[]>;

export const handlers = [
  // GET /explore/trending
  http.get(`${API_URL}/explore/trending`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Trending hashtags fetched successfully.',
        data: categorizedHashtags.trending || [],
      },
      { status: 200 },
    );
  }),

  // GET /explore/news
  http.get(`${API_URL}/explore/news`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'News hashtags fetched successfully.',
        data: categorizedHashtags.news || [],
      },
      { status: 200 },
    );
  }),

  // GET /explore/sports
  http.get(`${API_URL}/explore/sports`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Sports hashtags fetched successfully.',
        data: categorizedHashtags.sports || [],
      },
      { status: 200 },
    );
  }),

  // GET /explore/entertainment
  http.get(`${API_URL}/explore/entertainment`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Entertainment hashtags fetched successfully.',
        data: categorizedHashtags.entertainment || [],
      },
      { status: 200 },
    );
  }),

  // GET /explore/for-you
  http.get(`${API_URL}/explore/for-you`, () => {
    const categories = ['news', 'sports', 'entertainment'];

    const categoriesData = categories.map((category) => {
      // Get random number of tweets between 3 and 5
      const tweetCount = faker.number.int({ min: 3, max: 5 });
      // Get random tweets from the mock data
      const shuffledTweets = faker.helpers.shuffle([...tweetsData]);
      const tweets = shuffledTweets.slice(0, tweetCount);

      return {
        category,
        tweets,
      };
    });

    return HttpResponse.json(
      {
        success: true,
        message: 'For you content fetched successfully.',
        data: { categories: categoriesData },
      },
      { status: 200 },
    );
  }),
];
