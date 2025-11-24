import { apiFetch } from '~/api';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';
import type { Tab } from '~~/shared/types/profile-tabs';

export const profileTabsService = {
  getProfileTweetsPaginated: async (
    username: string,
    tab: Tab,
    cursor: string | null,
    limit?: number,
  ) => {
    const endpoint: `/api/users/${string}/${Tab | 'tweets'}` =
      tab === '' ? `/api/users/${username}/tweets` : `/api/users/${username}/${tab}`;
    return await apiFetch(endpoint, {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
    });
  },
};
