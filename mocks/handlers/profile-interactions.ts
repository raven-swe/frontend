import { http, HttpResponse } from 'msw';
import type { ApiSuccessResponse, ApiErrorResponse, ApiResponseBase } from '~~/shared/types/api';
import type { CompactUser, User } from '#shared/types/user';
import { mockUserInfos, users } from './mockUserDB';

type ModifiedCompactUser = CompactUser & {
  isFollowing: boolean;
  followsYou: boolean;
  isBlocked: boolean;
};

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.post<{ username: string }>(`${API_URL}/users/:username/following`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username.toLowerCase()];
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
    mockUserInfos[username.toLowerCase()] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully followed user "${username}".`,
    });
  }),

  http.delete<{ username: string }>(`${API_URL}/users/:username/following`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username.toLowerCase()];
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
    mockUserInfos[username.toLowerCase()] = user;
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
    const user = mockUserInfos[username.toLowerCase()];

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
    const paginatedFollowers: ModifiedCompactUser[] = followers
      .slice(startIndex, startIndex + limit)
      .map((u) => {
        return {
          ...u,
          isFollowing: u.relationship.following ?? false,
          followsYou: u.relationship.follower ?? false,
          isBlocked: u.relationship.blocking ?? false,
        };
      });
    const nextIndex = startIndex + paginatedFollowers.length;
    const nextCursor = nextIndex < followers.length ? String(nextIndex) : null;

    return HttpResponse.json<ApiSuccessResponse<ModifiedCompactUser[]>>({
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
    const paginatedFollowing: ModifiedCompactUser[] = following
      .slice(startIndex, startIndex + limit)
      .map((u) => {
        return {
          ...u,
          isFollowing: u.relationship.following ?? false,
          followsYou: u.relationship.follower ?? false,
          isBlocked: u.relationship.blocking ?? false,
        };
      });
    const nextIndex = startIndex + paginatedFollowing.length;
    const nextCursor = nextIndex < following.length ? String(nextIndex) : null;

    return HttpResponse.json<ApiSuccessResponse<ModifiedCompactUser[]>>({
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
    const user = mockUserInfos[username.toLowerCase()];
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
    mockUserInfos[username.toLowerCase()] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully muted user "${username}".`,
    });
  }),

  http.delete<{ username: string }>(`${API_URL}/me/mutes/:username`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username.toLowerCase()];
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
    mockUserInfos[username.toLowerCase()] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully unmuted user "${username}".`,
    });
  }),

  http.post<{ username: string }>(`${API_URL}/me/blocks/:username`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username.toLowerCase()];
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
    mockUserInfos[username.toLowerCase()] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully blocked user "${username}".`,
    });
  }),

  http.delete<{ username: string }>(`${API_URL}/me/blocks/:username`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { username } = params;
    const user = mockUserInfos[username.toLowerCase()];
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
    mockUserInfos[username.toLowerCase()] = user;
    return HttpResponse.json<ApiResponseBase>({
      success: true,
      message: `Successfully unblocked user "${username}".`,
    });
  }),

  http.get(`${API_URL}/me/settings/mutes`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || null;
    const limit = Number(url.searchParams.get('limit') || '20');
    console.log('Fetching muted users with cursor:', cursor, 'and limit:', limit);

    const mutedUsers = users;
    const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
    const paginatedMutedUsers = mutedUsers.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + paginatedMutedUsers.length;
    const nextCursor = nextIndex < mutedUsers.length ? String(nextIndex) : null;

    return HttpResponse.json<ApiSuccessResponse<User[]>>({
      success: true,
      data: paginatedMutedUsers,
      pagination: {
        cursor: String(startIndex),
        nextCursor,
        hasNextPage: !!nextCursor,
      },
    });
  }),

  http.get(`${API_URL}/me/settings/blocks`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || null;
    const limit = Number(url.searchParams.get('limit') || '20');

    const blockedUsers = users;
    const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
    const paginatedBlockedUsers = blockedUsers.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + paginatedBlockedUsers.length;
    const nextCursor = nextIndex < blockedUsers.length ? String(nextIndex) : null;

    return HttpResponse.json<ApiSuccessResponse<User[]>>({
      success: true,
      data: paginatedBlockedUsers,
      pagination: {
        cursor: String(startIndex),
        nextCursor,
        hasNextPage: !!nextCursor,
      },
    });
  }),
];
