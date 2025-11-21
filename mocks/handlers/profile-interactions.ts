import { http, HttpResponse } from 'msw';
import type { ApiSuccessResponse, ApiErrorResponse, ApiResponseBase } from '~~/shared/types/api';
import type { User } from '#shared/types/user';
import { mockUserInfos, users } from './mockUserDB';

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.post<{ username: string }>(`${API_URL}/users/:username/following`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username];
    if (!user) {
      return HttpResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: { message: `User with username "${username}" not found.`, code: 'USER_NOT_FOUND' },
        },
        { status: 404 },
      );
    }
    user.relationship.following = true;
    user.followersCount += 1;
    mockUserInfos[username] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully followed user "${username}".`,
    });
  }),

  http.delete<{ username: string }>(`${API_URL}/users/:username/following`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username];
    if (!user) {
      return HttpResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: { message: `User with username "${username}" not found.`, code: 'USER_NOT_FOUND' },
        },
        { status: 404 },
      );
    }
    user.relationship.following = false;
    user.followersCount = Math.max(0, user.followersCount - 1);
    mockUserInfos[username] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully unfollowed user "${username}".`,
    });
  }),

  http.get<{ username: string }>(`${API_URL}/users/:username/followers`, ({ request, params }) => {
    const { username } = params;
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || null;
    const limit = Number(url.searchParams.get('limit') || '20');
    const user = mockUserInfos[username];

    if (!user) {
      return HttpResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: { message: `User with username "${username}" not found.`, code: 'USER_NOT_FOUND' },
        },
        { status: 404 },
      );
    }
    const followers = users;
    const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
    const paginatedFollowers = followers.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + paginatedFollowers.length;
    const nextCursor = nextIndex < followers.length ? String(nextIndex) : null;

    return HttpResponse.json<ApiSuccessResponse<User[]>>({
      success: true,
      data: paginatedFollowers,
      pagination: {
        cursor: String(startIndex),
        nextCursor,
        hasNextPage: !!nextCursor,
      },
    });
  }),

  http.get<{ username: string }>(`${API_URL}/users/:username/following`, ({ request, params }) => {
    const { username } = params;
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || null;
    const limit = Number(url.searchParams.get('limit') || '20');
    const user = users.find((u) => u.username === username);
    if (!user) {
      return HttpResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: { message: `User with username "${username}" not found.`, code: 'USER_NOT_FOUND' },
        },
        { status: 404 },
      );
    }
    const following = users;
    const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
    const paginatedFollowing = following.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + paginatedFollowing.length;
    const nextCursor = nextIndex < following.length ? String(nextIndex) : null;

    return HttpResponse.json<ApiSuccessResponse<User[]>>({
      success: true,
      data: paginatedFollowing,
      pagination: {
        cursor: String(startIndex),
        nextCursor,
        hasNextPage: !!nextCursor,
      },
    });
  }),

  http.post<{ username: string }>(`${API_URL}/me/mutes/:username`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username];
    if (!user) {
      return HttpResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: { message: `User with username "${username}" not found.`, code: 'USER_NOT_FOUND' },
        },
        { status: 404 },
      );
    }
    user.relationship.muted = true;
    mockUserInfos[username] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully muted user "${username}".`,
    });
  }),

  http.delete<{ username: string }>(`${API_URL}/me/mutes/:username`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username];
    if (!user) {
      return HttpResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: { message: `User with username "${username}" not found.`, code: 'USER_NOT_FOUND' },
        },
        { status: 404 },
      );
    }
    user.relationship.muted = false;
    mockUserInfos[username] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully unmuted user "${username}".`,
    });
  }),

  http.post<{ username: string }>(`${API_URL}/me/blocks/:username`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username];
    if (!user) {
      return HttpResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: { message: `User with username "${username}" not found.`, code: 'USER_NOT_FOUND' },
        },
        { status: 404 },
      );
    }
    user.relationship.blocking = true;
    mockUserInfos[username] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully blocked user "${username}".`,
    });
  }),

  http.delete<{ username: string }>(`${API_URL}/me/blocks/:username`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username];
    if (!user) {
      return HttpResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: { message: `User with username "${username}" not found.`, code: 'USER_NOT_FOUND' },
        },
        { status: 404 },
      );
    }
    user.relationship.blocking = false;
    mockUserInfos[username] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully unblocked user "${username}".`,
    });
  }),
];
