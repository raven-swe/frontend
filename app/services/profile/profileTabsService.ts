import { apiFetch } from '~/api';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';

export const profileTabsService = {
  getProfile: async (username: string, signal?: AbortSignal) => {
    return (await apiFetch(`/api/users/${username}/profile`, { method: 'GET', signal })).data;
  },

  getProfileTweetsPaginated: async (
    username: string,
    tab: 'replies' | 'tweets' | 'likes' | 'media',
    cursor: string | null,
    limit?: number,
  ) => {
    return await apiFetch(`/api/users/${username}/${tab}`, {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
    });
  },

  getFollowersPaginated: async ({
    username,
    cursor,
    limit,
    signal,
  }: {
    username: string;
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch(`/api/users/${username}/followers`, {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },

  getFollowingPaginated: async ({
    username,
    cursor,
    limit,
    signal,
  }: {
    username: string;
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch(`/api/users/${username}/following`, {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },

  getMutualFollowersPaginated: async ({
    username,
    cursor,
    limit,
    signal,
  }: {
    username: string;
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch(`/api/users/${username}/mutual`, {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },
};
