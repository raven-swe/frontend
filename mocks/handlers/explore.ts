import { http, HttpResponse } from 'msw';
import type { TrendingHashtag } from '../../shared/types/hashtag';
import type { ExploreTab } from '../../shared/types/timeline';
import hashtagsData from '../data/mock-hashtags-categorized.json' assert { type: 'json' };

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
        data: {
          trendingHashtags: categorizedHashtags.trending || [],
        },
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
        data: {
          trendingHashtags: categorizedHashtags.news || [],
        },
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
        data: {
          trendingHashtags: categorizedHashtags.sports || [],
        },
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
        data: {
          trendingHashtags: categorizedHashtags.entertainment || [],
        },
      },
      { status: 200 },
    );
  }),

  // GET /explore/for-you
  http.get(`${API_URL}/explore/for-you`, () => {
    const mixedHashtags = [
      ...categorizedHashtags.trending.slice(0, 2),
      ...categorizedHashtags.news.slice(0, 1),
      ...categorizedHashtags.sports.slice(0, 1),
      ...categorizedHashtags.entertainment.slice(0, 1),
    ];
    return HttpResponse.json(
      {
        success: true,
        message: 'For you content fetched successfully.',
        data: {
          trendingHashtags: mixedHashtags,
        },
      },
      { status: 200 },
    );
  }),
];
