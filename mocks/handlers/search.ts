import { http, HttpResponse } from 'msw';
import type { TrendingHashtag } from '../../shared/types/hashtag';
import hashtagsData from '../data/mock-hashtags-categorized.json' assert { type: 'json' };
import usersData from '../data/mock-users.json' assert { type: 'json' };
import tweetsData from '../data/mock-tweets.json' assert { type: 'json' };

const API_URL = process.env.BACKEND_URL;

// Type-safe access to the categorized hashtags
const categorizedHashtags = hashtagsData as Record<string, TrendingHashtag[]>;
const allHashtags = [
  ...categorizedHashtags.trending,
  ...categorizedHashtags.news,
  ...categorizedHashtags.sports,
  ...categorizedHashtags.entertainment,
];

export const handlers = [
  // GET /search/hashtags/top - Get top 3 hashtags matching query
  http.get(`${API_URL}/search/hashtags/top`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';

    if (!query.trim()) {
      return HttpResponse.json(
        {
          success: true,
          message: 'Top hashtags fetched successfully.',
          data: [],
        },
        { status: 200 },
      );
    }

    // Filter hashtags that match the query (case-insensitive)
    const matchedHashtags = allHashtags
      .filter((hashtag) => hashtag.hashtag.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map((h) => `#${h.hashtag}`);

    return HttpResponse.json(
      {
        success: true,
        message: 'Top hashtags fetched successfully.',
        data: matchedHashtags,
      },
      { status: 200 },
    );
  }),

  // GET /search/users - Get top 10 users matching query
  http.get(`${API_URL}/search/users`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const cursor = url.searchParams.get('cursor');

    if (!query.trim()) {
      return HttpResponse.json(
        {
          success: true,
          message: 'Users fetched successfully.',
          data: [],
          pagination: {
            hasNextPage: false,
            nextCursor: null,
          },
        },
        { status: 200 },
      );
    }

    // Filter users that match the query (username or display name)
    const matchedUsers = usersData.filter(
      (user) =>
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase()),
    );

    // Simple pagination
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit;
    const paginatedUsers = matchedUsers.slice(startIndex, endIndex);
    const hasNextPage = endIndex < matchedUsers.length;

    // Map to the expected User type
    const users = paginatedUsers.map((user) => ({
      id: user.username,
      username: user.username,
      name: user.displayName,
      profileImage: user.avatarUrl,
      bio: user.bio,
    }));

    return HttpResponse.json(
      {
        success: true,
        message: 'Users fetched successfully.',
        data: users,
        pagination: {
          hasNextPage,
          nextCursor: hasNextPage ? endIndex.toString() : null,
        },
      },
      { status: 200 },
    );
  }),

  // GET /search/tweets - Search tweets by query and tab
  http.get(`${API_URL}/search/tweets`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const tab = url.searchParams.get('tab') || 'top';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const cursor = url.searchParams.get('cursor');

    if (!query.trim()) {
      return HttpResponse.json(
        {
          success: true,
          message: 'Tweets fetched successfully.',
          data: [],
          pagination: {
            hasNextPage: false,
            nextCursor: null,
          },
        },
        { status: 200 },
      );
    }

    // Filter tweets that match the query (content, hashtags, or mentions)
    const matchedTweets = tweetsData.filter((tweet) => {
      const contentMatch = tweet.content.toLowerCase().includes(query.toLowerCase());
      const hashtagMatch = tweet.entities?.hashtags?.some((h) =>
        h.hashtag.toLowerCase().includes(query.toLowerCase().replace('#', '')),
      );
      const mentionMatch = tweet.entities?.mentions?.some((m) =>
        m.username.toLowerCase().includes(query.toLowerCase().replace('@', '')),
      );
      return contentMatch || hashtagMatch || mentionMatch;
    });

    // Simple pagination
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit;
    const paginatedTweets = matchedTweets.slice(startIndex, endIndex);
    const hasNextPage = endIndex < matchedTweets.length;

    return HttpResponse.json(
      {
        success: true,
        message: `Tweets fetched successfully for ${tab} tab.`,
        data: paginatedTweets,
        pagination: {
          hasNextPage,
          nextCursor: hasNextPage ? endIndex.toString() : null,
        },
      },
      { status: 200 },
    );
  }),
];
