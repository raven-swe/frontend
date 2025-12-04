import { http, HttpResponse } from 'msw';

import { mockUserInfos } from './mockUserDB';
import rawTweets from '../data/mock-tweets.json';
import type { Tweet } from '#shared/types/tweets';
import type { ApiSuccessResponse } from '#shared/types/api';
import * as jwt from 'jsonwebtoken';

const mockTweets = rawTweets as Tweet[];
const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.get<{
    username: string;
  }>(`${API_URL}/users/:username/profile`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const jwtData = jwt.decode(token || '') as { username: string } | null;
    const username = params.username as string;
    const user = mockUserInfos[username.toLowerCase()];
    const isCurrentUser = jwtData?.username?.toLowerCase() === username.toLowerCase();
    if (user) {
      if (isCurrentUser) {
        user.relationship = {
          following: false,
          muted: false,
          blockedBy: false,
          blocking: false,
          follower: false,
        };
      }
      return HttpResponse.json(
        {
          success: true,
          message: 'User profile fetched successfully',
          data: user,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'The requested user does not exist',
          },
        },
        { status: 404 },
      );
    }
  }),

  http.get<{
    username: string;
  }>(`${API_URL}/users/:username/tweets`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const url = new URL(request.url);
    const username = params.username;
    const user = mockUserInfos[username.toLowerCase()];
    const limit = Number(url.searchParams.get('limit') || '20');
    if (user) {
      const likedTweets = mockTweets.filter(
        (tweet) => tweet.author.username.toLowerCase() === username.toLowerCase(),
      );
      const cursor = url.searchParams.get('cursor') || null;
      const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
      const paginatedTweets = likedTweets.slice(startIndex, startIndex + limit);
      const nextIndex = startIndex + paginatedTweets.length;
      const nextCursor = nextIndex < likedTweets.length ? String(nextIndex) : null;
      return HttpResponse.json<ApiSuccessResponse<Tweet[]>>(
        {
          success: true,
          message: 'User liked tweets fetched successfully',
          data: paginatedTweets,
          pagination: {
            cursor: String(startIndex),
            nextCursor,
            hasNextPage: !!nextCursor,
          },
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'The requested user does not exist',
          },
        },
        { status: 404 },
      );
    }
  }),

  http.get<{
    username: string;
  }>(`${API_URL}/users/:username/likes`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const url = new URL(request.url);
    const username = params.username;
    const user = mockUserInfos[username.toLowerCase()];
    const limit = Number(url.searchParams.get('limit') || '20');
    if (user) {
      const likedTweets = mockTweets.filter((tweet) => tweet.isLiked);
      const cursor = url.searchParams.get('cursor') || null;
      const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
      const paginatedTweets = likedTweets.slice(startIndex, startIndex + limit);
      const nextIndex = startIndex + paginatedTweets.length;
      const nextCursor = nextIndex < likedTweets.length ? String(nextIndex) : null;
      return HttpResponse.json<ApiSuccessResponse<Tweet[]>>(
        {
          success: true,
          message: 'User liked tweets fetched successfully',
          data: paginatedTweets,
          pagination: {
            cursor: String(startIndex),
            nextCursor,
            hasNextPage: !!nextCursor,
          },
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'The requested user does not exist',
          },
        },
        { status: 404 },
      );
    }
  }),

  http.get<{
    username: string;
  }>(`${API_URL}/users/:username/replies`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const url = new URL(request.url);
    const username = params.username;
    const user = mockUserInfos[username.toLowerCase()];
    const limit = Number(url.searchParams.get('limit') || '20');
    if (user) {
      const userReplies = mockTweets.filter(
        (tweet) =>
          tweet.author.username.toLowerCase() === username.toLowerCase() && tweet.isReplyToTweetId,
      );
      const cursor = url.searchParams.get('cursor') || null;
      const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
      const paginatedTweets = userReplies.slice(startIndex, startIndex + limit);
      const nextIndex = startIndex + paginatedTweets.length;
      const nextCursor = nextIndex < userReplies.length ? String(nextIndex) : null;
      return HttpResponse.json<ApiSuccessResponse<Tweet[]>>(
        {
          success: true,
          message: 'User replies fetched successfully',
          data: paginatedTweets,
          pagination: {
            cursor: String(startIndex),
            nextCursor,
            hasNextPage: !!nextCursor,
          },
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'The requested user does not exist',
          },
        },
        { status: 404 },
      );
    }
  }),
];
