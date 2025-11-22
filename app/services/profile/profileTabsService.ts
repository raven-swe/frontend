import { apiFetch } from '~/api';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';

export const profileTabsService = {
  getProfileTweetsPaginated: async (username: string, cursor: string | null, limit?: number) => {
    return await apiFetch(`/api/users/${username}/tweets`, {
      method: 'GET',
      params: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
    });
  },

  getProfileLikedTweetsPaginated: async (
    username: string,
    cursor: string | null,
    limit?: number,
  ) => {
    return await apiFetch(`/api/users/${username}/likes`, {
      method: 'GET',
      params: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
    });
  },
  getProfileRepliesPaginated: async (username: string, cursor: string | null, limit?: number) => {
    return await apiFetch(`/api/users/${username}/replies`, {
      method: 'GET',
      params: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
    });
  },
};
